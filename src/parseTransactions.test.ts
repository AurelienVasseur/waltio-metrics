import { describe, it, expect } from "vitest";
import {
  isFiatInvestmentTransaction,
  isRelevantInvestmentTransaction,
  initializeTokenData,
  calculatePnlAndUnitPrice,
  addHistoricEntry,
  updateInvestmentData,
  updateSellData,
  updateCashOutData,
  updateFeesData,
  updateQuantityData,
  addGroupHistoricEntry,
  parseTransactions,
  TokenData,
  resolveTokenAlias,
  getTokenAliases,
} from "./parseTransactions"; // Adjust the import path as needed
import { TransactionFromWaltio } from "./types/transactionFromWaltio";

const mockTransaction: TransactionFromWaltio = {
  type: "Échange",
  date: "01/01/2023 12:00:00",
  timeZone: "UTC",
  platform: "Binance",
  description: "Exchange transaction",
  label: "Achat de crypto",
  address: "address123",
  trasactionHash: "hash123",
  externalId: "external123",
  amountSent: 100,
  amountReceived: 50,
  tokenSent: "USD",
  tokenReceived: "BTC",
  priceTokenSent: 1,
  priceTokenReceived: 50000,
  fees: 2,
  tokenFees: "BTC",
  priceTokenFees: 50000,
};

const mockSellTransaction: TransactionFromWaltio = {
  type: "Échange",
  date: "01/01/2023 12:00:00",
  timeZone: "UTC",
  platform: "Binance",
  description: "Exchange transaction",
  label: "Achat de crypto",
  address: "address123",
  trasactionHash: "hash123",
  externalId: "external123",
  amountSent: 50,
  amountReceived: 100,
  tokenSent: "BTC",
  tokenReceived: "USD",
  priceTokenSent: 50000,
  priceTokenReceived: 1,
  fees: 2,
  tokenFees: "BTC",
  priceTokenFees: 1,
};

