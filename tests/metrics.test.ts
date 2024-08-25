import { describe, it, expect } from "vitest";
import parseTransactions from "../src/parseTransactions";
import WaltioService from "../src/services/waltioService";
import expectedMetrics from "./expected_metrics.json";

describe("Waltio Metrics", () => {
  it("should computes metrics based on transactions exported from Waltio", async () => {
    const transactions = await WaltioService.getTransactions();
    const metrics = parseTransactions(transactions);
    expect(metrics).toEqual(expectedMetrics);
  });
});
