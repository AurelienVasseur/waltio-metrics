export type PriceAction = {
  quantity: number;
  price: number;
  date: string;
};

export type Wallet = {
  [key: string]: {
    quantity: number;
    quantityBuy: number;
    quantitySell: number;
    priceBuy: PriceAction[];
    priceSell: PriceAction[];
    avgPriceBuy: number;
    avgPriceSell: number;
    sumPriceBuy: number;
    sumPriceSell: number;
    breakevenPrice: number;
  };
};

export type Platforms = {
  [key: string]: Wallet;
};
