import * as p from "path";
import { getRowsFromExcelFile } from "./utils/excel.util";
import { config } from "./config";
import WaltioService from "./services/waltio.service";
import MetricsService from "./services/metrics.service";
import TransactionsService from "./services/transactions.service";
import { cleanOutput, generateUniqueTimestamp, save } from "./utils/json.util";
import { Transaction } from "./types/transaction";
import capitalize from "./utils/capitalize.util";
import FiatService from "./services/fiat.service";

const main = async () => {
  console.log("Hello world")

  const test = await FiatService.getPriceHistory("USD");
  console.log('Test: ', test)

  return




  const ora = (await import("ora")).default;

  // Prepare output directories
  const spinnerClean = ora("Preparing output directories").start();
  const timestamp = generateUniqueTimestamp();
  await cleanOutput(timestamp);
  save(timestamp, config, "config");
  spinnerClean.succeed(`Output directories created: output/${timestamp}\n`);

  // Load raw transactions and generate aliased transactions
  const spinnerTransaction = ora("Loading transactions").start();
  const path: string = p.resolve(__dirname, `../${config.filePath}`);
  const rows = await getRowsFromExcelFile(path);
  const transactions = WaltioService.getTransactions(rows);
  const transactionsAliased = TransactionsService.generateAliased(transactions);
  await save(timestamp, transactions, "transactions", "raw");
  await save(timestamp, transactionsAliased, "transactions", "aliased");
  spinnerTransaction.succeed(`${transactions.length} transactions loaded`);

  // Compute volumes
  const spinnerVolumes = ora("Compute volumes").start();
  const volumes = MetricsService.computeVolumes(transactions);
  await save(timestamp, volumes, "volumes");
  spinnerVolumes.succeed("Volumes computed");

  const types: { type: "raw" | "aliased"; transactions: Transaction[] }[] = [
    {
      type: "raw",
      transactions: transactions,
    },
    {
      type: "aliased",
      transactions: transactionsAliased,
    },
  ];

  for (const t of types) {
    console.log(`\n${capitalize(t.type)} transactions:`);

    // Retrieve tokens
    const spinnerTokens = ora("Retrieving tokens").start();
    const tokens = TransactionsService.getTokens(t.transactions);
    const tokensMerged = [
      ...new Set([
        ...tokens.tokensReceived,
        ...tokens.tokensSent,
        ...tokens.tokensFees,
      ]),
    ].sort((a, b) => a.localeCompare(b));
    await save(timestamp, tokens, "tokens", t.type);
    spinnerTokens.succeed(`${tokensMerged.length} tokens retrieved`);

    // Compute metrics
    const spinnerMetrics = ora("Computing metrics").start();
    for (const [index, token] of tokensMerged.entries()) {
      spinnerMetrics.text = `Token ${index + 1}/${
        tokensMerged.length
      }: ${token}`;
      const tokenTransactions = TransactionsService.getTokenTransactions(
        t.transactions,
        token
      );
      const tokenMetrics = MetricsService.computeTokenMetrics(
        t.transactions,
        token
      );
      await save(timestamp, tokenTransactions, token, t.type, "transactions");
      await save(timestamp, tokenMetrics, token, t.type, "metrics");
      // Add a small timeout to make logs readable
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    }
    spinnerMetrics.succeed("Metrics computed");
  }

  console.log("\n🎉  Metrics successfully computed");
};

main().then();
