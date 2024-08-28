import { describe, it, expect } from "vitest";
import { Result } from "./parseTransactions";
import { ScenariosConfig, calculateValuations } from "./valuation";

// Mock data for testing
const mockResult: Result = {
  overview: {
    cashIn: 10000,
    cashOut: 5000,
    fees: 100,
  },
  groups: {},
  tokens: {
    MATIC: {
      aliases: ["MATIC"],
      quantity: {
        computed: 200,
        expected: 160,
        delta: 40,
        deltaPercent: 20,
      },
      cashIn: 400,
      cashOut: 200,
      totalBuy: 400,
      totalSell: 200,
      pnlRealized: 0,
      unitPrice: 0,
      historic: [],
    },
    ETH: {
      aliases: ["ETH"],
      quantity: {
        computed: 2,
        expected: 1.8,
        delta: 0.2,
        deltaPercent: 10,
      },
      cashIn: 7000,
      cashOut: 3500,
      totalBuy: 7000,
      totalSell: 3500,
      pnlRealized: 0,
      unitPrice: 0,
      historic: [],
    },
    BTC: {
      aliases: ["BTC"],
      quantity: {
        computed: 0.5,
        expected: 0.4,
        delta: 0.1,
        deltaPercent: 25,
      },
      cashIn: 30000,
      cashOut: 15000,
      totalBuy: 30000,
      totalSell: 15000,
      pnlRealized: 0,
      unitPrice: 0,
      historic: [],
    },
  },
};

describe("calculateValuations", () => {
  it("should calculate correct valuations for the optimistic scenario", () => {
    const valuations = calculateValuations(mockResult);
    const optimisticValuation = valuations.find(
      (v) => v.scenarioName === "Optimistic"
    );

    expect(optimisticValuation).toBeDefined();
    expect(optimisticValuation!.totalComputed).toEqual(37500);
    expect(optimisticValuation!.totalExpected).toEqual(30700);

    expect(optimisticValuation!.tokenValuations["MATIC"]!.computed).toEqual(
      500
    );
    expect(optimisticValuation!.tokenValuations["MATIC"]!.expected).toEqual(
      400
    );

    expect(optimisticValuation!.tokenValuations["ETH"]!.computed).toEqual(7000);
    expect(optimisticValuation!.tokenValuations["ETH"]!.expected).toEqual(6300);

    expect(optimisticValuation!.tokenValuations["BTC"]!.computed).toEqual(
      30000
    );
    expect(optimisticValuation!.tokenValuations["BTC"]!.expected).toEqual(
      24000
    );
  });

  it("should calculate correct valuations for the pessimistic scenario", () => {
    const valuations = calculateValuations(mockResult);
    const pessimisticValuation = valuations.find(
      (v) => v.scenarioName === "Pessimistic"
    );

    expect(pessimisticValuation).toBeDefined();
    expect(pessimisticValuation!.totalComputed).toEqual(18160);
    expect(pessimisticValuation!.totalExpected).toEqual(14828);

    expect(pessimisticValuation!.tokenValuations["MATIC"]!.computed).toEqual(
      160
    );
    expect(pessimisticValuation!.tokenValuations["MATIC"]!.expected).toEqual(
      128
    );

    expect(pessimisticValuation!.tokenValuations["ETH"]!.computed).toEqual(
      3000
    );
    expect(pessimisticValuation!.tokenValuations["ETH"]!.expected).toEqual(
      2700
    );

    expect(pessimisticValuation!.tokenValuations["BTC"]!.computed).toEqual(
      15000
    );
    expect(pessimisticValuation!.tokenValuations["BTC"]!.expected).toEqual(
      12000
    );
  });

  it("should ignore tokens not listed in the scenario prices", () => {
    const valuations = calculateValuations(mockResult);
    const partialValuation = valuations.find(
      (v) => v.scenarioName === "PartialScenario"
    );

    expect(partialValuation).toBeDefined();
    expect(partialValuation!.totalComputed).toEqual(400);
    expect(partialValuation!.totalExpected).toEqual(320);

    expect(partialValuation!.tokenValuations["MATIC"]!.computed).toEqual(400);
    expect(partialValuation!.tokenValuations["MATIC"]!.expected).toEqual(320);

    expect(partialValuation!.tokenValuations["ETH"]).toBeUndefined();
    expect(partialValuation!.tokenValuations["BTC"]).toBeUndefined();
  });
});
