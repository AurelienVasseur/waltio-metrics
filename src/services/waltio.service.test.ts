import { describe, expect, it } from "vitest";
import * as p from "path";
import { getRowsFromExcelFile } from "../utils/excel.util";
import WaltioService from "./waltio.service";
import { transactions as expectedTransactions } from "../../tests/data/transactionsWaltioService";
import { fail } from "assert";

const getRowsExportWaltio = async () => {
  const path: string = p.resolve(
    __dirname,
    `../../tests/files/exportWaltio.xlsx`
  );
  const rows = await getRowsFromExcelFile(path);
  return rows;
};

const getRowsExportWaltioUnsorted = async () => {
  const path: string = p.resolve(
    __dirname,
    `../../tests/files/exportWaltioUnsorted.xlsx`
  );
  const rows = await getRowsFromExcelFile(path);
  return rows;
};

const getRowsExportWaltioInvalid = async () => {
  const path: string = p.resolve(
    __dirname,
    `../../tests/files/exportWaltioInvalid.xlsx`
  );
  const rows = await getRowsFromExcelFile(path);
  return rows;
};

describe("Waltio Service", () => {
  describe("getTransactions", () => {
    it("SHOULD return the transactions", async () => {
      const rows = await getRowsExportWaltio();
      const transactions = WaltioService.getTransactions(rows);
      expect(transactions).toEqual(expectedTransactions);
    });

    it("SHOULD sort and return the transactions", async () => {
      const rows = await getRowsExportWaltioUnsorted();
      const transactions = WaltioService.getTransactions(rows);
      expect(transactions).toEqual(expectedTransactions);
    });

    it("SHOULD raise an error if the transactions are not well formatted", async () => {
      const rows = await getRowsExportWaltioInvalid();
      try {
        WaltioService.getTransactions(rows);
        fail();
      } catch (error: any) {
        expect(error.message).toEqual(
          'The transactions exported from Waltio are not valid: [{"received":"SOMETHING","code":"invalid_enum_value","options":["Échange","Dépôt","Retrait"],"path":[0,"type"],"message":"Invalid enum value. Expected \'Échange\' | \'Dépôt\' | \'Retrait\', received \'SOMETHING\'"},{"validation":"regex","code":"invalid_string","message":"Invalid","path":[4,"date"]},{"code":"invalid_type","expected":"number","received":"nan","path":[6,"amountReceived"],"message":"Expected number, received nan"},{"validation":"regex","code":"invalid_string","message":"Invalid","path":[10,"date"]},{"code":"invalid_type","expected":"number","received":"nan","path":[10,"priceTokenSent"],"message":"Expected number, received nan"},{"code":"invalid_type","expected":"number","received":"nan","path":[12,"priceTokenReceived"],"message":"Expected number, received nan"},{"validation":"regex","code":"invalid_string","message":"Invalid","path":[14,"date"]},{"received":"A TIMEZONE","code":"invalid_enum_value","options":["GMT","GMT+1:00","GMT+2:00","GMT+2:00","GMT+3:00","GMT+3:30","GMT+4:00","GMT+5:00","GMT+5:30","GMT+6:00","GMT+7:00","GMT+8:00","GMT+9:00","GMT+9:30","GMT+10:00","GMT+11:00","GMT+12:00","GMT-11:00","GMT-10:00","GMT-9:00","GMT-8:00","GMT-7:00","GMT-7:00","GMT-6:00","GMT-5:00","GMT-5:00","GMT-4:00","GMT-3:30","GMT-3:00","GMT-3:00","GMT-1:00"],"path":[14,"timeZone"],"message":"Invalid enum value. Expected \'GMT\' | \'GMT+1:00\' | \'GMT+2:00\' | \'GMT+2:00\' | \'GMT+3:00\' | \'GMT+3:30\' | \'GMT+4:00\' | \'GMT+5:00\' | \'GMT+5:30\' | \'GMT+6:00\' | \'GMT+7:00\' | \'GMT+8:00\' | \'GMT+9:00\' | \'GMT+9:30\' | \'GMT+10:00\' | \'GMT+11:00\' | \'GMT+12:00\' | \'GMT-11:00\' | \'GMT-10:00\' | \'GMT-9:00\' | \'GMT-8:00\' | \'GMT-7:00\' | \'GMT-7:00\' | \'GMT-6:00\' | \'GMT-5:00\' | \'GMT-5:00\' | \'GMT-4:00\' | \'GMT-3:30\' | \'GMT-3:00\' | \'GMT-3:00\' | \'GMT-1:00\', received \'A TIMEZONE\'"}]'
        );
      }
    });
  });
});
