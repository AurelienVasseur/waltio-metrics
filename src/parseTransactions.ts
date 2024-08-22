import { TransactionFromWaltio } from "./types/transactionFromWaltio";
import { config } from "./config";

// Define a common type for token data and historic entries
type TokenDataEntry = {
  cashIn: number;
  cashOut: number;
  totalBuy: number;
  totalSell: number;
  pnlRealized: number;
  unitPrice: number;
};

// Define the structure for token data, including historic entries
type TokenData = TokenDataEntry & {
  quantity: {
    computed: number;
    expected: number | undefined;
    delta: number | undefined;
    deltaPercent: number | undefined;
  };
  historic: Array<
    TokenDataEntry & {
      quantity: number;
      date: string;
      cashInDelta: number;
      cashOutDelta: number;
      totalBuyDelta: number;
      totalSellDelta: number;
      transaction: TransactionFromWaltio;
    }
  >;
};

type GroupDataEntry = {
  cashIn: number;
  cashOut: number;
  totalBuy: number;
  totalSell: number;
  pnlRealized: number;
};

type GroupData = GroupDataEntry & {
  tokens: string[];
  historic: Array<
    GroupDataEntry & {
      date: string;
      transaction: TransactionFromWaltio;
    }
  >;
};

type Result = {
  overview: {
    cashIn: number;
    cashOut: number;
    fees: number;
  };
  groups: Record<string, GroupData>;
  tokens: {
    [token: string]: TokenData;
  };
};

// const fiatTokens = ["USD", "EUR"];

/**
 * Checks if a transaction is relevant for fiat investment calculations.
 * @param transaction - A transaction from Waltio.
 * @returns True if the transaction is a deposit with the label "Achat de crypto" or an exchange involving USD/EUR as the sent token.
 */
function isFiatInvestmentTransaction(
  transaction: TransactionFromWaltio
): boolean {
  return (
    (transaction.type === "Échange" &&
      transaction.tokenSent &&
      config.fiatTokens.includes(transaction.tokenSent)) ||
    (transaction.type === "Dépôt" && transaction.label === "Achat de crypto")
  );
}

/**
 * Checks if a transaction is relevant for total investment calculations.
 * @param transaction - A transaction from Waltio.
 * @returns True if the transaction is a deposit with the label "Achat de crypto" or an exchange.
 */
function isRelevantInvestmentTransaction(
  transaction: TransactionFromWaltio
): boolean {
  return (
    transaction.type === "Échange" ||
    (transaction.type === "Dépôt" && transaction.label === "Achat de crypto")
  );
}

/**
 * Initializes token data if it does not exist.
 * @param tokens - An object containing the data for each token.
 * @param token - The token to initialize.
 */
function initializeTokenData(
  tokens: Record<string, TokenData>,
  token: string
): void {
  if (!tokens[token]) {
    const expectedQuantity = config.expectedQuantities[token];
    tokens[token] = {
      quantity: {
        computed: 0,
        expected: expectedQuantity !== undefined ? expectedQuantity : undefined,
        delta: undefined,
        deltaPercent: undefined,
      },
      cashIn: 0,
      cashOut: 0,
      totalBuy: 0,
      totalSell: 0,
      pnlRealized: 0,
      unitPrice: 0,
      historic: [],
    };
  }
}

/**
 * Calculates pnlRealized and unitPrice for a token.
 * @param tokenData - The data of the token to calculate for.
 * @returns An object containing pnlRealized and unitPrice.
 */
function calculatePnlAndUnitPrice(tokenData: TokenData) {
  const pnlRealized = tokenData.totalSell - tokenData.totalBuy;
  const unitPrice =
    pnlRealized > 0
      ? 0
      : tokenData.quantity.computed !== 0
      ? Math.abs(pnlRealized) / tokenData.quantity.computed
      : 0;

  return { pnlRealized, unitPrice };
}

/**
 * Adds an entry to the token's historic data.
 * @param tokenData - The data of the token to update.
 * @param date - The date of the transaction.
 * @param transaction - The transaction details.
 */
