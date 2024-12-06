# Waltio Metrics

This project provides a function to parse and summarize token transactions, specifically designed to handle transactions from Waltio. The main functionality is implemented in TypeScript, and it calculates various properties for each token involved in the transactions, including quantities, cash flows, and realized profit and loss (PnL).

> **Note**: The prices defined in the transactions exported from Waltio are in **euros**. Therefore, all metrics calculated by this program (e.g., volumes, prices, etc.) are also in **euros**, unless multiple fiat computations are enabled (see [Multi-Fiat Computation](#fiats-for-processing-multi-fiat-computation)).

The implementation of this project prioritizes maintainability and ease of understanding over performance optimization, ensuring the code remains accessible and straightforward for future development and maintenance.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Data Consideration](#data-consideration)
  - [Metric](#metric)
  - [Metric Section](#metric-section)
  - [Volume](#volume)
  - [Volume Section](#volume-section)
- [Improvements](#improvements)

## Overview

The main goal of this project is to parse token transactions and generate an investment summary that includes total fiat invested, total fees, and detailed data for each token and group of tokens. The token data includes computed and expected quantities, cash flows (cash in and cash out), total buy and sell values, realized PnL, and unit prices.

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install the dependencies:
   ```bash
   pnpm install
   ```

## Usage

1. Create a `config.json` file at the root of the project based on the example `config.sample.json` (see [config](#configuration)).
2. Export your transactions from Waltio (`Mon rapport fiscal > Tous les documents > Exports > Exporter`). It must be an Excel file (`.xlsx`).
3. Create a `data` folder at the root of the project and move the previously exported file inside it.
4. Start the project:
   ```bash
   pnpm start
   ```

That's it 🥳. All metrics will be saved in the `output` folder.

## Testing

Unit tests have been implemented to ensure the reliability and correctness of the system. To execute these tests, simply run the command:

```bash
pnpm test
```

It is important to note that the successful execution of these tests relies on the configuration provided in the `config.test.json` file. The configuration is not mocked within the tests, so the actual configuration from this file is used to validate the system's behavior. Make sure that `config.test.json` is properly set up before running the tests to avoid any issues.

## Configuration

The application needs some configuration to compute metrics as expected. The expected structure of the configuration file is defined in `src/config.ts`. Here is an explaination concerning the expected properties.

### File path

Path of the file (exported from Waltio) that must be used to load transactions and compute metrics:

```json
{
  ...
  "filePath": "data/export_waltio.xlsx",
  ...
}
```

### Fiat Reference

The reference fiat used in the raw transactions (input data) to define prices:

```json
{
  ...
  "fiatReference": "EUR",
  ...
}
```

### Fiats For Processing Multi-Fiat Computation

With the implementation of multi-fiat computations, the program supports the calculation of metrics and volumes for multiple fiat currencies. By default, the transactions are processed in euros (see Fiat Reference), but you can configure additional fiat currencies for which metrics should be computed.

In your `config.json`, you can define the fiat currencies to compute metrics for using the `fiatsForProcessing` property. Each entry specifies the fiat token and the path to the historical price data file for that fiat currency:

```json
{
  ...
  "fiatsForProcessing": [
    {
      "token": "USD",
      "priceHistoryFilePath": "data/eur_to_usd_prices.csv"
    },
    {
      "token": "GBP",
      "priceHistoryFilePath": "data/eur_to_gbp_prices.csv"
    }
  ],
  ...
}
```

Historical price data can be obtained (in `CSV`) from `investing.com`. For example, you can retrieve the historical prices for `EUR/USD` at the following link: [EUR/USD Historical Data](https://www.investing.com/currencies/eur-usd-historical-data).

Historical price data must be provided as input to this program in `CSV` files. These files must not contain commas within values or double commas. Additionally, they must adhere strictly to the following structure (columns). Below is an example of a valid price history file:

```csv
Date,Price,Open,High,Low,Vol.,Change %
11/28/2024,1.0546,1.0562,1.0563,1.0527,,-0.18%
11/27/2024,1.0564,1.0487,1.0587,1.0472,,0.74%
11/26/2024,1.0486,1.0493,1.0544,1.0424,,-0.08%
11/25/2024,1.0494,1.0426,1.0530,1.0426,,0.74%
```

#### Workflow

1. Historical Prices:

   The program requires historical exchange rate data between EUR and the target fiat currencies (e.g., USD, GBP). These files should be placed in the data directory and their paths defined in the configuration.

2. Conversion:

   All transaction prices are first converted from EUR (the default fiat) to the target fiat currencies using the historical rates.

3. Computations:

   Metrics and volumes are computed independently for each target fiat currency based on the converted prices.

4. Output:

   The results are saved in dedicated subdirectories under output/ for each computed fiat currency. The folder structure follows this pattern:

   ```js
   output/<timestamp>/<fiat>/...
   ```

   For example:

   ```js
   output/2024-12-06/USD/...
   output/2024-12-06/GBP/...
   ```

   If your configuration specifies USD and GBP as target currencies, the program will create two separate folders (USD and GBP) inside the output directory. Each folder will contain the computed metrics in the specified fiat.

### Fiat Tokens

Tokens considered as Fiat are defined in the `fiatTokens` property in the configuration file:

```json
{
  ...
  "fiatTokens": [
    "USD",
    "EUR"
    // Add other fiat tokens here
  ],
  ...
}
```

`fiatTokens` plays a crucial role in determining whether a transaction should be classified as an investment or withdrawal of fiat currency. By using it, the application effectively distinguishes between fiat and non-fiat transactions, ensuring accurate calculations of cash investments and withdrawals.

### Stablecoin Tokens

Tokens considered as Stablecoin are defined in the `stablecoinTokens` property in the configuration file:

```json
{
  ...
  "stablecoinTokens": [
    "USDT",
    "USDC"
    // Add other stablecoin tokens here
  ],
  ...
}
```

### Token Aliases

The `tokenAliases` configuration is used to map multiple names (aliases) to a single primary token name within the system. This is useful when a token may be known by different names or symbols in different contexts, but you want to treat them as the same entity. For example, if "MATIC" is also referred to as "POL" or "Polygon", `tokenAliases` allows you to define these relationships so that operations involving any of these names are consistently attributed to the primary token "MATIC":

```json
{
  ...
  "tokenAliases": {
    "MATIC": ["POL", "Polygon"],
    "ETH": ["Ethereum", "Ether"],
    "BTC": ["Bitcoin"]
    // Add other aliases here
  },
  ...
}
```

Metrics are computed and saved considering the `raw` transactions (transactions that do not consider aliases) and the `aliased` transactions (transactions that consider aliases).

## Data Consideration

Here are some explanations concerning computed properties to avoid misunderstanding.

### Metric

- `counter`: The total number of transactions involving the token (received, sent, or used to pay fees)
- `fees`: The total volume of fees (in fiat) paid using the token.
- `quantity`: The final quantity of the token in the wallet.
- `pnlRealized`: The difference between the `sell` volume and the `buy` volume.
- `pnlRealizedStablecoin`: The difference between the `stablecoinOut` volume and the `stablecoinIn` volume.
- `pnlRealizedCash`: The difference between the `cashOut` volume and the `cashIn` volume.
- `breakevenPrice`: The price at which the realized profit/loss (`pnlRealized`) equals zero, representing a neutral financial position / no financial gain or loss (neutral price).
- `receive`: The token was received.
- `send`: The token was sent.
- `buy`: The token was purchased.
- `sell`: The token was sold.
- `stablecoinIn`: The token was purchased using a stablecoin.
- `stablecoinOut`: The token was sold in exchange for a stablecoin.
- `cashIn`: The token was purchased using fiat currency.
- `cashOut`: The token was sold in exchange for fiat currency.

### Metric Section

- `counter`: The number of transactions.
- `volume`: The total volume in fiat.
- `quantity`: The total quantity.
- `weightedAveragePrice`: The average price, weighted by the quantity of each transaction. It reflects the effective price considering transaction volumes.
- `averagePrice`: The simple average price, calculated by dividing the total price of all transactions by the number of transactions.

### Volume

- `counter`: The total number of transactions.
- `fees`: The total volume of fees (in fiat) paid across all transactions.
- `pnlRealized`: The overall difference between `sell` volumes and `buy` volumes for all assets.
- `pnlRealizedStablecoin`: The overall difference between `stablecoinOut` volumes and `stablecoinIn` volumes.
- `pnlRealizedCash`: The overall difference between `cashOut` volumes and `cashIn` volumes.
- `receive`: Assets were received.
- `send`: Assets were sent.
- `buy`: Assets were purchased.
- `sell`: Assets were sold.
- `stablecoinIn`: Assets were purchased using stablecoins.
- `stablecoinOut`: Assets were sold in exchange for stablecoins.
- `cashIn`: Assets were purchased using fiat currency.
- `cashOut`: Assets were sold in exchange for fiat currency.

### Volume Section

- `counter`: The number of transactions.
- `volume`: The total volume in fiat.

## Improvements

### 1. Use the NodeJS Date Object in Transactions

Replace the string representation of dates in the `Transaction` type with the `Date` object for more accurate and efficient date handling.

### 2. Track Historical Evolution for Tokens and Wallet

Objective:

- It would be valuable to compute and track the evolution of key metrics (transaction by transaction) over the entire history of activity. This applies both to individual tokens and the overall wallet.

Per-Token Metrics:

- For each token, the program should calculate and log metrics such as:
  - Quantity held over time.
  - Realized and unrealized profits/losses.
  - Average and weighted average prices.
  - Fees and transaction volumes.

Overall Wallet Metrics:

- Similarly, aggregate metrics for the entire wallet should be tracked, including:
  - Total portfolio value over time.
  - Realized and unrealized profits/losses for the wallet as a whole.
  - Allocation of assets (e.g., percentage of stablecoins, volatile tokens, fiat, etc.).

Historical Perspective:

- These computations provide a chronological view of how individual token balances and overall wallet performance evolved.
- Useful for identifying trends, making informed decisions, and improving portfolio management.

### 3. Enhancing Usability with a Graphical User Interface (GUI)

Objective:

- Implementing a GUI would make it significantly easier to visualize and interpret the computed metrics. This would improve the user experience by providing an intuitive way to interact with the data.

Key Benefits:

- Simplified Analysis:
  Users can view complex metrics and trends through charts, graphs, and tables instead of parsing raw data files.
- Real-Time Insights:
  Allow real-time or dynamic updates to the visualizations when new computations are performed.
- Better Understanding:
  Visual representations help identify patterns, trends, and anomalies in wallet performance or individual token behavior.
- Ease of Comparison:
  Facilitate side-by-side comparisons of metrics for different tokens, fiat currencies, or time periods.

Potential Features:

- Interactive dashboards with filters (e.g., by token, fiat currency, date range).
- Graphs for historical evolution of key metrics (e.g., portfolio value, profit/loss, token quantities).
- Tables summarizing aggregated metrics for the wallet and individual tokens.
- Export options for reports and visualizations (PDF, CSV, etc.).

### 4. Compute Metrics for a Specific Time Period

Enable the computation of metrics for a specific time period, such as one year, a single crypto market cycle, etc. This feature will provide greater flexibility for analyzing and evaluating investment performance.
