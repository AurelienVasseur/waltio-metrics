import * as p from "path";
import { getRowsFromExcelFile } from "./utils/excelUtils";
import { config } from "./config";
import WaltioService from "./services/waltio.service";
import MetricsService from "./services/metrics.service";
import TransactionsService from "./services/transactions.service";
import { cleanOutput, generateUniqueTimestamp, save } from "./utils/jsonUtils";

const main = async () => {
  const ora = (await import("ora")).default;

  // Prepare output directories
  const spinnerClean = ora("Preparing output directories").start();
  const timestamp = generateUniqueTimestamp();
  await cleanOutput(timestamp);
  spinnerClean.succeed(`Output directories created: output/${timestamp}`);

  // Load transactions
  const spinnerTransaction = ora("Loading transactions").start();
  const path: string = p.resolve(__dirname, `../${config.filePath}`);
  const rows = await getRowsFromExcelFile(path);
  const transactions = WaltioService.getTransactions(rows);
  await save(timestamp, transactions, "transactions");
  spinnerTransaction.succeed(`${transactions.length} transactions loaded`);

  // Generate aliased transactions
  const spinnerTransactionAliased = ora("Generating aliased transactions").start();
  // WORK IN PROGRESS...
  spinnerTransactionAliased.succeed(`${transactions.length} aliased transactions generated`);

  // Compute volumes
  const spinnerVolumes = ora("Compute volumes").start();
  const volumes = MetricsService.computeVolumes(transactions);
  await save(timestamp, volumes, "volumes");
  spinnerVolumes.succeed("Volumes computed");

  // Retrieve tokens
  const spinnerTokens = ora("Retrieving tokens").start();
  const tokens = TransactionsService.getTokens(transactions);
  const tokensMerged = [
    ...new Set([
      ...tokens.tokensReceived,
      ...tokens.tokensSent,
      ...tokens.tokensFees,
    ]),
  ].sort((a, b) => a.localeCompare(b));
  await save(timestamp, tokens, "tokens");
  spinnerTokens.succeed(`${tokensMerged.length} tokens retrieved`);

  // Compute metrics
  const spinnerMetrics = ora("Computing metrics").start();
  for (const token of tokensMerged) {
    spinnerMetrics.text = `Token ${token}`;
    const tokenTransactions = TransactionsService.getTokenTransactions(
      transactions,
      token
    );
    const tokenMetrics = MetricsService.computeTokenMetrics(
      transactions,
      token
    );
    await save(timestamp, tokenTransactions, token, "transactions");
    await save(timestamp, tokenMetrics, token, "metrics");
    // Add a small timeout to make logs readable
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }
  spinnerMetrics.succeed("Metrics computed");
};

main().then();
