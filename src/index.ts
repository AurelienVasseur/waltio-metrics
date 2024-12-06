import * as p from "path";
import { getRowsFromExcelFile } from "./utils/excel.util";
import { config } from "./config";
import WaltioService from "./services/waltio.service";
import MetricsService from "./services/metrics.service";
import TransactionsService from "./services/transactions.service";
import { cleanOutput, generateUniqueTimestamp, save } from "./utils/json.util";
import { Transaction } from "./types/transaction";
import FiatService from "./services/fiat.service";
import { PriceHistory } from "./types/priceHistory";

/**
 * Process the computation of volumes and metrics.
 *
 * @param timestamp Timestamp
 * @param fiat Fiat for computation
 * @param rawTransactions Raw transactions (input data)
 */
const process = async (
  timestamp: string,
  fiat: string,
  rawTransactions: Transaction[]
) => {
  // Load price history
  const priceHistory: PriceHistory[] = await FiatService.getPriceHistory(fiat);
  await save(timestamp, priceHistory, "price-history", fiat);
  // Convert prices if needed
  const transactions =
    priceHistory.length > 0
      ? FiatService.convertPrices(rawTransactions, priceHistory)
      : [...rawTransactions];
  await save(timestamp, transactions, "transactions", fiat, "raw");
  // Generate aliased transactions
  const transactionsAliased = TransactionsService.generateAliased(transactions);
  await save(timestamp, transactionsAliased, "transactions", fiat, "aliased");
  // Compute volumes
  const volumes = MetricsService.computeVolumes(transactions);
  await save(timestamp, volumes, "volumes", fiat);
  // Compute metrics
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
    // Retrieve tokens
    const tokens = TransactionsService.getTokens(t.transactions);
    const tokensMerged = [
      ...new Set([
        ...tokens.tokensReceived,
        ...tokens.tokensSent,
        ...tokens.tokensFees,
      ]),
    ].sort((a, b) => a.localeCompare(b));
    await save(timestamp, tokens, "tokens", fiat, t.type);
    // Compute metrics
    for (const [index, token] of tokensMerged.entries()) {
      const tokenTransactions = TransactionsService.getTokenTransactions(
        t.transactions,
        token
      );
      const tokenMetrics = MetricsService.computeTokenMetrics(
        t.transactions,
        token
      );
      await save(
        timestamp,
        tokenTransactions,
        token,
        fiat,
        t.type,
        "transactions"
      );
      await save(timestamp, tokenMetrics, token, fiat, t.type, "metrics");
    }
  }
};

const main = async () => {
  const ora = (await import("ora")).default;
  // Load fiat configuration
  const fiats: string[] = [
    config.fiatReference,
    ...config.fiatsForProcessing.map((e) => e.token),
  ];
  ora(
    `Fiats: ${fiats
      .map((fiat) =>
        fiat === config.fiatReference ? `${fiat} (reference)` : fiat
      )
      .join(", ")}`
  ).info();

  // Prepare output directories
  const spinnerClean = ora("Preparing output directories").start();
  const timestamp = generateUniqueTimestamp();
  await cleanOutput(timestamp, fiats);
  save(timestamp, config, "config");
  spinnerClean.info(`Output directory: 'output/${timestamp}'`);

  // Load raw transactions
  const spinnerRawTransactions = ora("Loading transactions").start();
  const path: string = p.resolve(__dirname, `../${config.filePath}`);
  const rows = await getRowsFromExcelFile(path);
  const transactions = WaltioService.getTransactions(rows);
  spinnerRawTransactions.info(`Transactions: ${transactions.length}\n`);

  // Process computation for each fiat
  for (const fiat of fiats) {
    const spinner = ora(`${fiat} In progress`).start();
    try {
      await process(timestamp, fiat, transactions);
      spinner.succeed(`${fiat} Done.`);
    } catch (error) {
      spinner.fail(`${fiat} Failed.`);
      console.error(error);
    }
  }
};

main().then();
