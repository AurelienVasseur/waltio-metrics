import { TransactionFromWaltio } from "../types/transactionFromWaltio";

type TokenData = {
  quantity: number;
  cashIn: number;
  totalBuy: number;
  totalSell: number;
};

type Result = {
  overview: {
    cashIn: number;
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
    tokens[token] = {
      quantity: 0,
      cashIn: 0,
      totalBuy: 0,
      totalSell: 0,
    };
  }
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
    tokenData.totalBuy += totalValueReceived; // Mise à jour de totalBuy
    if (isFiatInvestmentTransaction(transaction)) {
      const fiatValueReceived = amountReceived * priceTokenReceived;
      tokenData.cashIn += fiatValueReceived; // Mise à jour de cashIn
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
    tokenData.totalSell += totalValueSent; // Mise à jour de totalSell
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
  tokens: Record<string, TokenData>
): void {
  if (transaction.amountReceived && transaction.tokenReceived) {
    const tokenReceived = transaction.tokenReceived;
    const amountReceived = transaction.amountReceived;

    initializeTokenData(tokens, tokenReceived);

    tokens[tokenReceived]!.quantity += amountReceived;
  }

  if (transaction.amountSent && transaction.tokenSent) {
    const tokenSent = transaction.tokenSent;
    const amountSent = transaction.amountSent;

    initializeTokenData(tokens, tokenSent);

    tokens[tokenSent]!.quantity -= amountSent;
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
    }

    updateQuantityData(transaction, tokens);
    updateFeesData(transaction, totalFees);
  });

  // Calculer totalInvestedFiat (cashIn) comme la somme des cashIn de tous les tokens
  totalInvestedFiat = Object.values(tokens).reduce(
    (sum, tokenData) => sum + tokenData.cashIn,
    0
  );

  return {
    overview: {
      cashIn: totalInvestedFiat,
      fees: totalFees.value,
    },
    tokens,
  };
}

export default parseTransactions;
