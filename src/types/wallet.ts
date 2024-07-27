export type PriceAction = {
  [label: string]: {
    quantity: number;
    price: number;
  }[];
};

export type Wallet = {
  [key: string]: {
    quantity: number;
    quantityDeposit: number;
    quantityWithdrawal: number;
    avgPriceDeposit: number;
    avgPriceWithdrawal: number;
    priceDeposit: PriceAction;
    priceWithdrawal: PriceAction;
  };
};

export type Platforms = {
  [key: string]: Wallet;
};
