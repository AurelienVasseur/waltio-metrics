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
    function isBuyTransaction(tx: TransactionFromWaltio): boolean {
      return (
        tx.type === "Échange" ||
        (tx.type === "Dépôt" && tx.label === "Achat de crypto")
      );
    }

    let w = { ...wallet };
    const token = tx.tokenReceived;
    const amount = tx.amountReceived;
    const price = tx.priceTokenReceived;
    const isBuyTx = isBuyTransaction(tx);
    if (token && amount && price) {
      const current = w[token];
      w[token] =
        typeof current === "undefined"
          ? {
              quantity: amount,
              quantityBuy: isBuyTx ? amount : 0,
              quantitySell: 0,
              priceBuy: isBuyTx
                ? [{ price: price, quantity: amount, date: tx.date }]
                : [],
              priceSell: [],
              avgPriceBuy: 0,
              avgPriceSell: 0,
              sumPriceBuy: 0,
              sumPriceSell: 0,
              breakevenPrice: 0,
            }
          : {
              ...current,
              quantity: current.quantity + amount,
              quantityBuy: isBuyTx
                ? current.quantityBuy + amount
                : current.quantityBuy,
              priceBuy: isBuyTx
                ? current.priceBuy.concat({
                    price: price,
                    quantity: amount,
                    date: tx.date,
                  })
                : current.priceBuy,
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
    function isSellTransaction(tx: TransactionFromWaltio): boolean {
      return tx.type === "Échange";
    }

    let w = { ...wallet };
    const token = tx.tokenSent;
    const amount = tx.amountSent;
    const price = tx.priceTokenSent;
    const isSellTx = isSellTransaction(tx);
    if (token && amount && price) {
      const current = w[token];
      w[token] =
        typeof current === "undefined"
          ? {
              quantity: 0 - amount,
              quantityBuy: 0,
              quantitySell: isSellTx ? 0 + amount : 0,
              priceBuy: [],
              priceSell: isSellTx
                ? [{ price, quantity: amount, date: tx.date }]
                : [],
              avgPriceBuy: 0,
              avgPriceSell: 0,
              sumPriceBuy: 0,
              sumPriceSell: 0,
              breakevenPrice: 0,
            }
          : {
              ...current,
              quantity: current.quantity - amount,
              quantitySell: isSellTx
                ? current.quantitySell + amount
                : current.quantitySell,
              priceSell: isSellTx
                ? current.priceSell.concat({
                    price,
                    quantity: amount,
                    date: tx.date,
                  })
                : current.priceSell,
            };
    }
    return w;
  }

  private static computePrices(wallet: Wallet) {
    let w = { ...wallet };
    Object.keys(w).forEach((token) => {
      let tokenEntry = w[token];
      if (!tokenEntry) return;
      function compute(p: PriceAction[]) {
        let totalQuantity = 0;
        let totalPrice = 0;
        p.forEach((action) => {
          totalQuantity += action.quantity;
          totalPrice += action.price * action.quantity;
        });
        return {
          avg: totalQuantity ? totalPrice / totalQuantity : 0,
          sum: totalPrice,
        };
      }
      const pBuy = compute(tokenEntry.priceBuy);
      tokenEntry.avgPriceBuy = pBuy.avg;
      tokenEntry.sumPriceBuy = pBuy.sum;
      const pSell = compute(tokenEntry.priceSell);
      tokenEntry.avgPriceSell = pSell.avg;
      tokenEntry.sumPriceSell = pSell.sum;
      tokenEntry.breakevenPrice = Math.max(
        (tokenEntry.sumPriceBuy - tokenEntry.sumPriceSell) /
          tokenEntry.quantity,
        0
      );
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
    wallet = this.computePrices(wallet);
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