function addHistoricEntry(
  tokenData: TokenData,
  date: string,
  transaction: TransactionFromWaltio
): void {
  const { pnlRealized, unitPrice } = calculatePnlAndUnitPrice(tokenData);
  const lastHistoricEntry = tokenData.historic[tokenData.historic.length - 1];

  const cashInDelta = tokenData.cashIn - (lastHistoricEntry?.cashIn || 0);
  const cashOutDelta = tokenData.cashOut - (lastHistoricEntry?.cashOut || 0);
  const totalBuyDelta = tokenData.totalBuy - (lastHistoricEntry?.totalBuy || 0);
  const totalSellDelta =
    tokenData.totalSell - (lastHistoricEntry?.totalSell || 0);

  tokenData.historic.push({
    date,
    quantity: tokenData.quantity.computed,
    totalBuy: tokenData.totalBuy,
    totalBuyDelta,
    totalSell: tokenData.totalSell,
    totalSellDelta,
    cashIn: tokenData.cashIn,
    cashInDelta,
    cashOut: tokenData.cashOut,
    cashOutDelta,
    pnlRealized,
    unitPrice,
    transaction, // Add transaction details
  });
}

/**
 * Updates the token data with the investment information.
 * @param transaction - A transaction from Waltio.
 * @param tokens - An object containing the data for each token.
 */
function updateInvestmentData(
  transaction: TransactionFromWaltio,
  tokens: Record<string, TokenData>
): void {
  if (
    transaction.amountReceived &&
    transaction.priceTokenReceived &&
    transaction.tokenReceived
  ) {
    const tokenReceived = transaction.tokenReceived;
    const amountReceived = transaction.amountReceived;
    const priceTokenReceived = transaction.priceTokenReceived;

    // Calculate fiat value of the received amount
    const totalValueReceived = amountReceived * priceTokenReceived;

    initializeTokenData(tokens, tokenReceived);

    const tokenData = tokens[tokenReceived]!;
    tokenData.totalBuy += totalValueReceived; // Update totalBuy
    if (isFiatInvestmentTransaction(transaction)) {
      const fiatValueReceived = amountReceived * priceTokenReceived;
      tokenData.cashIn += fiatValueReceived; // Update cashIn
    }
  }
}

/**
 * Updates the token data with the sell information.
 * @param transaction - A transaction from Waltio.
 * @param tokens - An object containing the data for each token.
 */
function updateSellData(
  transaction: TransactionFromWaltio,
  tokens: Record<string, TokenData>
): void {
  if (
    transaction.type === "Échange" &&
    transaction.amountSent &&
    transaction.priceTokenSent &&
    transaction.tokenSent
  ) {
    const tokenSent = transaction.tokenSent;
    const amountSent = transaction.amountSent;
    const priceTokenSent = transaction.priceTokenSent;

    // Calculate fiat value of the sent amount
    const totalValueSent = amountSent * priceTokenSent;

    initializeTokenData(tokens, tokenSent);

    const tokenData = tokens[tokenSent]!;
    tokenData.totalSell += totalValueSent; // Update totalSell
  }
}

/**
 * Updates the token data with the cash out information.
 * @param transaction - A transaction from Waltio.
 * @param tokens - An object containing the data for each token.
 */
function updateCashOutData(
  transaction: TransactionFromWaltio,
  tokens: Record<string, TokenData>
): void {
  if (
    transaction.type === "Échange" &&
    transaction.amountReceived &&
    transaction.priceTokenReceived &&
    transaction.tokenReceived &&
    transaction.tokenSent &&
    transaction.amountSent &&
    transaction.priceTokenSent &&
    config.fiatTokens.includes(transaction.tokenReceived)
  ) {
    const tokenSent = transaction.tokenSent;
    const amountSent = transaction.amountSent;
    const priceTokenSent = transaction.priceTokenSent;

    // Calculate fiat value of the sent amount
    const totalValueSent = amountSent * priceTokenSent;

    initializeTokenData(tokens, tokenSent);

    const tokenData = tokens[tokenSent]!;
    tokenData.cashOut += totalValueSent; // Update cashOut
  }
}

/**
 * Updates the token data with the fees information.
 * @param transaction - A transaction from Waltio.
 * @param totalFees - A reference to the total fees.
 */
