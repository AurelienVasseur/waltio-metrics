import * as p from "path";
import {
  TransactionFromWaltio,
  TransactionFromWaltioZod,
} from "../types/transactionFromWaltio";
import { getRowsFromExcelFile, getCellValue } from "../utils/excelUtils";
import { config } from "../config";

export default class WaltioService {
  /**
   *
   * @param path
   * @returns Extract transactions from a Waltio export (xlsx file)
   */
  static async getTransactions() {
    const path: string = p.resolve(__dirname, `../../${config.filePath}`);
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
}
