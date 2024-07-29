import { TransactionFromWaltio } from "../types/transactionFromWaltio";

type TokenData = {
  quantity: number;
  cashIn: number;
  cashOut: number;
  totalBuy: number;
  totalSell: number;
  pnlRealized: number;
  unitPrice: number;
  date: string;
};

type Result = {
  overview: {
    cashIn: number;
    cashOut: number;
    fees: number;
  };
  tokens: {
    [token: string]: {
      current: TokenData;
      historic: TokenData[];
    };
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
 * @param date - The date of the transaction.
 */
function initializeTokenData(
  tokens: Record<string, { current: TokenData; historic: TokenData[] }>,
  token: string,
  date: string
): void {
  if (!tokens[token]) {
    tokens[token] = {
      current: {
        quantity: 0,
        cashIn: 0,
        cashOut: 0,
        totalBuy: 0,
        totalSell: 0,
        pnlRealized: 0,
        unitPrice: 0,
        date: date,
      },
      historic: [],
    };
  }
}

/**
 * Adds the current state to the historic data if it has changed.
 * @param tokens - An object containing the data for each token.
 * @param token - The token to update.
 * @param transactionDate - The date of the transaction.
 */
function addHistoricDataIfChanged(
  tokens: Record<string, { current: TokenData; historic: TokenData[] }>,
  token: string,
  previousState: TokenData,
  transactionDate: string
): void {
  const tokenData = tokens[token];
  if (tokenData) {
    const currentState = tokenData.current;
    const hasChanged =
      JSON.stringify(previousState) !== JSON.stringify(currentState);
    if (hasChanged) {
      tokenData.current.date = transactionDate;
      tokenData.historic.push({ ...currentState });
    }
  }
}

/**
 * Updates the token data with the investment information.
 * @param transaction - A transaction from Waltio.
 * @param tokens - An object containing the data for each token.
 */
function updateInvestmentData(
  transaction: TransactionFromWaltio,
  tokens: Record<string, { current: TokenData; historic: TokenData[] }>
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

    initializeTokenData(tokens, tokenReceived, transaction.date);

    const tokenData = tokens[tokenReceived]!.current;
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
  tokens: Record<string, { current: TokenData; historic: TokenData[] }>
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

    initializeTokenData(tokens, tokenSent, transaction.date);

    const tokenData = tokens[tokenSent]!.current;
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
  tokens: Record<string, { current: TokenData; historic: TokenData[] }>
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

    initializeTokenData(tokens, tokenSent, transaction.date);

    const tokenData = tokens[tokenSent]!.current;
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
 */
function updateQuantityData(
  transaction: TransactionFromWaltio,
  tokens: Record<string, { current: TokenData; historic: TokenData[] }>
): void {
  // Update quantity for received tokens
  if (transaction.amountReceived && transaction.tokenReceived) {
    const tokenReceived = transaction.tokenReceived;
    const amountReceived = transaction.amountReceived;

    initializeTokenData(tokens, tokenReceived, transaction.date);

    tokens[tokenReceived]!.current.quantity += amountReceived;
  }

  // Update quantity for sent tokens
  if (transaction.amountSent && transaction.tokenSent) {
    const tokenSent = transaction.tokenSent;
    const amountSent = transaction.amountSent;

    initializeTokenData(tokens, tokenSent, transaction.date);

    tokens[tokenSent]!.current.quantity -= amountSent;
  }

  // Update quantity for fees
  if (transaction.fees && transaction.tokenFees) {
    const tokenFees = transaction.tokenFees;
    const fees = transaction.fees;

    initializeTokenData(tokens, tokenFees, transaction.date);

    tokens[tokenFees]!.current.quantity -= fees;
  }
}

/**
 * Parses a list of transactions to generate an investment summary.
 * @param transactions - An array of transactions from Waltio.
 * @returns An investment summary including total fiat invested, total fees, and token data.
 */
function parseTransactions(transactions: TransactionFromWaltio[]): Result {
  const tokens: Record<string, { current: TokenData; historic: TokenData[] }> =
    {};
  let totalInvestedFiat = 0;
  let totalFees = { value: 0 };
  let totalCashOut = 0;

  // Sort transactions by date
  transactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

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

    const previousStates: Record<string, TokenData> = {};

    if (transaction.tokenReceived) {
      previousStates[transaction.tokenReceived] = {
        ...tokens[transaction.tokenReceived]?.current,
      } as any;
    }
    if (transaction.tokenSent) {
      previousStates[transaction.tokenSent] = {
        ...tokens[transaction.tokenSent]?.current,
      } as any;
    }
    if (transaction.tokenFees) {
      previousStates[transaction.tokenFees] = {
        ...tokens[transaction.tokenFees]?.current,
      } as any;
    }

    if (isRelevantInvestment) {
      updateInvestmentData(transaction, tokens);
    }

    if (transaction.type === "Échange") {
      updateSellData(transaction, tokens);
      updateCashOutData(transaction, tokens);
    }

    updateQuantityData(transaction, tokens);
    updateFeesData(transaction, totalFees);

    // Keep track of tokens that have already been updated in this transaction
    const updatedTokens = new Set<string>();

    // Update historic data if the transaction is relevant and state has changed
    if (!isRelevantInvestment) return;
    if (
      transaction.tokenReceived &&
      !updatedTokens.has(transaction.tokenReceived)
    ) {
      addHistoricDataIfChanged(
        tokens,
        transaction.tokenReceived,
        previousStates[transaction.tokenReceived] as any,
        transaction.date
      );
      updatedTokens.add(transaction.tokenReceived);
    }
    if (transaction.tokenSent && !updatedTokens.has(transaction.tokenSent)) {
      addHistoricDataIfChanged(
        tokens,
        transaction.tokenSent,
        previousStates[transaction.tokenSent] as any,
        transaction.date
      );
      updatedTokens.add(transaction.tokenSent);
    }
    if (transaction.tokenFees && !updatedTokens.has(transaction.tokenFees)) {
      addHistoricDataIfChanged(
        tokens,
        transaction.tokenFees,
        previousStates[transaction.tokenFees] as any,
        transaction.date
      );
      updatedTokens.add(transaction.tokenFees);
    }
  });

  // Calculate pnlRealized and unitPrice for each historic entry
  Object.values(tokens).forEach((tokenData) => {
    tokenData.historic.forEach((data) => {
      data.pnlRealized = data.totalSell - data.totalBuy;
      data.unitPrice =
        data.pnlRealized > 0
          ? 0
          : data.quantity !== 0
          ? Math.abs(data.pnlRealized) / data.quantity
          : 0;
    });
  });

  // Set the current state to the most recent entry in the historic data
  Object.keys(tokens).forEach((token) => {
    const tokenData = tokens[token];
    if (tokenData && tokenData.historic.length > 0) {
      tokenData.current = {
        ...tokenData.historic[tokenData.historic.length - 1],
      } as any;
    }
  });

  // Calculate totalInvestedFiat (cashIn) as the sum of cashIn of all tokens
  totalInvestedFiat = Object.values(tokens).reduce(
    (sum, tokenData) => sum + tokenData.current.cashIn,
    0
  );

  // Calculate totalCashOut as the sum of cashOut of all tokens
  totalCashOut = Object.values(tokens).reduce(
    (sum, tokenData) => sum + tokenData.current.cashOut,
    0
  );

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
