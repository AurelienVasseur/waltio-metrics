import path from "path";
import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";
import parseTransactions from "./services/test";
// import parseTransactions from "./services/test_full";

const FILE_PATH = path.resolve(__dirname, "../data/export_waltio.xlsx");

const main = async () => {
  const transactions = await WaltioService.getTransactions(FILE_PATH);
  // const wallet = WaltioService.getWallet(transactions);
  // const platforms = WaltioService.getPlatforms(transactions);
  // const overview = WaltioService.getOverview(transactions);
  // saveJson(wallet, "wallet");
  // saveJson(platforms, "platforms");
  // saveJson(overview, "overview");

  const test = parseTransactions(transactions);
  saveJson(test, "test");
  
  // const testFull = parseTransactions(transactions);
  // saveJson(testFull, "test-full");
};

main().then();
