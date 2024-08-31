import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";
import parseTransactions from "./parseTransactions";
import { calculateValuations } from "./valuation";

const main = async () => {
  const transactions = await WaltioService.getTransactions();

  const result = parseTransactions(transactions);
  const valuation = calculateValuations(result);

  saveJson(result, "all");
  saveJson(result.overview, "overview");
  saveJson(result.tokens, "tokens");
  saveJson(result.groups, "groups");
  saveJson(valuation, "valuation")
};

main().then();
