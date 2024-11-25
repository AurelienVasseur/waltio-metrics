import { getCellValue } from "../utils/excel.util";
import { Transaction, TransactionZod } from "../types/transaction";
import moment from "moment-timezone";
import { Row } from "exceljs";

export default class WaltioService {
  /**
   *
   * @param rows Rows loaded from the Waltio export file
   * @returns Extract and sort transactions from a Waltio export file (xlsx file)
   */
  static getTransactions(rows: Row[]): Transaction[] {
    // Extract transactions
    const transactions = rows.map((row): Transaction => {
      const getAmount = (value: string) =>
        value ? Number(value.replace(",", ".")) : undefined;
      const getToken = (value: string) => (value ? value : undefined);
      return {
        type: getCellValue(row, 1) as Transaction["type"],
        date: getCellValue(row, 2),
        timeZone: getCellValue(row, 3) as Transaction["timeZone"],
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
    // Parse transactions
    const parse = TransactionZod.array().safeParse(transactions);
    if (!parse.success) {
      throw new Error(
        `The transactions exported from Waltio are not valid: ${JSON.stringify(
          parse.error.errors
        )}`
      );
    }
    // Sort transactions by date, taking timezone into account
    const sortedTransactions = parse.data.sort((a, b) => {
      // Create Date objects with timezone information
      const dateA = a.timeZone
        ? moment.tz(
            `${a.date} ${a.timeZone}`,
            "DD/MM/YYYY HH:mm:ss Z",
            a.timeZone
          )
        : moment(`${a.date}`, "DD/MM/YYYY HH:mm:ss");
      const dateB = b.timeZone
        ? moment.tz(
            `${b.date} ${b.timeZone}`,
            "DD/MM/YYYY HH:mm:ss Z",
            b.timeZone
          )
        : moment(`${b.date}`, "DD/MM/YYYY HH:mm:ss");
      // Compare timestamps
      return dateA.valueOf() - dateB.valueOf();
    });

    return sortedTransactions;
  }
}
