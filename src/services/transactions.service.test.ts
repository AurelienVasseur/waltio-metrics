import { describe, it, expect, vi } from "vitest";

import {
  transactions,
  ETH_transactions,
  USDT_transactions,
} from "../../tests/data/transactions_transactionsService";
import TransactionsService from "./transactions.service";
import { Transaction } from "../types/transaction";

describe("Transaction Service", () => {
  describe("getTokens", () => {
    it("SHOULD return all tokens used in the provided transactions", () => {
      const { tokensReceived, tokensSent, tokensFees } =
        TransactionsService.getTokens(transactions);
      expect(new Set(tokensReceived)).toEqual(
        new Set(["BTC", "USDT", "ETH", "BNB", "ADA", "XRP"])
      );
      expect(new Set(tokensSent)).toEqual(
        new Set(["ETH", "BTC", "USDT", "SOL", "BNB"])
      );
      expect(new Set(tokensFees)).toEqual(
        new Set(["ETH", "BTC", "USDT", "SOL", "BNB", "XRP"])
      );
    });
  });

  describe("isRelatedTo", () => {
    it("SHOULD return true if the received token is the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isRelatedTo = TransactionsService.isRelatedTo(transaction, "BTC");
      expect(isRelatedTo).toEqual(true);
    });

    it("SHOULD return true if the sent token is the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isRelatedTo = TransactionsService.isRelatedTo(transaction, "ETH");
      expect(isRelatedTo).toEqual(true);
    });

    it("SHOULD return true if the fees token is the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isRelatedTo = TransactionsService.isRelatedTo(transaction, "USDT");
      expect(isRelatedTo).toEqual(true);
    });

    it("SHOULD return false if the token is not used in the transaction", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isRelatedTo = TransactionsService.isRelatedTo(transaction, "EGLD");
      expect(isRelatedTo).toEqual(false);
    });
  });

  describe("getTokenTransactions", () => {
    it("SHOULD return transactions related to the specified token", () => {
      const ETH_r = TransactionsService.getTokenTransactions(
        transactions,
        "ETH"
      );
      expect(new Set(ETH_r)).toEqual(new Set(ETH_transactions));
      const USDT_r = TransactionsService.getTokenTransactions(
        transactions,
        "USDT"
      );
      expect(new Set(USDT_r)).toEqual(new Set(USDT_transactions));
    });

    it("SHOULD return 0 transactions if the token isn't used", () => {
      const EGLD_r = TransactionsService.getTokenTransactions(
        transactions,
        "EGLD"
      );
      expect(new Set(EGLD_r)).toEqual(new Set([]));
    });
  });

  describe("hasFees", () => {
    it("SHOULD return true if there are fees", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFees = TransactionsService.hasFees(transaction);
      expect(hasFees).toEqual(true);
    });

    it("SHOULD return false if there is no fees", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFees = TransactionsService.hasFees(transaction);
      expect(hasFees).toEqual(false);
    });

    it("SHOULD return false if there is no price token fees", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFees = TransactionsService.hasFees(transaction);
      expect(hasFees).toEqual(false);
    });

    it("SHOULD return false if there is no fees information", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFees = TransactionsService.hasFees(transaction);
      expect(hasFees).toEqual(false);
    });
  });

  describe("hasFeesFor", () => {
    it("SHOULD return true if the token is used as fees", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFeesFor = TransactionsService.hasFeesFor(transaction, "USDT");
      expect(hasFeesFor).toEqual(true);
    });

    it("SHOULD return false if the token is not used as fees", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFeesFor = TransactionsService.hasFeesFor(transaction, "ETH");
      expect(hasFeesFor).toEqual(false);
    });

    it("SHOULD return false if there is no fees", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const hasFeesFor = TransactionsService.hasFeesFor(transaction, "ETH");
      expect(hasFeesFor).toEqual(false);
    });
  });

  describe("isReceive", () => {
    it("SHOULD return true if there is a received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isReceive = TransactionsService.isReceive(transaction);
      expect(isReceive).toEqual(true);
    });

    it("SHOULD return false if there is no received token", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "04/05/2024 09:12:35",
        timeZone: "PST",
        amountSent: 0.5,
        tokenSent: "BTC",
        fees: 0.0001,
        tokenFees: "BTC",
        platform: "Kraken",
        description: "Retrait de fonds",
        label: "Retrait",
        priceTokenSent: 45000,
        priceTokenFees: 45000,
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        trasactionHash: "0xabcdef0987fedcba",
        externalId: "ext67890",
      };
      const isReceive = TransactionsService.isReceive(transaction);
      expect(isReceive).toEqual(false);
    });

    it("SHOULD return false if there is no received token name", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isReceive = TransactionsService.isReceive(transaction);
      expect(isReceive).toEqual(false);
    });

    it("SHOULD return false if there is no received token amount", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isReceive = TransactionsService.isReceive(transaction);
      expect(isReceive).toEqual(false);
    });

    it("SHOULD return false if there is not received token price", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isReceive = TransactionsService.isReceive(transaction);
      expect(isReceive).toEqual(false);
    });
  });

  describe("isReceiveFor", () => {
    it("SHOULD return true if the received token is the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isReceiveFor = TransactionsService.isReceiveFor(transaction, "BTC");
      expect(isReceiveFor).toEqual(true);
    });

    it("SHOULD return false if the received token is not the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isReceiveFor = TransactionsService.isReceiveFor(
        transaction,
        "USDT"
      );
      expect(isReceiveFor).toEqual(false);
    });

    it("SHOULD return false if there is no received token", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "04/05/2024 09:12:35",
        timeZone: "PST",
        amountSent: 0.5,
        tokenSent: "BTC",
        fees: 0.0001,
        tokenFees: "BTC",
        platform: "Kraken",
        description: "Retrait de fonds",
        label: "Retrait",
        priceTokenSent: 45000,
        priceTokenFees: 45000,
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        trasactionHash: "0xabcdef0987fedcba",
        externalId: "ext67890",
      };
      const isReceiveFor = TransactionsService.isReceiveFor(transaction, "BTC");
      expect(isReceiveFor).toBe(false);
    });
  });

  describe("isSend", () => {
    it("SHOULD return true if there is a sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSend = TransactionsService.isSend(transaction);
      expect(isSend).toEqual(true);
    });

    it("SHOULD return false if there is no sent token", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isSend = TransactionsService.isSend(transaction);
      expect(isSend).toEqual(false);
    });

    it("SHOULD return false if there is no sent token name", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSend = TransactionsService.isSend(transaction);
      expect(isSend).toEqual(false);
    });

    it("SHOULD return false if there is no sent token amount", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSend = TransactionsService.isSend(transaction);
      expect(isSend).toEqual(false);
    });

    it("SHOULD return false if there is no sent token price", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSend = TransactionsService.isSend(transaction);
      expect(isSend).toEqual(false);
    });
  });

  describe("isSendFor", () => {
    it("SHOULD return true if the sent token is the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSendFor = TransactionsService.isSendFor(transaction, "ETH");
      expect(isSendFor).toEqual(true);
    });

    it("SHOULD return false if the sent token is not the token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSendFor = TransactionsService.isSendFor(transaction, "BTC");
      expect(isSendFor).toEqual(false);
    });

    it("SHOULD return false if there is no sent token", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isSendFor = TransactionsService.isSendFor(transaction, "ETH");
      expect(isSendFor).toEqual(false);
    });
  });

  describe("isBuy", () => {
    it("SHOULD return true if the transaction is an exchange with a sent token and a received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(true);
    });

    it("SHOULD return false if the transaction is an exchange with no received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(false);
    });

    it("SHOULD return false if the transaction is an exchange with no sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(false);
    });

    it("SHOULD return true if the transaction is a deposit with a received token and a label 'Achat de crypto'", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(true);
    });

    it("SHOULD return false if the transaction is a deposit with no received token", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(false);
    });

    it("SHOULD return false if the transaction is a deposit with a label not equals to 'Achat de crypto'", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Transfert entre comptes",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(false);
    });

    it("SHOULD return false if the transaction is a withdrawal", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "04/05/2024 09:12:35",
        timeZone: "PST",
        amountSent: 0.5,
        tokenSent: "BTC",
        fees: 0.0001,
        tokenFees: "BTC",
        platform: "Kraken",
        description: "Retrait de fonds",
        label: "Retrait",
        priceTokenSent: 45000,
        priceTokenFees: 45000,
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        trasactionHash: "0xabcdef0987fedcba",
        externalId: "ext67890",
      };
      const isBuy = TransactionsService.isBuy(transaction);
      expect(isBuy).toBe(false);
    });
  });

  describe("isBuyFor", () => {
    it("SHOULD return true if it's a buy transaction of the token", () => {
      const spy = vi.spyOn(TransactionsService, "isBuy").mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isBuyFor = TransactionsService.isBuyFor(transaction, "BTC");
      spy.mockRestore();
      expect(isBuyFor).toBe(true);
    });

    it("SHOULD return false if the token bought is not the provided token", () => {
      const spy = vi.spyOn(TransactionsService, "isBuy").mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "EGLD",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de EGLD contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isBuyFor = TransactionsService.isBuyFor(transaction, "BTC");
      spy.mockRestore();
      expect(isBuyFor).toBe(false);
    });

    it("SHOULD return false if it's not a buy transaction", () => {
      const spy = vi.spyOn(TransactionsService, "isBuy").mockReturnValue(false);
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Transfert entre comptes",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isBuyFor = TransactionsService.isBuyFor(transaction, "BTC");
      spy.mockRestore();
      expect(isBuyFor).toBe(false);
    });
  });

  describe("isSell", () => {
    it("SHOULD return true if the transaction is an exchange with a received token and a sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSell = TransactionsService.isSell(transaction);
      expect(isSell).toBe(true);
    });

    it("SHOULD return false if the transaction is an exchange with no received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSell = TransactionsService.isSell(transaction);
      expect(isSell).toBe(false);
    });

    it("SHOULD return false if the transaction is an exchange with no sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSell = TransactionsService.isSell(transaction);
      expect(isSell).toBe(false);
    });

    it("SHOULD return false if the transaction is a deposit", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "06/10/2024 08:33:12",
        timeZone: "UTC",
        amountReceived: 1500,
        tokenReceived: "BNB",
        platform: "Binance",
        description: "Dépôt de BNB",
        label: "Dépôt",
        priceTokenReceived: 300,
        address: "bnb1abcdeffedcba",
        trasactionHash: "0xabc123fed5679876",
        externalId: "ext55678",
      };
      const isSell = TransactionsService.isSell(transaction);
      expect(isSell).toBe(false);
    });

    it("SHOULD return false if the transaction is a withdrawal", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "07/18/2024 11:22:45",
        timeZone: "CET",
        amountSent: 1000,
        tokenSent: "USDT",
        fees: 10,
        tokenFees: "USDT",
        platform: "KuCoin",
        description: "Retrait de USDT",
        label: "Retrait",
        priceTokenSent: 1,
        priceTokenFees: 1,
        address: "TXYZ1234567890ABCDEF",
        trasactionHash: "0xabcd1234567890ef",
        externalId: "ext90909",
      };
      const isSell = TransactionsService.isSell(transaction);
      expect(isSell).toBe(false);
    });
  });

  describe("isSellFor", () => {
    it("SHOULD return true if it's a sell transaction of the token", () => {
      const spy = vi.spyOn(TransactionsService, "isSell").mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSellFor = TransactionsService.isSellFor(transaction, "ETH");
      spy.mockRestore();
      expect(isSellFor).toBe(true);
    });

    it("SHOULD return false if the token sold is not the provided token", () => {
      const spy = vi.spyOn(TransactionsService, "isSell").mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isSellFor = TransactionsService.isSellFor(transaction, "BTC");
      spy.mockRestore();
      expect(isSellFor).toBe(false);
    });

    it("SHOULD return false if it's not a sell transaction", () => {
      const spy = vi
        .spyOn(TransactionsService, "isSell")
        .mockReturnValue(false);
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Transfert entre comptes",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isSellFor = TransactionsService.isSellFor(transaction, "BTC");
      spy.mockRestore();
      expect(isSellFor).toBe(false);
    });
  });

  describe("isStablecoinIn", () => {
    it("SHOULD return true if the buy transaction is an exchange with a stablecoin sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "USDT",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de USDT contre BTC",
        label: "Achat de crypto",
        priceTokenSent: 1,
        priceTokenReceived: 40000,
        priceTokenFees: 1,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinIn = TransactionsService.isStablecoinIn(transaction);
      expect(isStablecoinIn).toBe(true);
    });

    it("SHOULD return false if the buy transaction is an exchange with a non-stablecoin sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "USD",
        fees: 0.01,
        tokenFees: "USD",
        platform: "Binance",
        description: "Échange de BTC contre USD",
        label: "Achat de crypto",
        priceTokenSent: 1,
        priceTokenReceived: 40000,
        priceTokenFees: 1,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinIn = TransactionsService.isStablecoinIn(transaction);
      expect(isStablecoinIn).toBe(false);
    });

    it("SHOULD return false if the transaction is a withdrawal", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "04/05/2024 09:12:35",
        timeZone: "PST",
        amountSent: 0.5,
        tokenSent: "BTC",
        fees: 0.0001,
        tokenFees: "BTC",
        platform: "Kraken",
        description: "Retrait de fonds",
        label: "Retrait",
        priceTokenSent: 45000,
        priceTokenFees: 45000,
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        trasactionHash: "0xabcdef0987fedcba",
        externalId: "ext67890",
      };
      const isCashIn = TransactionsService.isCashIn(transaction);
      expect(isCashIn).toBe(false);
    });
  });

  describe("isStatblecoinInFor", () => {
    it("SHOULD return true if it's a stablecoin-in transaction of the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isStablecoinIn")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "USDT",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de USDT contre BTC",
        label: "Achat de crypto",
        priceTokenSent: 1,
        priceTokenReceived: 40000,
        priceTokenFees: 1,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinInFor = TransactionsService.isStablecoinInFor(
        transaction,
        "BTC"
      );
      spy.mockRestore();
      expect(isStablecoinInFor).toBe(true);
    });

    it("SHOULD return false if the token bought is not the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isStablecoinIn")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "USDT",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de USDT contre BTC",
        label: "Achat de crypto",
        priceTokenSent: 1,
        priceTokenReceived: 40000,
        priceTokenFees: 1,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinInFor = TransactionsService.isStablecoinInFor(
        transaction,
        "EGLD"
      );
      spy.mockRestore();
      expect(isStablecoinInFor).toBe(false);
    });

    it("SHOULD return false if it's not a stablecoin-in transaction", () => {
      const spy = vi
        .spyOn(TransactionsService, "isStablecoinIn")
        .mockReturnValue(false);
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Transfert entre comptes",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isStablecoinInFor = TransactionsService.isStablecoinInFor(
        transaction,
        "EGLD"
      );
      spy.mockRestore();
      expect(isStablecoinInFor).toBe(false);
    });
  });

  describe("isStablecoinOut", () => {
    it("SHOULD return true if the sell transaction is an exchange with a stablecoin received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "USDT",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre USDT",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinOut = TransactionsService.isStablecoinOut(transaction);
      expect(isStablecoinOut).toBe(true);
    });

    it("SHOULD return false if the sell transaction is an exchange with a non-stablecoin received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinOut = TransactionsService.isStablecoinOut(transaction);
      expect(isStablecoinOut).toBe(false);
    });

    it("SHOULD return false if the transaction is a deposit", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "09/01/2024 10:40:00",
        timeZone: "CET",
        amountReceived: 2000,
        tokenReceived: "ETH",
        platform: "Coinbase",
        description: "Dépôt de ETH",
        label: "Dépôt",
        priceTokenReceived: 1800,
        address: "0xabcdef1234567890",
        trasactionHash: "0xeth1234567890abc",
        externalId: "ext20224",
      };
      const isStablecoinOut = TransactionsService.isStablecoinOut(transaction);
      expect(isStablecoinOut).toBe(false);
    });

    it("SHOULD return false if the transaction is a withdrawal", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "10/07/2024 15:30:55",
        timeZone: "EST",
        amountSent: 5,
        tokenSent: "BNB",
        fees: 0.01,
        tokenFees: "BNB",
        platform: "Binance",
        description: "Retrait de BNB",
        label: "Retrait",
        priceTokenSent: 300,
        priceTokenFees: 300,
        address: "bnb1fedcba0987654321",
        trasactionHash: "0x0987bnb1234abcd",
        externalId: "ext30334",
      };
      const isStablecoinOut = TransactionsService.isStablecoinOut(transaction);
      expect(isStablecoinOut).toBe(false);
    });
  });

  describe("isStablecoinOutFor", () => {
    it("SHOULD return true if it's a stablecoin-out transaction of the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isStablecoinOut")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "USDT",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre USDT",
        label: "Swap",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinOutFor = TransactionsService.isStablecoinOutFor(
        transaction,
        "ETH"
      );
      spy.mockRestore();
      expect(isStablecoinOutFor).toBe(true);
    });

    it("SHOULD return false if the token sold is not the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isStablecoinOut")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "USDT",
        amountSent: 100,
        tokenSent: "BTC",
        fees: 0.01,
        tokenFees: "BTC",
        platform: "Binance",
        description: "Échange de BTC contre USDT",
        label: "Swap",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinOutFor = TransactionsService.isStablecoinOutFor(
        transaction,
        "ETH"
      );
      spy.mockRestore();
      expect(isStablecoinOutFor).toBe(false);
    });

    it("SHOULD return false if it's not a stablecoin-out transaction", () => {
      const spy = vi
        .spyOn(TransactionsService, "isStablecoinOut")
        .mockReturnValue(false);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BNB",
        amountSent: 100,
        tokenSent: "BTC",
        fees: 0.01,
        tokenFees: "BTC",
        platform: "Binance",
        description: "Échange de BTC contre BNB",
        label: "Swap",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isStablecoinOutFor = TransactionsService.isStablecoinOutFor(
        transaction,
        "ETH"
      );
      spy.mockRestore();
      expect(isStablecoinOutFor).toBe(false);
    });
  });

  describe("isCashIn", () => {
    it("SHOULD return true if the buy transaction is a deposit", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isCashIn = TransactionsService.isCashIn(transaction);
      expect(isCashIn).toBe(true);
    });

    it("SHOULD return false if the transaction is a deposit but not a buy transaction", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Transfert entre comptes",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isCashIn = TransactionsService.isCashIn(transaction);
      expect(isCashIn).toBe(false);
    });

    it("SHOULD return true if the buy transaction is an exchange with a fiat sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "USD",
        fees: 0.01,
        tokenFees: "USD",
        platform: "Binance",
        description: "Échange de BTC contre USD",
        label: "Achat de crypto",
        priceTokenSent: 1,
        priceTokenReceived: 40000,
        priceTokenFees: 1,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashIn = TransactionsService.isCashIn(transaction);
      expect(isCashIn).toBe(true);
    });

    it("SHOULD return false if the buy transaction is an exchange with a non-fiat sent token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "USDT",
        fees: 0.01,
        tokenFees: "USDT",
        platform: "Binance",
        description: "Échange de BTC contre USDT",
        label: "Achat de crypto",
        priceTokenSent: 1,
        priceTokenReceived: 40000,
        priceTokenFees: 1,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashIn = TransactionsService.isCashIn(transaction);
      expect(isCashIn).toBe(false);
    });

    it("SHOULD return false if the transaction is a withdrawal", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "04/05/2024 09:12:35",
        timeZone: "PST",
        amountSent: 0.5,
        tokenSent: "BTC",
        fees: 0.0001,
        tokenFees: "BTC",
        platform: "Kraken",
        description: "Retrait de fonds",
        label: "Retrait",
        priceTokenSent: 45000,
        priceTokenFees: 45000,
        address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        trasactionHash: "0xabcdef0987fedcba",
        externalId: "ext67890",
      };
      const isCashIn = TransactionsService.isCashIn(transaction);
      expect(isCashIn).toBe(false);
    });
  });

  describe("isCashInFor", () => {
    it("SHOULD return true if it's a cash-in transaction of the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isCashIn")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isCashInFor = TransactionsService.isCashInFor(transaction, "EGLD");
      spy.mockRestore();
      expect(isCashInFor).toBe(true);
    });

    it("SHOULD return false if the token bought is not the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isCashIn")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "BTC",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Achat de crypto",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isCashInFor = TransactionsService.isCashInFor(transaction, "EGLD");
      spy.mockRestore();
      expect(isCashInFor).toBe(false);
    });

    it("SHOULD return false if it's not a cash-in transaction", () => {
      const spy = vi
        .spyOn(TransactionsService, "isCashIn")
        .mockReturnValue(false);
      const transaction: Transaction = {
        type: "Dépôt",
        date: "03/10/2024 14:15:20",
        timeZone: "CET",
        amountReceived: 500,
        tokenReceived: "EGLD",
        platform: "Coinbase",
        description: "Achat MultiversX",
        label: "Transfert entre comptes",
        priceTokenReceived: 26,
        address: "0xabcdef0987654321",
        trasactionHash: "0x0987654321abcdef",
        externalId: "ext54321",
      };
      const isCashInFor = TransactionsService.isCashInFor(transaction, "EGLD");
      spy.mockRestore();
      expect(isCashInFor).toBe(false);
    });
  });

  describe("isCashOut", () => {
    it("SHOULD return true if the sell transaction is an exchange with a fiat received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "USD",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre USD",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashOut = TransactionsService.isCashOut(transaction);
      expect(isCashOut).toBe(true);
    });

    it("SHOULD return false if the sell transaction is an exchange with a non-fiat received token", () => {
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BTC",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre ETH",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 40000,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashOut = TransactionsService.isCashOut(transaction);
      expect(isCashOut).toBe(false);
    });

    it("SHOULD return false if the transaction is a deposit", () => {
      const transaction: Transaction = {
        type: "Dépôt",
        date: "09/01/2024 10:40:00",
        timeZone: "CET",
        amountReceived: 2000,
        tokenReceived: "ETH",
        platform: "Coinbase",
        description: "Dépôt de ETH",
        label: "Dépôt",
        priceTokenReceived: 1800,
        address: "0xabcdef1234567890",
        trasactionHash: "0xeth1234567890abc",
        externalId: "ext20224",
      };
      const isCashOut = TransactionsService.isCashOut(transaction);
      expect(isCashOut).toBe(false);
    });

    it("SHOULD return false if the transaction is a withdrawal", () => {
      const transaction: Transaction = {
        type: "Retrait",
        date: "10/07/2024 15:30:55",
        timeZone: "EST",
        amountSent: 5,
        tokenSent: "BNB",
        fees: 0.01,
        tokenFees: "BNB",
        platform: "Binance",
        description: "Retrait de BNB",
        label: "Retrait",
        priceTokenSent: 300,
        priceTokenFees: 300,
        address: "bnb1fedcba0987654321",
        trasactionHash: "0x0987bnb1234abcd",
        externalId: "ext30334",
      };
      const isCashOut = TransactionsService.isCashOut(transaction);
      expect(isCashOut).toBe(false);
    });
  });

  describe("isCashOutFor", () => {
    it("SHOULD return true if it's a cash-out transaction of the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isCashOut")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "USD",
        amountSent: 100,
        tokenSent: "ETH",
        fees: 0.01,
        tokenFees: "ETH",
        platform: "Binance",
        description: "Échange de BTC contre USD",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashOutFor = TransactionsService.isCashOutFor(transaction, "ETH");
      spy.mockRestore();
      expect(isCashOutFor).toBe(true);
    });

    it("SHOULD return false if the token sold is not the token", () => {
      const spy = vi
        .spyOn(TransactionsService, "isCashOut")
        .mockReturnValue(true);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "USD",
        amountSent: 100,
        tokenSent: "BTC",
        fees: 0.01,
        tokenFees: "BTC",
        platform: "Binance",
        description: "Échange de BTC contre USD",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashOutFor = TransactionsService.isCashOutFor(transaction, "ETH");
      spy.mockRestore();
      expect(isCashOutFor).toBe(false);
    });

    it("SHOULD return false if it's not a cash-out transaction", () => {
      const spy = vi
        .spyOn(TransactionsService, "isCashOut")
        .mockReturnValue(false);
      const transaction: Transaction = {
        type: "Échange",
        date: "02/24/2024 12:29:09",
        timeZone: "UTC",
        amountReceived: 1000,
        tokenReceived: "BNB",
        amountSent: 100,
        tokenSent: "BTC",
        fees: 0.01,
        tokenFees: "BTC",
        platform: "Binance",
        description: "Échange de BTC contre BNB",
        label: "Trading",
        priceTokenSent: 2000,
        priceTokenReceived: 1,
        priceTokenFees: 1500,
        address: "0x123456789abcdef",
        trasactionHash: "0xabcdef1234567890",
        externalId: "ext12345",
      };
      const isCashOutFor = TransactionsService.isCashOutFor(transaction, "ETH");
      spy.mockRestore();
      expect(isCashOutFor).toBe(false);
    });
  });
});
