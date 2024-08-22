# Token Transaction Parser

This project provides a function to parse and summarize token transactions, specifically designed to handle transactions from Waltio. The main functionality is implemented in TypeScript, and it calculates various properties for each token and group involved in the transactions, including quantities, cash flows, realized profit and loss (PnL), and historical data.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Data Structures](#data-structures)
  - [QuantityData](#quantitydata)
  - [TokenData](#tokendata)
  - [GroupData](#groupdata)
  - [Result](#result)
- [Functions](#functions)
  - [isFiatInvestmentTransaction](#isfiatinvestmenttransaction)
  - [isRelevantInvestmentTransaction](#isrelevantinvestmenttransaction)
  - [initializeTokenData](#initializetokendata)
  - [updateInvestmentData](#updateinvestmentdata)
  - [updateSellData](#updateselldata)
  - [updateCashOutData](#updatecashoutdata)
  - [updateFeesData](#updatefeesdata)
  - [updateQuantityData](#updatequantitydata)
  - [addHistoricEntry](#addhistoricentry)
  - [addGroupHistoricEntry](#addgrouphistoricentry)
  - [parseTransactions](#parsetransactions)
- [Calculation Details](#calculation-details)
- [Expected Quantities](#expected-quantities)
- [Groups Configuration](#groups-configuration)
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

1. Update the "expectedQuantities.ts" file with the expected quantities for specific tokens.
2. Update the "groups.ts" file to define the groups of tokens.
3. Import and use the "parseTransactions" function to parse an array of transactions.

Example usage:
```typescript
import parseTransactions from './path/to/parseTransactions';
import transactions from './path/to/transactions.json';

const result = parseTransactions(transactions);
console.log(result);
```

## Data Structures

### QuantityData

This structure holds the quantity-related data for a token.

- `computed`: The computed quantity based on the transactions.
- `expected`: The expected quantity (defined in `expectedQuantities.ts`).
- `delta`: The difference between the computed and expected quantities.
- `deltaPercent`: The percentage difference between the computed and expected quantities.

### TokenData

This structure holds the comprehensive data for a token.

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

### GroupData

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

### Result

This structure holds the overall summary and token data.

- `overview`: An object containing:
  - `cashIn`: The total cash invested.
  - `cashOut`: The total cash withdrawn.
  - `fees`: The total fees paid.
- `groups`: An object where each key is a group name and the value is an object of type `GroupData`.
- `tokens`: An object where each key is a token symbol and the value is an object of type `TokenData`.

## Functions

### isFiatInvestmentTransaction

Checks if a transaction is relevant for fiat investment calculations. A transaction is relevant if it's an exchange that involves fiat tokens or a deposit labeled as a crypto purchase ("Achat de crypto").

### isRelevantInvestmentTransaction

Checks if a transaction is relevant for total investment calculations. A transaction is relevant if it's a deposit with the label "Achat de crypto" or an exchange.

### initializeTokenData

Initializes token data if it does not exist.

### updateInvestmentData

Updates the token data with the investment information.

### updateSellData

Updates the token data with the sell information.

### updateCashOutData

Updates the token data with the cash-out information.

### updateFeesData

Updates the token data with the fees information.

### updateQuantityData

Updates the token data with the quantity information and calculates delta and deltaPercent.

### addHistoricEntry

Adds an entry to the token's historic data.

### addGroupHistoricEntry

Adds an entry to the group's historic data.

### parseTransactions

Parses a list of transactions to generate an investment summary.

## Calculation Details

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

## Expected Quantities

The expected quantities for specific tokens are defined in "expectedQuantities.ts":

```typescript
const expectedQuantities: Record<string, number> = {
  BTC: 0.21,
  ETH: 5,
  // Add other tokens and their expected quantities here
};

export default expectedQuantities;
```

The expected quantities are used to calculate the delta and deltaPercent for each token.

## Groups Configuration

Groups of tokens are defined in the "groups.ts" file. Each group is an array of token symbols that are aggregated together for reporting purposes:

```typescript
const groups = {
  layer_1: ['BTC', 'ETH'],
  altcoins: ['SOL', 'AVAX'],
  // Add other groups and their tokens here
};

export default groups;
```

The groups are used to aggregate data across multiple tokens, allowing for a comprehensive view of the performance of related assets.

## ChatGPT Assistance

The code in this project was developed with the assistance of ChatGPT, an AI language model created by OpenAI. ChatGPT provided code suggestions, refactoring tips, and explanations throughout the development process. This collaboration helped to ensure the code's correctness and efficiency while also providing insights into potential improvements and best practices.

The methodology for calculating each property, managing historical data, and structuring the codebase was informed by the suggestions provided by ChatGPT. While the final implementation and decisions were made by the developer, the AI's contributions played a significant role in shaping the project.

## Conclusion

This project offers a robust tool for parsing and summarizing token transactions, especially for those using the Waltio platform. By using TypeScript, the project ensures type safety and clarity in the codebase, making it easier to maintain and extend. Whether you're tracking individual token investments or grouping tokens together for a broader analysis, this tool provides detailed insights into your cryptocurrency portfolio's performance.

Feel free to contribute to this project by submitting issues or pull requests on the GitHub repository. Your feedback and improvements are welcome!

Happy coding!
