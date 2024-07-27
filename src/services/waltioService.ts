import {
  TransactionFromWaltio,
  TransactionFromWaltioZod,
} from "../types/transactionFromWaltio";
import { Platforms, PriceAction, Wallet } from "../types/wallet";
import { getRowsFromExcelFile, getCellValue } from "../utils/excelUtils";

export default class WaltioService {
  /**
   *
   * @param path
   * @returns Extract transactions from a Waltio export (xlsx file)
   */
  static async getTransactions(path: string) {
    console.log("[WALTIO] Get Transaction: start");
    const rows = await getRowsFromExcelFile(path);
    const transactions = rows.map((row): TransactionFromWaltio => {
      const getAmount = (value: string) =>
        value ? Number(value.replace(",", ".")) : undefined;
      const getToken = (value: string) => (value ? value : undefined);
      return {
        type: getCellValue(row, 1) as TransactionFromWaltio["type"],
        date: getCellValue(row, 2),
        timeZone: getCellValue(row, 3),
        amountReceived: getAmount(getCellValue(row, 4)),
        tokenReceived: getToken(getCellValue(row, 5)),
        amountSent: getAmount(getCellValue(row, 6)),
        tokenSent: getToken(getCellValue(row, 7)),
        fees: getAmount(getCellValue(row, 8)),
        tokenFees: getToken(getCellValue(row, 9)),
        platform: getCellValue(row, 10),
        description: getCellValue(row, 11),
        label: getCellValue(row, 12),
        priceTokenSent: getAmount(getCellValue(row, 13)),
        priceTokenReceived: getAmount(getCellValue(row, 14)),
        priceTokenFees: getAmount(getCellValue(row, 15)),
        address: getCellValue(row, 16),
        trasactionHash: getCellValue(row, 17),
        externalId: getCellValue(row, 18),
      };
    });
    const parse = TransactionFromWaltioZod.array().safeParse(transactions);
    if (!parse.success) {
      throw new Error("Transactions from Waltio not valid: ", parse.error);
    }
    console.log("[WALTIO] Get Transaction: done");
    return transactions;
  }

  /**
   *
   * @param wallet
   * @param tx
   * @returns Compute the new token quantity in a wallet after a deposit
   */
  private static computeDeposit(wallet: Wallet, tx: TransactionFromWaltio) {
    let w = { ...wallet };
    const token = tx.tokenReceived;
    const amount = tx.amountReceived;
    const price = tx.priceTokenReceived;
    if (token && amount && price) {
      const current = w[token];
      w[token] =
        typeof current === "undefined"
          ? {
              quantity: amount,
              quantityDeposit: amount,
              quantityWithdrawal: 0,
              priceDeposit: [{ price: price, quantity: amount }],
              priceWithdrawal: [],
              avgPriceDeposit: 0,
              avgPriceWithdrawal: 0,
            }
          : {
              ...current,
              quantity: current.quantity + amount,
              quantityDeposit: current.quantityDeposit + amount,
              priceDeposit: current.priceDeposit.concat({
                price: price,
                quantity: amount,
              }),
            };
    }
    return w;
  }

  /**
   *
   * @param wallet
   * @param tx
   * @returns Compute the new token quantity in a wallet after a withdra
   */
  private static computeWithdrawal(wallet: Wallet, tx: TransactionFromWaltio) {
    let w = { ...wallet };
    const token = tx.tokenSent;
    const amount = tx.amountSent;
    const price = tx.priceTokenSent;
    if (token && amount && price) {
      const current = w[token];
      // w[token] = typeof current === "undefined" ? 0 - amount : current - amount;
      w[token] =
        typeof current === "undefined"
          ? {
              quantity: 0 - amount,
              quantityDeposit: 0,
              quantityWithdrawal: 0 + amount,
              priceDeposit: [],
              priceWithdrawal: [{ price, quantity: amount }],
              avgPriceDeposit: 0,
              avgPriceWithdrawal: 0,
            }
          : {
              ...current,
              quantity: current.quantity - amount,
              quantityWithdrawal: current.quantityWithdrawal + amount,
              priceWithdrawal: current.priceWithdrawal.concat({
                price,
                quantity: amount,
              }),
            };
    }
    return w;
  }

  private static computeAvgPrices(wallet: Wallet) {
    let w = { ...wallet };
    Object.keys(w).forEach((token) => {
      let tokenEntry = w[token];
      if (!tokenEntry) return;
      function computeAvg(p: PriceAction[]) {
        if (!p.length) {
          return 0;
        }
        let totalQuantity = 0;
        let totalPrice = 0;
        p.forEach((action) => {
          totalQuantity += action.quantity;
          totalPrice += action.price * action.quantity;
        });
        return totalQuantity ? totalPrice / totalQuantity : 0;
      }
      tokenEntry.avgPriceDeposit = computeAvg(tokenEntry.priceDeposit);
      tokenEntry.avgPriceWithdrawal = computeAvg(tokenEntry.priceWithdrawal);
      w[token] = tokenEntry;
    });
    return w;
  }

  /**
   *
   * @param transactions
   * @returns Wallet overview
   */
  static getWallet(transactions: TransactionFromWaltio[]) {
    console.log("[WALTIO] Get Wallet: start");
    let wallet: Wallet = {};
    transactions.forEach((tx) => {
      switch (tx.type) {
        case "Dépôt":
          wallet = this.computeDeposit(wallet, tx);
          break;
        case "Retrait":
          wallet = this.computeWithdrawal(wallet, tx);
          break;
        case "Échange":
          wallet = this.computeDeposit(wallet, tx);
          wallet = this.computeWithdrawal(wallet, tx);
          break;
      }
    });
    wallet = this.computeAvgPrices(wallet);
    console.log("[WALTIO] Get Wallet: done");
    return wallet;
  }

  /**
   *
   * @param transactions
   * @returns Wallet overview segmented by platforms
   */
  static getPlatforms(transactions: TransactionFromWaltio[]) {
    console.log("[WALTIO] Get Platforms: start");
    let platforms: Platforms = {};
    transactions.forEach((tx) => {
      let wallet = platforms[tx.platform] || {};
      switch (tx.type) {
        case "Dépôt":
          wallet = this.computeDeposit(wallet, tx);
          break;
        case "Retrait":
          wallet = this.computeWithdrawal(wallet, tx);
          break;
        case "Échange":
          wallet = this.computeDeposit(wallet, tx);
          wallet = this.computeWithdrawal(wallet, tx);
          break;
      }
      platforms[tx.platform] = wallet;
    });
    console.log("[WALTIO] Get Platforms: done");
    return platforms;
  }
}
