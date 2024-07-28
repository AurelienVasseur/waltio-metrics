import { TransactionFromWaltio } from "../types/transactionFromWaltio";

type InvestmentSummary = {
  totalInvestedFiat: number;
  totalInvestedByAsset: Record<string, number>;
  totalInvestedByToken: Record<string, number>;
  totalSoldByToken: Record<string, number>;
  unitCostByAsset: Record<string, number>;
  totalFees: number;
  quantityByToken: Record<string, number>;
};

type AssetData = {
  totalInvestedFiat: number;
  totalAmountReceived: number;
};

const fiatTokens = ["USD", "EUR"];

/**
 * Checks if a transaction is relevant for investment calculations.
 * @param transaction - A transaction from Waltio.
 * @returns True if the transaction is an exchange involving USD/EUR or a deposit with the label "Achat de crypto".
 */
function isRelevantFiatTransaction(
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
 * @returns True if the transaction is an exchange or a deposit with the label "Achat de crypto".
 */
function isRelevantTransaction(transaction: TransactionFromWaltio): boolean {
  return (
    transaction.type === "Échange" ||
    (transaction.type === "Dépôt" && transaction.label === "Achat de crypto")
  );
}

/**
 * Calculates the investment for a given transaction and updates totalInvestedByAsset.
 * @param transaction - A transaction from Waltio.
 * @param totalInvestedByAsset - An object containing the total investments by asset.
 * @returns The total fiat amount invested for this transaction.
 */
function calculateInvestment(
  transaction: TransactionFromWaltio,
  totalInvestedByAsset: Record<string, AssetData>
): number {
  if (transaction.amountReceived && transaction.priceTokenReceived) {
    const tokenReceived = transaction.tokenReceived!;
    const amountReceived = transaction.amountReceived!;
    const priceTokenReceived = transaction.priceTokenReceived!;

    // Calculate fiat value of the received amount
    const fiatValueReceived = amountReceived * priceTokenReceived;

    if (!totalInvestedByAsset[tokenReceived]) {
      totalInvestedByAsset[tokenReceived] = {
        totalInvestedFiat: 0,
        totalAmountReceived: 0,
      };
    }

    const assetData = totalInvestedByAsset[tokenReceived];
    if (assetData) {
      assetData.totalInvestedFiat += fiatValueReceived;
      assetData.totalAmountReceived += amountReceived;
    }

    return fiatValueReceived;
  }
  return 0;
}

/**
 * Calculates the total investment for a given transaction and updates totalInvestedByToken.
 * @param transaction - A transaction from Waltio.
 * @param totalInvestedByToken - An object containing the total investments by token.
 * @returns The total amount invested for this transaction.
 */
function calculateTotalInvestment(
  transaction: TransactionFromWaltio,
  totalInvestedByToken: Record<string, number>
): number {
  if (transaction.amountReceived && transaction.priceTokenReceived) {
    const tokenReceived = transaction.tokenReceived!;
    const amountReceived = transaction.amountReceived!;
    const priceTokenReceived = transaction.priceTokenReceived!;

    // Calculate value of the received amount
    const valueReceived = amountReceived * priceTokenReceived;

    if (!totalInvestedByToken[tokenReceived]) {
      totalInvestedByToken[tokenReceived] = 0;
    }

    totalInvestedByToken[tokenReceived] += valueReceived;

    return valueReceived;
  }
  return 0;
}

/**
 * Calculates the total amount sold for a given transaction and updates totalSoldByToken.
 * @param transaction - A transaction from Waltio.
 * @param totalSoldByToken - An object containing the total amount sold by token.
 * @returns The total amount sold for this transaction.
 */
function calculateTotalSold(
  transaction: TransactionFromWaltio,
  totalSoldByToken: Record<string, number>
): number {
  if (
    transaction.type === "Échange" &&
    transaction.amountSent &&
    transaction.priceTokenSent
  ) {
    const tokenSent = transaction.tokenSent!;
    const amountSent = transaction.amountSent!;
    const priceTokenSent = transaction.priceTokenSent!;

    // Calculate value of the sent amount
    const valueSent = amountSent * priceTokenSent;

    if (!totalSoldByToken[tokenSent]) {
      totalSoldByToken[tokenSent] = 0;
    }

    totalSoldByToken[tokenSent] += valueSent;

    return valueSent;
  }
  return 0;
}

/**
 * Updates the quantity of tokens held based on the transaction.
 * @param transaction - A transaction from Waltio.
 * @param quantityByToken - An object containing the quantity held for each token.
 */
function updateQuantityByToken(
  transaction: TransactionFromWaltio,
  quantityByToken: Record<string, number>
): void {
  if (transaction.amountReceived) {
    const tokenReceived = transaction.tokenReceived!;
    const amountReceived = transaction.amountReceived!;

    if (!quantityByToken[tokenReceived]) {
      quantityByToken[tokenReceived] = 0;
    }

    quantityByToken[tokenReceived] += amountReceived;
  }

  if (transaction.amountSent) {
    const tokenSent = transaction.tokenSent!;
    const amountSent = transaction.amountSent!;

    if (!quantityByToken[tokenSent]) {
      quantityByToken[tokenSent] = 0;
    }

    quantityByToken[tokenSent] -= amountSent;
  }
}

/**
 * Calculates the fees for a given transaction.
 * @param transaction - A transaction from Waltio.
 * @returns The total fees amount for this transaction.
 */
function calculateFees(transaction: TransactionFromWaltio): number {
  if (transaction.fees && transaction.priceTokenFees) {
    return transaction.fees * transaction.priceTokenFees;
  }
  return 0;
}

/**
 * Calculates the unit cost for each asset.
 * @param totalInvestedByAsset - An object containing the total investments by asset.
 * @returns An object containing the unit cost for each asset.
 */
function calculateUnitCostByAsset(
  totalInvestedByAsset: Record<string, AssetData>
): Record<string, number> {
  const unitCostByAsset: Record<string, number> = {};

  for (const token in totalInvestedByAsset) {
    const assetData = totalInvestedByAsset[token];
    if (assetData) {
      const { totalInvestedFiat, totalAmountReceived } = assetData;
      unitCostByAsset[token] = totalInvestedFiat / totalAmountReceived;
    }
  }

  return unitCostByAsset;
}

/**
 * Parses a list of transactions to generate an investment summary.
 * @param transactions - An array of transactions from Waltio.
 * @returns An investment summary including total fiat invested, total invested by asset, total invested by token, total sold by token, unit cost by asset, total fees, and quantity by token.
 */
function parseTransactions(
  transactions: TransactionFromWaltio[]
): InvestmentSummary {
  const totalInvestedByAsset: Record<string, AssetData> = {};
  const totalInvestedByToken: Record<string, number> = {};
  const totalSoldByToken: Record<string, number> = {};
  const quantityByToken: Record<string, number> = {};
  let totalInvestedFiat = 0;
  let totalFees = 0;

  transactions.forEach((transaction) => {
    if (isRelevantFiatTransaction(transaction)) {
      totalInvestedFiat += calculateInvestment(
        transaction,
        totalInvestedByAsset
      );
    }
    if (isRelevantTransaction(transaction)) {
      calculateTotalInvestment(transaction, totalInvestedByToken);
    }
    if (transaction.type === "Échange") {
      calculateTotalSold(transaction, totalSoldByToken);
    }
    updateQuantityByToken(transaction, quantityByToken);
    totalFees += calculateFees(transaction);
  });

  return {
    totalInvestedFiat,
    totalInvestedByAsset: Object.keys(totalInvestedByAsset).reduce(
      (acc, token) => {
        const assetData = totalInvestedByAsset[token];
        if (assetData) {
          acc[token] = assetData.totalInvestedFiat;
        }
        return acc;
      },
      {} as Record<string, number>
    ),
    totalInvestedByToken,
    totalSoldByToken,
    unitCostByAsset: calculateUnitCostByAsset(totalInvestedByAsset),
    totalFees,
    quantityByToken,
  };
}

export default parseTransactions;
