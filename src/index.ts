import path from "path";
import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";
import parseTransactions from "./parseTransactions";

const FILE_PATH = path.resolve(__dirname, "../data/export_waltio.xlsx");

const main = async () => {
  const transactions = await WaltioService.getTransactions(FILE_PATH);

  const test = parseTransactions(transactions);
  saveJson(test, "test");
};

main().then();
