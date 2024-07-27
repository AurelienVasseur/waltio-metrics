import path from "path";
import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";

const FILE_PATH = path.resolve(__dirname, "../data/export_waltio.xlsx");

const main = async () => {
  const transactions = await WaltioService.getTransactions(FILE_PATH);
  const wallet = WaltioService.getWallet(transactions);
  const platforms = WaltioService.getPlatforms(transactions);
  saveJson(wallet, "wallet");
  saveJson(platforms, "platforms");
};

main().then();
