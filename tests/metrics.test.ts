import { describe, it, expect } from "vitest";
import parseTransactions from "../src/parseTransactions";
import WaltioService from "../src/services/waltioService";
import { calculateValuations } from "../src/valuation";
import expectedMetrics from "./expected_metrics.json";
import expectedValuations from "./expected_valuations.json";

describe("Waltio Metrics", () => {
  it("should compute metrics based on transactions exported from Waltio", async () => {
    const transactions = await WaltioService.getTransactions();
    const metrics = parseTransactions(transactions);
    const valuations = calculateValuations(metrics);
    expect(metrics).toEqual(expectedMetrics);
    expect(valuations).toEqual(expectedValuations);
  });
});