function updateFeesData(
  transaction: TransactionFromWaltio,
  totalFees: { value: number }
): void {
  if (transaction.fees && transaction.priceTokenFees) {
    const feeValue = transaction.fees * transaction.priceTokenFees;
    totalFees.value += feeValue;
  }
}

/**
 * Updates the token data with the quantity information.
 * @param transaction - A transaction from Waltio.
 * @param tokens - An object containing the data for each token.
 * @param date - The date of the transaction.
 */
function updateQuantityData(
  transaction: TransactionFromWaltio,
  tokens: Record<string, TokenData>,
  date: string
): void {
  let quantityChanged = false;
  const updatedTokens = new Set<string>();

  // Update quantity for received tokens
  if (transaction.amountReceived && transaction.tokenReceived) {
    const tokenReceived = transaction.tokenReceived;
    const amountReceived = transaction.amountReceived;

    initializeTokenData(tokens, tokenReceived);

    tokens[tokenReceived]!.quantity.computed += amountReceived;
    quantityChanged = true;
    updatedTokens.add(tokenReceived);
  }

  // Update quantity for sent tokens
  if (transaction.amountSent && transaction.tokenSent) {
    const tokenSent = transaction.tokenSent;
    const amountSent = transaction.amountSent;

    initializeTokenData(tokens, tokenSent);

    tokens[tokenSent]!.quantity.computed -= amountSent;
    quantityChanged = true;
    updatedTokens.add(tokenSent);
  }

  // Update quantity for fees
  if (transaction.fees && transaction.tokenFees) {
    const tokenFees = transaction.tokenFees;
    const fees = transaction.fees;

    initializeTokenData(tokens, tokenFees);

    tokens[tokenFees]!.quantity.computed -= fees;
    quantityChanged = true;
    updatedTokens.add(tokenFees);
  }

  // Add to historic if quantity changed
  if (quantityChanged) {
    updatedTokens.forEach((token) => {
      addHistoricEntry(tokens[token]!, date, transaction);
    });
  }
}

/**
 * Adds an entry to the group's historic data.
 * @param groupData - The data of the group to update.
 * @param date - The date of the transaction.
 * @param transaction - The transaction details.
 */
function addGroupHistoricEntry(
  groupData: GroupData,
  date: string,
  transaction: TransactionFromWaltio
): void {
  const lastEntry = groupData.historic[groupData.historic.length - 1] || {
    cashIn: 0,
    cashOut: 0,
    totalBuy: 0,
    totalSell: 0,
    pnlRealized: 0,
  };

  groupData.historic.push({
    date,
    cashIn: lastEntry.cashIn,
    cashOut: lastEntry.cashOut,
    totalBuy: lastEntry.totalBuy,
    totalSell: lastEntry.totalSell,
    pnlRealized: lastEntry.pnlRealized,
    transaction,
  });
}

// Function to convert a date string to a Date object
function parseDate(dateString: string) {
  // Split the date and time
  let parts = dateString.split(" ");
  let dateParts = parts[0]!.split("/").map((e) => Number(e));
  let timeParts = parts[1]!.split(":").map((e) => Number(e));

  // Create a new Date object
  return new Date(
    dateParts[2]!, // Year
    dateParts[1]! - 1, // Month (months are zero-indexed)
    dateParts[0], // Day
    timeParts[0], // Hour
    timeParts[1], // Minute
    timeParts[2] // Second
  );
}

/**
 * Parses a list of transactions to generate an investment summary.
 * @param transactions - An array of transactions from Waltio.
 * @returns An investment summary including total fiat invested, total fees, and token data.
 */
