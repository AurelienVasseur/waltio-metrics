# Token Transaction Parser

This project provides a function to parse and summarize token transactions, specifically designed to handle transactions from Waltio. The main functionality is implemented in TypeScript, and it calculates various properties for each token involved in the transactions, including quantities, cash flows, and realized profit and loss (PnL).

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Data Structures](#data-structures)
  - [QuantityData](#quantitydata)
  - [TokenData](#tokendata)
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
  - [parseTransactions](#parsetransactions)
- [Calculation Details](#calculation-details)
- [Expected Quantities](#expected-quantities)

## Overview

The main goal of this project is to parse token transactions and generate an investment summary that includes total fiat invested, total fees, and detailed token data. The token data includes computed and expected quantities, cash flows (cash in and cash out), total buy and sell values, realized PnL, and unit prices.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/token-transaction-parser.git
   ```
2. Navigate to the project directory:
   ```bash
   cd token-transaction-parser
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Update the `expectedQuantities.ts` file with the expected quantities for specific tokens.
2. Import and use the `parseTransactions` function to parse an array of transactions.

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

### Result

This structure holds the overall summary and token data.

- `overview`: An object containing:
  - `cashIn`: The total cash invested.
  - `cashOut`: The total cash withdrawn.
  - `fees`: The total fees paid.
- `tokens`: An object where each key is a token symbol and the value is an object of type `TokenData`.

## Functions

### isFiatInvestmentTransaction

Checks if a transaction is relevant for fiat investment calculations.

### isRelevantInvestmentTransaction

Checks if a transaction is relevant for total investment calculations.

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

### parseTransactions

Parses a list of transactions to generate an investment summary.

## Calculation Details

- **cashIn**: The total amount of fiat currency invested in a token. Calculated by summing up the value of all relevant "Dépôt" transactions with the label "Achat de crypto" and relevant "Échange" transactions involving USD/EUR as the sent token.
- **cashOut**: The total amount of fiat currency withdrawn from a token. Calculated by summing up the value of all relevant "Échange" transactions where USD/EUR is the received token.
- **totalBuy**: The total value of the token bought. Calculated by summing up the product of `amountReceived` and `priceTokenReceived` for all relevant transactions.
- **totalSell**: The total value of the token sold. Calculated by summing up the product of `amountSent` and `priceTokenSent` for all relevant transactions.
- **pnlRealized**: The realized profit and loss. Calculated as `totalSell` - `totalBuy`.
- **unitPrice**: The unit price required for the realized PnL to be zero. Calculated as `abs(pnlRealized) / quantity.computed` if `quantity.computed` is not zero and `pnlRealized` is not positive; otherwise, it is set to zero.
- **quantity**: 
  - **computed**: Updated by summing `amountReceived` and subtracting `amountSent` and `fees` for each transaction.
  - **expected**: Taken from `expectedQuantities.ts`.
  - **delta**: Calculated as `computed - expected`.
  - **deltaPercent**: Calculated as `(delta / expected) * 100` if `expected` is defined.

## Expected Quantities

The expected quantities for specific tokens are defined in `expectedQuantities.ts`:

```typescript
const expectedQuantities: Record<string, number> = {
  BTC: 0.21,
  ETH: 5,
  // Add other tokens and their expected quantities here
};

export default expectedQuantities;
```

The expected quantities are used to calculate the delta and deltaPercent for each token.
