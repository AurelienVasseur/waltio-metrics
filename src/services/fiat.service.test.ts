import { describe, it, expect } from "vitest";
import { PriceHistory } from "../types/priceHistory";
import FiatService from "./fiat.service";
import { Transaction } from "../types/transaction";

describe("Fiat Service", () => {
  describe("getPriceHistory", () => {
    it("should return price history for a valid fiat configuration", async () => {
      const history = await FiatService.getPriceHistory("USD");
      expect(history).toStrictEqual([
        { date: new Date("2024-11-27T23:00:00.000Z"), price: 1.0546 },
        { date: new Date("2024-11-26T23:00:00.000Z"), price: 1.0564 },
        { date: new Date("2024-11-25T23:00:00.000Z"), price: 1.0486 },
        { date: new Date("2024-11-24T23:00:00.000Z"), price: 1.0494 },
        { date: new Date("2024-11-21T23:00:00.000Z"), price: 1.0417 },
        { date: new Date("2024-11-20T23:00:00.000Z"), price: 1.0473 },
        { date: new Date("2024-11-19T23:00:00.000Z"), price: 1.0543 },
        { date: new Date("2024-11-18T23:00:00.000Z"), price: 1.0595 },
        { date: new Date("2024-11-17T23:00:00.000Z"), price: 1.0599 },
        { date: new Date("2024-11-14T23:00:00.000Z"), price: 1.0541 },
      ]);
    });

    it("should return an empty array if the fiat configuration is not found", async () => {
      const history = await FiatService.getPriceHistory("GBP");
      expect(history).toStrictEqual([]);
    });

    it("should return an empty array if the CSV file is empty", async () => {
      const history = await FiatService.getPriceHistory("PLN");
      expect(history).toStrictEqual([]);
    });

    it("should handle invalid CSV rows gracefully", async () => {
      const history = await FiatService.getPriceHistory("JPY");
      expect(history).toStrictEqual([
        { date: new Date("2024-11-27T23:00:00.000Z"), price: 1.0546 },
        { date: new Date("2024-11-25T23:00:00.000Z"), price: 1.0486 },
        { date: new Date("2024-11-21T23:00:00.000Z"), price: 1.0417 },
        { date: new Date("2024-11-20T23:00:00.000Z"), price: 1.0473 },
        { date: new Date("2024-11-19T23:00:00.000Z"), price: 1.0543 },
        { date: new Date("2024-11-18T23:00:00.000Z"), price: 1.0595 },
        { date: new Date("2024-11-17T23:00:00.000Z"), price: 1.0599 },
      ]);
    });
  });

  describe("getPriceForDate", () => {
    const priceHistory: PriceHistory[] = [
      { date: new Date("2024-11-25"), price: 1.05 },
      { date: new Date("2024-11-26"), price: 1.06 },
      { date: new Date("2024-11-28"), price: 1.07 },
    ];

    it("should return the price for an exact date match", () => {
      const date = new Date("2024-11-26");
      const price = FiatService.getPriceForDate(priceHistory, date);
      expect(price).toBe(1.06);
    });

    it("should return the price for the closest date within ±7 days (after)", () => {
      const date = new Date("2024-11-29");
      const price = FiatService.getPriceForDate(priceHistory, date);
      expect(price).toBe(1.07); // Closest date is 2024-11-28
    });

    it("should return the price for the closest date within ±7 days (before)", () => {
      const date = new Date("2024-11-24");
      const price = FiatService.getPriceForDate(priceHistory, date);
      expect(price).toBe(1.05); // Closest date is 2024-11-25
    });

    it("should throw an error if no date is found within ±7 days", () => {
      const date = new Date("2024-11-15");
      expect(() => FiatService.getPriceForDate(priceHistory, date)).toThrow(
        "No price found for the date 2024-11-15T00:00:00.000Z within a ±7 days interval."
      );
    });

    it("should throw an error if priceHistory is empty", () => {
      const date = new Date("2024-11-25");
      expect(() => FiatService.getPriceForDate([], date)).toThrow(
        "No price found for the date 2024-11-25T00:00:00.000Z within a ±7 days interval."
      );
    });

    it("should handle edge case with multiple closest dates", () => {
      const extendedHistory: PriceHistory[] = [
        { date: new Date("2024-11-24"), price: 1.04 },
        { date: new Date("2024-11-25"), price: 1.05 },
        { date: new Date("2024-11-26"), price: 1.06 },
        { date: new Date("2024-11-27"), price: 1.065 },
        { date: new Date("2024-11-28"), price: 1.07 },
      ];
      const date = new Date("2024-11-27");
      const price = FiatService.getPriceForDate(extendedHistory, date);
      expect(price).toBe(1.065); // Exact match for 2024-11-27
    });
  });

  describe("convertPrices", () => {
    const priceHistory: PriceHistory[] = [
      { date: new Date("2024-11-25"), price: 1.05 },
      { date: new Date("2024-11-26"), price: 1.06 },
      { date: new Date("2024-11-28"), price: 1.07 },
    ];

    const transactions: Transaction[] = [
      {
        type: "Échange",
        date: "11/25/2024 12:29:09",
        timeZone: "GMT",
        amountReceived: 10,
        tokenReceived: "BTC",
        amountSent: 5,
        tokenSent: "ETH",
        fees: 0.1,
        tokenFees: "BTC",
        platform: "Binance",
        description: "Test transaction",
        label: "Test label",
        priceTokenSent: 100,
        priceTokenReceived: 200,
        priceTokenFees: 50,
        address: "address1",
        transactionHash: "hash1",
        externalId: "id1",
      },
      {
        type: "Dépôt",
        date: "11/26/2024 14:30:00",
        timeZone: "GMT+1:00",
        amountReceived: 15,
        tokenReceived: "ETH",
        platform: "Coinbase",
        description: "Another transaction",
        label: "Test label",
        address: "address2",
        transactionHash: "hash2",
        externalId: "id2",
      },
    ];

    it("should convert prices for transactions with matching price history", () => {
      const convertedTransactions = FiatService.convertPrices(
        transactions,
        priceHistory
      );

      expect(convertedTransactions).toEqual([
        {
          ...transactions[0],
          priceTokenSent: 105,
          priceTokenReceived: 210,
          priceTokenFees: 52.5,
        },
        {
          ...transactions[1],
          priceTokenFees: undefined,
          priceTokenReceived: undefined,
          priceTokenSent: undefined,
        },
      ]);
    });

    it("should skip conversion for optional fields if they are undefined", () => {
      const transactionsWithMissingFields: Transaction[] = [
        {
          type: "Retrait",
          date: "11/28/2024 09:15:00",
          timeZone: "GMT",
          platform: "Kraken",
          description: "Transaction without optional fields",
          label: "No prices",
          address: "address3",
          transactionHash: "hash3",
          externalId: "id3",
        },
      ];

      const convertedTransactions = FiatService.convertPrices(
        transactionsWithMissingFields,
        priceHistory
      );

      expect(convertedTransactions).toEqual([
        {
          ...transactionsWithMissingFields[0],
          priceTokenFees: undefined,
          priceTokenReceived: undefined,
          priceTokenSent: undefined,
        },
      ]);
    });

    it("should throw an error if a price for the transaction date is not found", () => {
      const transactionsWithNoPriceMatch: Transaction[] = [
        {
          type: "Échange",
          date: "10/20/2024 12:29:09",
          timeZone: "GMT",
          amountReceived: 10,
          tokenReceived: "BTC",
          amountSent: 5,
          tokenSent: "ETH",
          fees: 0.1,
          tokenFees: "BTC",
          platform: "Binance",
          description: "Test transaction without price match",
          label: "Test label",
          priceTokenSent: 100,
          priceTokenReceived: 200,
          priceTokenFees: 50,
          address: "address1",
          transactionHash: "hash1",
          externalId: "id1",
        },
      ];

      expect(() =>
        FiatService.convertPrices(transactionsWithNoPriceMatch, priceHistory)
      ).toThrowError(
        "No price found for the date 2024-10-20T10:29:09.000Z within a ±7 days interval."
      );
    });

    it("should not modify the original transaction objects", () => {
      const transactionsCopy = JSON.parse(JSON.stringify(transactions)); // Deep copy
      FiatService.convertPrices(transactions, priceHistory);

      expect(transactions).toEqual(transactionsCopy); // Original array should remain unchanged
    });
  });
});
