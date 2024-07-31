import path from "path";
import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";
import parseTransactions from "./parseTransactions";

const FILE_PATH = path.resolve(__dirname, "../data/export_waltio.xlsx");

const main = async () => {
  const transactions = await WaltioService.getTransactions(FILE_PATH);

  const result = parseTransactions(transactions);
  saveJson(result, "t-all");
  saveJson(result.overview, "t-overview");
  saveJson(result.tokens, "t-tokens");
  saveJson(result.groups, "t-groups");
};

main().then();
