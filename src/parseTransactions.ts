import expectedQuantities from "./expectedQuantities";
import { TransactionFromWaltio } from "./types/transactionFromWaltio";

// Define the structure for quantity data
type QuantityData = {
  computed: number;
  expected: number | undefined;
  delta: number | undefined;
  deltaPercent: number | undefined;
};

// Define the structure for token data
type TokenData = {
  quantity: QuantityData;
  cashIn: number;
  cashOut: number;
  totalBuy: number;
  totalSell: number;
  pnlRealized: number;
  unitPrice: number;
  historic: Array<{
    date: string;
    totalBuy: number;
    totalSell: number;
    quantity: number;
    cashIn: number;
    cashOut: number;
    pnlRealized: number;
    unitPrice: number;
    transaction: TransactionFromWaltio; // Add transaction details
  }>;
};

// Define the structure for the result
type Result = {
  overview: {
    cashIn: number;
    cashOut: number;
    fees: number;
  };
  tokens: {
    [token: string]: TokenData;
  };
};

const fiatTokens = ["USD", "EUR"];

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
      fiatTokens.includes(transaction.tokenSent)) ||
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
    const expectedQuantity = expectedQuantities[token];
    tokens[token] = {
      quantity: {
        computed: 0,
        expected: expectedQuantity,
        delta: expectedQuantity !== undefined ? 0 : undefined,
        deltaPercent: expectedQuantity !== undefined ? 0 : undefined,
      },
      cashIn: 0,
      cashOut: 0,
      totalBuy: 0,
      totalSell: 0,
      pnlRealized: 0,
      unitPrice: 0,
      historic: [], // Initialize historic data
    };
  }
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
  // Calculate pnlRealized and unitPrice for the historic entry
  const pnlRealized = tokenData.totalSell - tokenData.totalBuy;
  const unitPrice =
    pnlRealized > 0
      ? 0
      : tokenData.quantity.computed !== 0
      ? Math.abs(pnlRealized) / tokenData.quantity.computed
      : 0;

  tokenData.historic.push({
    date,
    totalBuy: tokenData.totalBuy,
    totalSell: tokenData.totalSell,
    quantity: tokenData.quantity.computed,
    cashIn: tokenData.cashIn,
    cashOut: tokenData.cashOut,
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
    fiatTokens.includes(transaction.tokenReceived)
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

  // Update quantity for received tokens
  if (transaction.amountReceived && transaction.tokenReceived) {
    const tokenReceived = transaction.tokenReceived;
    const amountReceived = transaction.amountReceived;

    initializeTokenData(tokens, tokenReceived);

    tokens[tokenReceived]!.quantity.computed += amountReceived;
    quantityChanged = true;
  }

  // Update quantity for sent tokens
  if (transaction.amountSent && transaction.tokenSent) {
    const tokenSent = transaction.tokenSent;
    const amountSent = transaction.amountSent;

    initializeTokenData(tokens, tokenSent);

    tokens[tokenSent]!.quantity.computed -= amountSent;
    quantityChanged = true;
  }

  // Update quantity for fees
  if (transaction.fees && transaction.tokenFees) {
    const tokenFees = transaction.tokenFees;
    const fees = transaction.fees;

    initializeTokenData(tokens, tokenFees);

    tokens[tokenFees]!.quantity.computed -= fees;
    quantityChanged = true;
  }

  // Add to historic if quantity changed, ensuring no duplicate entries
  if (quantityChanged) {
    const updatedTokens = new Set<string>();

    if (transaction.amountReceived && transaction.tokenReceived) {
      const tokenReceived = transaction.tokenReceived;
      if (!updatedTokens.has(tokenReceived)) {
        addHistoricEntry(tokens[tokenReceived]!, date, transaction);
        updatedTokens.add(tokenReceived);
      }
    }

    if (transaction.amountSent && transaction.tokenSent) {
      const tokenSent = transaction.tokenSent;
      if (!updatedTokens.has(tokenSent)) {
        addHistoricEntry(tokens[tokenSent]!, date, transaction);
        updatedTokens.add(tokenSent);
      }
    }

    if (transaction.fees && transaction.tokenFees) {
      const tokenFees = transaction.tokenFees;
      if (!updatedTokens.has(tokenFees)) {
        addHistoricEntry(tokens[tokenFees]!, date, transaction);
        updatedTokens.add(tokenFees);
      }
    }
  }
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
    tokenData.pnlRealized = tokenData.totalSell - tokenData.totalBuy;
    tokenData.unitPrice =
      tokenData.pnlRealized > 0
        ? 0
        : tokenData.quantity.computed !== 0
        ? Math.abs(tokenData.pnlRealized) / tokenData.quantity.computed
        : 0;

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

  return {
    overview: {
      cashIn: totalInvestedFiat,
      cashOut: totalCashOut,
      fees: totalFees.value,
    },
    tokens,
  };
}

export default parseTransactions;
