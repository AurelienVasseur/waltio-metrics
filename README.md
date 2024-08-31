# Waltio Metrics

This project provides a function to parse and summarize token transactions, specifically designed to handle transactions from Waltio. The main functionality is implemented in TypeScript, and it calculates various properties for each token and group involved in the transactions, including quantities, cash flows, realized profit and loss (PnL), and historical data.

Based on the computed metrics, the project also includes a function to estimate the wallet's valuation under different scenarios.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Data Structures](#data-structures)
  - [Parse Transaction](#parse-transactions)
    - [QuantityData](#quantitydata)
    - [TokenData](#tokendata)
    - [GroupData](#groupdata)
    - [Result](#result)
  - [Valuation](#valuation)
    - [TokenValuation](#tokenValuation)
    - [ScenarioValuation](#scenarioValuation)
    - [ValuationsResult](#valuationsResult)
- [Metrics Calculation Details](#metrics-calculation-details)
- [Valuation Calculation Details](#valuation-calculation-details)
- [ChatGPT Assistance](#chatgpt-assistance)

## Overview

The main goal of this project is to parse token transactions and generate an investment summary that includes total fiat invested, total fees, and detailed data for each token and group of tokens. The token data includes computed and expected quantities, cash flows (cash in and cash out), total buy and sell values, realized PnL, unit prices, and historical data tracking changes over time.

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install the dependencies:
   ```bash
   npm install
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

Original names/aliases used in a transaction are still visible in the transaction details in history.

### Expected Quantities

The expected quantities for specific tokens are defined in the `expectedQuantities` property in the configuration file:

```json
{
  ...
  "expectedQuantities": {
    "BTC": 0.21,
    "ETH": 5
    // Add other tokens and their expected quantities here
  },
  ...
}
```

The expected quantities are used to calculate the delta and deltaPercent for each token.

### Groups Configuration

Groups of tokens are defined in the `groups` property in the configuration file. Each group is an array of token symbols that are aggregated together for reporting purposes:

```json
{
  ...
  "groups": {
    "layer_1": ["BTC", "ETH"]
    // Add other groups and their tokens here
  }
  ...
}
```

The groups are used to aggregate data across multiple tokens, allowing for a comprehensive view of the performance of related assets.

### Scenarios

Scenarios in the valuation process allow you to assess the potential value of a token or a portfolio under different market conditions or assumptions. They provide a way to compare and analyze how changes in variables, such as market prices or token quantities, impact the overall valuation, helping in strategic decision-making and risk assessment.

```json
{
  ...
  "scenarios": {
    "Optimistic": {
      "description": "A scenario where the market is bullish and prices are high.",
      "prices": {
        "MATIC": 2.5,
        "ETH": 3500,
        "BTC": 60000
      }
    },
    "Pessimistic": {
      "description": "A scenario where the market is bearish and prices are low.",
      "prices": {
        "MATIC": 0.8,
        "ETH": 1500,
        "BTC": 30000
      }
    }
    // Add other scenarios here
  },
  ...
}
```


## Data Structures

### Parse Transactions

#### QuantityData

This structure holds the quantity-related data for a token.

- `computed`: The computed quantity based on the transactions.
- `expected`: The expected quantity (defined in `expectedQuantities.ts`).
- `delta`: The difference between the computed and expected quantities.
- `deltaPercent`: The percentage difference between the computed and expected quantities.

#### TokenData

This structure holds the comprehensive data for a token.

- `aliases`: An array containing the name of the token and its aliases.
- `quantity`: An object of type `QuantityData`.
- `cashIn`: The total amount of fiat currency invested in the token.
- `cashOut`: The total amount of fiat currency withdrawn from the token.
- `totalBuy`: The total value of the token bought.
- `totalSell`: The total value of the token sold.
- `pnlRealized`: The realized profit and loss for the token.
- `unitPrice`: The unit price required for the realized PnL to be zero.
- `historic`: An array of historical entries, each including:
  - `date`: The date of the transaction.
  - `cashInDelta`: The change in `cashIn` compared to the previous entry.
  - `cashOutDelta`: The change in `cashOut` compared to the previous entry.
  - `totalBuyDelta`: The change in `totalBuy` compared to the previous entry.
  - `totalSellDelta`: The change in `totalSell` compared to the previous entry.
  - `transaction`: The transaction details.

#### GroupData

This structure holds the comprehensive data for a group of tokens.

- `tokens`: An array of tokens that belong to the group.
- `cashIn`: The aggregated cash in for the group.
- `cashOut`: The aggregated cash out for the group.
- `totalBuy`: The aggregated total buy value for the group.
- `totalSell`: The aggregated total sell value for the group.
- `pnlRealized`: The aggregated realized PnL for the group.
- `historic`: An array of historical entries, each including:
  - `date`: The date of the transaction.
  - `cashIn`: The aggregated cash in for the group at that point in time.
  - `cashOut`: The aggregated cash out for the group at that point in time.
  - `totalBuy`: The aggregated total buy value for the group at that point in time.
  - `totalSell`: The aggregated total sell value for the group at that point in time.
  - `pnlRealized`: The aggregated realized PnL for the group at that point in time.
  - `transaction`: The transaction details.

#### Result

This structure holds the overall summary and token data.

- `overview`: An object containing:
  - `cashIn`: The total cash invested.
  - `cashOut`: The total cash withdrawn.
  - `fees`: The total fees paid.
- `groups`: An object where each key is a group name and the value is an object of type `GroupData`.
- `tokens`: An object where each key is a token symbol and the value is an object of type `TokenData`.

### Valuation

#### TokenValuation

This structure holds the valuation data for a token under a specific scenario.

- `computed`: The computed valuation of the token based on the given scenario.
- `expected`: The expected valuation of the token, if expected quantities are defined.

#### ScenarioValuation

This structure holds the valuation data for all tokens under a specific scenario, including the total computed and expected valuations.

- `scenarioName`: The name of the scenario.
- `scenarioDescription`: A brief description of the scenario.
- `tokenValuations`: A record object where each key is a token symbol and the value is an object of type `TokenValuation`.
- `totalComputed`: The total computed valuation for all tokens under the scenario.
- `totalExpected`: The total expected valuation for all tokens under the scenario, if defined.

#### ValuationsResult

This structure represents the overall valuation result across multiple scenarios.

- An array of objects, each representing a different scenario's valuation, where each object is of type `ScenarioValuation`.


## Metrics Calculation Details

- **cashIn**: The total amount of fiat currency invested in a token. Calculated by summing up the value of all relevant "Dépôt" transactions with the label "Achat de crypto" and relevant "Échange" transactions involving USD/EUR as the sent token.

- **cashOut**: The total amount of fiat currency withdrawn from a token. Calculated by summing up the value of all relevant "Échange" transactions where USD/EUR is the received token.

- **totalBuy**: The total value of the token bought. Calculated by summing up the product of "amountReceived" and "priceTokenReceived" for all relevant transactions.

- **totalSell**: The total value of the token sold. Calculated by summing up the product of "amountSent" and "priceTokenSent" for all relevant transactions.

- **pnlRealized**: The realized profit and loss. Calculated as "totalSell" - "totalBuy".

- **unitPrice**: The unit price required for the realized PnL to be zero. Calculated as "abs(pnlRealized) / quantity.computed" if "quantity.computed" is not zero and "pnlRealized" is not positive; otherwise, it is set to zero.

- **quantity**: 
  - **computed**: Updated by summing "amountReceived" and subtracting "amountSent" and "fees" for each transaction.
  - **expected**: Taken from "expectedQuantities.ts".
  - **delta**: Calculated as "computed - expected".
  - **deltaPercent**: Calculated as "(delta / expected) * 100" if "expected" is defined.

- **cashInDelta**: The change in "cashIn" compared to the previous entry in the token's historic data.

- **cashOutDelta**: The change in "cashOut" compared to the previous entry in the token's historic data.

- **totalBuyDelta**: The change in "totalBuy" compared to the previous entry in the token's historic data.

- **totalSellDelta**: The change in "totalSell" compared to the previous entry in the token's historic data.

## Valuation Calculation Details

- **computed**: The computed valuation of a token or scenario. Calculated by taking the current market price of the token (within the scenario) and multiplying it by the quantity of the token held. For scenarios, it is the sum of computed valuations for all tokens within the scenario.

- **expected**: The expected valuation of a token or scenario. This value is predefined in the configuration or derived from expected quantities and current market prices (within the scenario). For scenarios, it is the sum of expected valuations for all tokens within the scenario.

- **totalComputed**: The aggregated computed valuation across all tokens in a scenario. Calculated by summing up the "computed" valuations for each token within the scenario.

- **totalExpected**: The aggregated expected valuation across all tokens in a scenario. Calculated by summing up the "expected" valuations for each token within the scenario. If the expected value is not defined for a token, it is excluded from this total.

- **scenarioName**: The name of the scenario used for valuation. This is a descriptive identifier provided in the configuration.

- **scenarioDescription**: A brief description of the scenario, outlining the assumptions or conditions under which the valuation is performed. This helps contextualize the computed and expected values.

- **tokenValuations**: A detailed record of valuations for each token under a specific scenario. Each entry includes the "computed" and "expected" values for a token, as described above.

- **totalComputed**: For the overall valuation, this represents the sum of all computed valuations across all scenarios. It gives a comprehensive view of the wallet's value under various conditions.

- **totalExpected**: For the overall valuation, this represents the sum of all expected valuations across all scenarios. It provides a benchmark or target value for the wallet under various conditions.


## ChatGPT Assistance

The code in this project was developed with the assistance of ChatGPT, an AI language model created by OpenAI. ChatGPT provided code suggestions, refactoring tips, and explanations throughout the development process. This collaboration helped to ensure the code's correctness and efficiency while also providing insights into potential improvements and best practices.

The methodology for calculating each property, managing historical data, and structuring the codebase was informed by the suggestions provided by ChatGPT. While the final implementation and decisions were made by the developer, the AI's contributions played a significant role in shaping the project.

## Conclusion

This project offers a robust tool for parsing and summarizing token transactions, especially for those using the Waltio platform. By using TypeScript, the project ensures type safety and clarity in the codebase, making it easier to maintain and extend. Whether you're tracking individual token investments or grouping tokens together for a broader analysis, this tool provides detailed insights into your cryptocurrency portfolio's performance.

Feel free to contribute to this project by submitting issues or pull requests on the GitHub repository. Your feedback and improvements are welcome!

Happy coding!