function parseTransactions(transactions: TransactionFromWaltio[]): Result {
  const tokens: Record<string, TokenData> = {};
  let totalInvestedFiat = 0;
  let totalFees = { value: 0 };
  let totalCashOut = 0;

  transactions.forEach((transaction) => {
    const isFiatInvestment = isFiatInvestmentTransaction(transaction);
    const isRelevantInvestment = isRelevantInvestmentTransaction(transaction);

    if (
      isFiatInvestment &&
      transaction.amountSent &&
      transaction.priceTokenSent
    ) {
      totalInvestedFiat += transaction.amountSent * transaction.priceTokenSent;
    }

    if (isRelevantInvestment) {
      updateInvestmentData(transaction, tokens);
    }

    if (transaction.type === "Échange") {
      updateSellData(transaction, tokens);
      updateCashOutData(transaction, tokens);
    }

    updateQuantityData(transaction, tokens, transaction.date);
    updateFeesData(transaction, totalFees);
  });

  // Calculate totalInvestedFiat (cashIn) as the sum of cashIn of all tokens
  totalInvestedFiat = Object.values(tokens).reduce(
    (sum, tokenData) => sum + tokenData.cashIn,
    0
  );

  // Calculate totalCashOut as the sum of cashOut of all tokens
  totalCashOut = Object.values(tokens).reduce(
    (sum, tokenData) => sum + tokenData.cashOut,
    0
  );

  // Calculate pnlRealized and unitPrice for each token and update historic
  Object.values(tokens).forEach((tokenData) => {
    const { pnlRealized, unitPrice } = calculatePnlAndUnitPrice(tokenData);
    tokenData.pnlRealized = pnlRealized;
    tokenData.unitPrice = unitPrice;

    // Update delta and deltaPercent
    tokenData.quantity.delta =
      tokenData.quantity.expected !== undefined
        ? tokenData.quantity.computed - tokenData.quantity.expected
        : undefined;

    tokenData.quantity.deltaPercent =
      tokenData.quantity.expected !== undefined
        ? (tokenData.quantity.delta! / tokenData.quantity.expected) * 100
        : undefined;
  });

  // Calculate groups data
  const groups = Object.keys(config.groups).reduce((acc, groupName) => {
    const tokensInGroup = config.groups[groupName]!;
    const groupData: GroupData = {
      tokens: [],
      cashIn: 0,
      cashOut: 0,
      totalBuy: 0,
      totalSell: 0,
      pnlRealized: 0,
      historic: [],
    };

    tokensInGroup.forEach((tokenName) => {
      let token = tokens[tokenName];
      if (token) {
        groupData.tokens.push(tokenName);
        groupData.cashIn += token.cashIn;
        groupData.cashOut += token.cashOut;
        groupData.totalBuy += token.totalBuy;
        groupData.totalSell += token.totalSell;
        groupData.pnlRealized += token.pnlRealized;
      }
    });

    acc[groupName] = groupData;
    return acc;
  }, {} as Record<string, GroupData>);

  // Build the historic for each group
  Object.keys(groups).forEach((groupName) => {
    const groupData = groups[groupName]!;
    const tokensInGroup = config.groups[groupName]!;

    // Collect all historic entries for tokens in this group
    let groupHistoricEntries = tokensInGroup.flatMap((tokenName) =>
      tokens[tokenName] ? tokens[tokenName]!.historic : []
    );

    // Sort the historic entries by date
    const groupHistoricEntriesSorted = groupHistoricEntries.sort(
      (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
    );

    // Build the group's historic
    groupHistoricEntriesSorted.forEach((entry) => {
      const lastEntry = groupData.historic[groupData.historic.length - 1] || {
        cashIn: 0,
        cashOut: 0,
        totalBuy: 0,
        totalSell: 0,
        pnlRealized: 0,
      };

      const newTotalBuy = lastEntry.totalBuy + entry.totalBuyDelta;
      const newTotalSell = lastEntry.totalSell + entry.totalSellDelta;

      groupData.historic.push({
        date: entry.date,
        cashIn: lastEntry.cashIn + entry.cashInDelta,
        cashOut: lastEntry.cashOut + entry.cashOutDelta,
        totalBuy: newTotalBuy,
        totalSell: newTotalSell,
        pnlRealized: newTotalSell - newTotalBuy,
        transaction: entry.transaction,
      });
    });
  });

  return {
    overview: {
      cashIn: totalInvestedFiat,
      cashOut: totalCashOut,
      fees: totalFees.value,
    },
    groups,
    tokens,
  };
}

export default parseTransactions;
