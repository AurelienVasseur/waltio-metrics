import * as p from "path";
import { getRowsFromExcelFile } from "./utils/excelUtils";
import { config } from "./config";
import WaltioService from "./services/waltio.service";
import MetricsService from "./services/metrics.service";
import TransactionsService from "./services/transactions.service";
import { cleanOutput, generateUniqueTimestamp, save } from "./utils/jsonUtils";

const main = async () => {
  const timestamp = generateUniqueTimestamp();
  await cleanOutput(timestamp);

  // Parse transactions
  const path: string = p.resolve(__dirname, `../${config.filePath}`);
  const rows = await getRowsFromExcelFile(path);
  const transactions = WaltioService.getTransactions(rows);
  
  // Compute metrics
  const volumes = MetricsService.computeVolumes(transactions);
  const tokens = TransactionsService.getTokens(transactions);

  save(timestamp, transactions, "transactions");
  save(timestamp, volumes, "volumes");
  save(timestamp, tokens, "tokens");

  const tokensMerged = [
    ...new Set([
      ...tokens.tokensReceived,
      ...tokens.tokensSent,
      ...tokens.tokensFees,
    ]),
  ];
  tokensMerged.map((token) => {
    const tokenTransactions = TransactionsService.getTokenTransactions(
      transactions,
      token
    );
    const tokenMetrics = MetricsService.computeTokenMetrics(
      transactions,
      token
    );
    save(timestamp, tokenTransactions, token, "transactions");
    save(timestamp, tokenMetrics, token, "metrics");
  });
};

main().then();
