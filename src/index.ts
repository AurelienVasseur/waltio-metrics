import { saveJson } from "./utils/jsonUtils";
import WaltioService from "./services/waltioService";
import parseTransactions from "./parseTransactions";
import { calculateValuations } from "./valuation";

const main = async () => {
  const transactions = await WaltioService.getTransactions();

  const result = parseTransactions(transactions);
  const valuation = calculateValuations(result);

  saveJson(result, "t-all");
  saveJson(result.overview, "t-overview");
  saveJson(result.tokens, "t-tokens");
  saveJson(result.groups, "t-groups");
  saveJson(valuation, "t-valuation")
};

main().then();