describe("Waltio Metrics", () => {
  describe("resolveTokenAlias", () => {
    it("should return the main token name when an alias is provided", () => {
      expect(resolveTokenAlias("POL")).toBe("MATIC");
      expect(resolveTokenAlias("Polygon")).toBe("MATIC");
      expect(resolveTokenAlias("Ethereum")).toBe("ETH");
      expect(resolveTokenAlias("Ether")).toBe("ETH");
      expect(resolveTokenAlias("Bitcoin")).toBe("BTC");
    });

    it("should return the same token name if it is already the main token", () => {
      expect(resolveTokenAlias("MATIC")).toBe("MATIC");
      expect(resolveTokenAlias("ETH")).toBe("ETH");
      expect(resolveTokenAlias("BTC")).toBe("BTC");
    });

    it("should return the original token name if it is not found in the aliases", () => {
      expect(resolveTokenAlias("DOGE")).toBe("DOGE");
      expect(resolveTokenAlias("LTC")).toBe("LTC");
    });
  });

  describe("getTokenAliases", () => {
    it("should return an array with the main token and its aliases when the main token is provided", () => {
      expect(getTokenAliases("MATIC")).toEqual(["MATIC", "POL", "Polygon"]);
      expect(getTokenAliases("ETH")).toEqual(["ETH", "Ethereum", "Ether"]);
      expect(getTokenAliases("BTC")).toEqual(["BTC", "Bitcoin"]);
    });

    it("should return an array with the main token and its aliases when an alias is provided", () => {
      expect(getTokenAliases("POL")).toEqual(["MATIC", "POL", "Polygon"]);
      expect(getTokenAliases("Polygon")).toEqual(["MATIC", "POL", "Polygon"]);
      expect(getTokenAliases("Ethereum")).toEqual(["ETH", "Ethereum", "Ether"]);
      expect(getTokenAliases("Ether")).toEqual(["ETH", "Ethereum", "Ether"]);
      expect(getTokenAliases("Bitcoin")).toEqual(["BTC", "Bitcoin"]);
    });

    it("should return an array containing only the token if it is not found in the aliases", () => {
      expect(getTokenAliases("DOGE")).toEqual(["DOGE"]);
      expect(getTokenAliases("LTC")).toEqual(["LTC"]);
    });
  });

  describe("isFiatInvestmentTransaction", () => {
    it("should return true for fiat investment transactions", () => {
      expect(
        isFiatInvestmentTransaction({ ...mockTransaction, tokenSent: "USD" })
      ).toBe(true);
      expect(
        isFiatInvestmentTransaction({
          ...mockTransaction,
          type: "Dépôt",
          label: "Achat de crypto",
        })
      ).toBe(true);
    });

    it("should return false for non-fiat investment transactions", () => {
      expect(
        isFiatInvestmentTransaction({ ...mockTransaction, tokenSent: "BTC" })
      ).toBe(false);
      expect(
        isFiatInvestmentTransaction({
          ...mockTransaction,
          type: "Dépôt",
          label: "Other",
        })
      ).toBe(false);
    });
  });

  describe("isRelevantInvestmentTransaction", () => {
    it("should return true for relevant investment transactions", () => {
      expect(isRelevantInvestmentTransaction(mockTransaction)).toBe(true);
      expect(
        isRelevantInvestmentTransaction({
          ...mockTransaction,
          type: "Dépôt",
          label: "Achat de crypto",
        })
      ).toBe(true);
    });

    it("should return false for irrelevant transactions", () => {
      expect(
        isRelevantInvestmentTransaction({
          ...mockTransaction,
          type: "Dépôt",
          label: "Other",
        })
      ).toBe(false);
    });
  });

  describe("initializeTokenData", () => {
    it("should initialize token data with default values", () => {
      let tokens: Record<string, TokenData> = {};
      initializeTokenData(tokens, "BTC");
      expect(tokens["BTC"]).toEqual({
        aliases: ["BTC", "Bitcoin"],
        quantity: {
          computed: 0,
          expected: 0.5,
          delta: undefined,
          deltaPercent: undefined,
        },
        cashIn: 0,
        cashOut: 0,
        totalBuy: 0,
        totalSell: 0,
        pnlRealized: 0,
        unitPrice: {
          computed: 0,
          expected: 0,
        },
        historic: [],
      });
    });

    it("should not overwrite existing token data", () => {
      const tokens = { BTC: { quantity: { computed: 1 } } as any };
      initializeTokenData(tokens, "BTC");
      expect(tokens["BTC"].quantity.computed).toBe(1);
    });
  });

  describe("calculatePnlAndUnitPrice", () => {
    it("should correctly calculate pnlRealized and unitPrice", () => {
      const tokenData = {
        totalBuy: 5000,
        totalSell: 6000,
        quantity: { computed: 0.1 },
      } as any;
      const result = calculatePnlAndUnitPrice(tokenData);
      expect(result.pnlRealized).toBe(1000);
      expect(result.unitPriceComputed).toBe(0);
      expect(result.unitPriceExpected

      ).toBe(0);
    });

    it("should handle cases where computed quantity is zero", () => {
      const tokenData = {
        totalBuy: 5000,
        totalSell: 6000,
        quantity: { computed: 0 },
      } as any;
      const result = calculatePnlAndUnitPrice(tokenData);
      expect(result.unitPriceComputed).toBe(0);
      expect(result.unitPriceExpected).toBe(0);
    });
  });

  describe("addHistoricEntry", () => {
    it("should add an entry to the token's historic data", () => {
      const tokenData = {
        historic: [],
        totalBuy: 5000,
        totalSell: 6000,
        cashIn: 2000,
        cashOut: 1500,
        quantity: { computed: 0.1 },
      } as any;
      addHistoricEntry(tokenData, "01/01/2023", mockTransaction);
      expect(tokenData.historic).toHaveLength(1);
      expect(tokenData.historic[0]).toMatchObject({
        date: "01/01/2023",
        totalBuy: 5000,
        totalSell: 6000,
        quantity: 0.1,
        cashIn: 2000,
        cashOut: 1500,
      });
    });
  });

  describe("updateInvestmentData", () => {
    it("should update the token's investment data", () => {
      const tokens: Record<string, TokenData> = {};
      updateInvestmentData(mockTransaction, tokens);
      expect(tokens["BTC"]!.totalBuy).toBe(2500000);
      expect(tokens["BTC"]!.cashIn).toBe(2500000);
    });
  });

  describe("updateSellData", () => {
    it("should update the token's sell data", () => {
      const tokens: Record<string, TokenData> = {};
      updateSellData(mockTransaction, tokens);
      expect(tokens["USD"]!.totalSell).toBe(100);
    });
  });

  describe("updateCashOutData", () => {
    it("should update the token's cash out data", () => {
      const tokens: Record<string, TokenData> = {};
      updateCashOutData(mockSellTransaction, tokens);
      expect(tokens["BTC"]!.cashOut).toBe(2500000);
    });
  });

  describe("updateFeesData", () => {
    it("should update the total fees", () => {
      const totalFees = { value: 0 };
      updateFeesData(mockTransaction, totalFees);
      expect(totalFees.value).toBe(100000);
    });
  });

  describe("updateQuantityData", () => {
    it("should update the quantity data for received tokens", () => {
      const tokens: Record<string, TokenData> = {};
      updateQuantityData(mockTransaction, tokens, "01/01/2023");
      expect(tokens["BTC"]!.quantity.computed).toBe(48);
    });

    it("should update the quantity data for sent tokens", () => {
      const tokens: Record<string, TokenData> = {};
      updateQuantityData(mockTransaction, tokens, "01/01/2023");
      expect(tokens["USD"]!.quantity.computed).toBe(-100);
    });

    it("should update the quantity data for fees", () => {
      const tokens: Record<string, TokenData> = {};
      updateQuantityData(mockTransaction, tokens, "01/01/2023");
      expect(tokens["BTC"]!.quantity.computed).toBe(48);
    });
  });

  describe("addGroupHistoricEntry", () => {
    it("should add an entry to the group's historic data", () => {
      const groupData = { historic: [] } as any;
      addGroupHistoricEntry(groupData, "01/01/2023", mockTransaction);
      expect(groupData.historic).toHaveLength(1);
      expect(groupData.historic[0]).toMatchObject({
        date: "01/01/2023",
        cashIn: 0,
        cashOut: 0,
      });
    });
  });

  describe("parseTransactions", () => {
    it("should correctly parse transactions and return a comprehensive result", () => {
      const transactions = [
        {
          ...mockTransaction,
          type: "Dépôt" as const,
          label: "Achat de crypto",
        },
        { ...mockTransaction, tokenSent: "EUR" },
      ];
      const result = parseTransactions(transactions);
      expect(result.overview.cashIn).toBeGreaterThan(0);
      expect(result.tokens.BTC).toBeDefined();
      expect(result.groups).toBeDefined();
    });
  });
});
