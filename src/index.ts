import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";
import parseTransactions from "./parseTransactions";

const main = async () => {
  const transactions = await WaltioService.getTransactions();

  const result = parseTransactions(transactions);
  saveJson(result, "t-all");
  saveJson(result.overview, "t-overview");
  saveJson(result.tokens, "t-tokens");
  saveJson(result.groups, "t-groups");
};

main().then();
