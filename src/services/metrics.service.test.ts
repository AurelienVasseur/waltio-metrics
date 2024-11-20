import { describe, it, expect } from "vitest";

import MetricsService from "./metrics.service";
import { transactions } from "../../tests/data/transactionsMetricsService";

describe("Metrics Service", () => {
  describe("computeVolumes", () => {
    it("SHOULD return volumes related to the provided transactions", () => {
      const volumes = MetricsService.computeVolumes(transactions);
      expect(volumes).toEqual({
        counter: 13,
        fees: 59.297,
        pnlRealized: 0,
        pnlRealizedStablecoin: 56,
        pnlRealizedCash: 8726.3,
        receive: { counter: 12, volume: 96316.7 },
        send: { counter: 10, volume: 59216.7 },
        buy: { counter: 9, volume: 56216.7 },
        sell: { counter: 9, volume: 56216.7 },
        stablecoinIn: { counter: 1, volume: 50 },
        stablecoinOut: { counter: 1, volume: 106 },
        cashIn: { counter: 6, volume: 21273.7 },
        cashOut: { counter: 1, volume: 30000 },
      });
    });
  });

  describe("computeTokenMetrics", () => {
    it("SHOULD return metrics related to the provided token - BTC test", () => {
      const metrics = MetricsService.computeTokenMetrics(transactions, "BTC");
      expect(metrics).toEqual({
        counter: 2,
        fees: 30,
        quantity: 0.009960000000000004,
        pnlRealized: 24700,
        pnlRealizedStablecoin: 0,
        pnlRealizedCash: 24700,
        breakevenPrice: 0,
        receive: {
          counter: 1,
          volume: 5300,
          quantity: 0.05,
          weightedAveragePrice: 106000,
          averagePrice: 106000,
        },
        send: {
          counter: 1,
          volume: 30000,
          quantity: 0.04,
          weightedAveragePrice: 750000,
          averagePrice: 750000,
        },
        buy: {
          counter: 1,
          volume: 5300,
          quantity: 0.05,
          weightedAveragePrice: 106000,
          averagePrice: 106000,
        },
        sell: {
          counter: 1,
          volume: 30000,
          quantity: 0.04,
          weightedAveragePrice: 750000,
          averagePrice: 750000,
        },
        stablecoinIn: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        cashIn: {
          counter: 1,
          volume: 5300,
          quantity: 0.05,
          weightedAveragePrice: 106000,
          averagePrice: 106000,
        },
        cashOut: {
          counter: 1,
          volume: 30000,
          quantity: 0.04,
          weightedAveragePrice: 750000,
          averagePrice: 750000,
        },
      });
    });

    it("SHOULD return metrics related to the provided token - ETH test", () => {
      const metrics = MetricsService.computeTokenMetrics(transactions, "ETH");
      expect(metrics).toEqual({
        counter: 5,
        fees: 23.572,
        quantity: 2.395,
        pnlRealized: -10423.5,
        pnlRealizedStablecoin: 0,
        pnlRealizedCash: -15316.5,
        breakevenPrice: 4352.19206681,
        receive: {
          counter: 3,
          volume: 18316.5,
          quantity: 4.15,
          weightedAveragePrice: 4413.61445783,
          averagePrice: 4190,
        },
        send: {
          counter: 2,
          volume: 7893,
          quantity: 1.75,
          weightedAveragePrice: 4510.28571429,
          averagePrice: 4446.5,
        },
        buy: {
          counter: 2,
          volume: 15316.5,
          quantity: 3.4,
          weightedAveragePrice: 4504.85294118,
          averagePrice: 4285,
        },
        sell: {
          counter: 1,
          volume: 4893,
          quantity: 1,
          weightedAveragePrice: 4893,
          averagePrice: 4893,
        },
        stablecoinIn: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        cashIn: {
          counter: 2,
          volume: 15316.5,
          quantity: 3.4,
          weightedAveragePrice: 4504.85294118,
          averagePrice: 4285,
        },
        cashOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
      });
    });

    it("SHOULD return metrics related to the provided token - EGLD test", () => {
      const metrics = MetricsService.computeTokenMetrics(transactions, "EGLD");
      expect(metrics).toEqual({
        counter: 3,
        fees: 0,
        quantity: 155,
        pnlRealized: -5049,
        pnlRealizedStablecoin: -50,
        pnlRealizedCash: -106,
        breakevenPrice: 32.57419355,
        receive: {
          counter: 3,
          volume: 5049,
          quantity: 155,
          weightedAveragePrice: 32.57419355,
          averagePrice: 36.37333333,
        },
        send: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        buy: {
          counter: 3,
          volume: 5049,
          quantity: 155,
          weightedAveragePrice: 32.57419355,
          averagePrice: 36.37333333,
        },
        sell: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinIn: {
          counter: 1,
          volume: 50,
          quantity: 1,
          weightedAveragePrice: 50,
          averagePrice: 50,
        },
        stablecoinOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        cashIn: {
          counter: 1,
          volume: 106,
          quantity: 4,
          weightedAveragePrice: 26.5,
          averagePrice: 26.5,
        },
        cashOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
      });
    });

    it("SHOULD return metrics related to the provided token - SOL test", () => {
      const metrics = MetricsService.computeTokenMetrics(transactions, "SOL");
      expect(metrics).toEqual({
        counter: 1,
        fees: 0,
        quantity: 2,
        pnlRealized: -445.2,
        pnlRealizedStablecoin: 0,
        pnlRealizedCash: -445.2,
        breakevenPrice: 222.6,
        receive: {
          counter: 1,
          volume: 445.2,
          quantity: 2,
          weightedAveragePrice: 222.6,
          averagePrice: 222.6,
        },
        send: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        buy: {
          counter: 1,
          volume: 445.2,
          quantity: 2,
          weightedAveragePrice: 222.6,
          averagePrice: 222.6,
        },
        sell: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinIn: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        cashIn: {
          counter: 1,
          volume: 445.2,
          quantity: 2,
          weightedAveragePrice: 222.6,
          averagePrice: 222.6,
        },
        cashOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
      });
    });

    it("SHOULD return metrics related to the provided token - USDT test", () => {
      const metrics = MetricsService.computeTokenMetrics(transactions, "USDT");
      expect(metrics).toEqual({
        counter: 2,
        fees: 0,
        quantity: 56,
        pnlRealized: -56,
        pnlRealizedStablecoin: 0,
        pnlRealizedCash: -106,
        breakevenPrice: 1,
        receive: {
          counter: 1,
          volume: 106,
          quantity: 106,
          weightedAveragePrice: 1,
          averagePrice: 1,
        },
        send: {
          counter: 1,
          volume: 50,
          quantity: 50,
          weightedAveragePrice: 1,
          averagePrice: 1,
        },
        buy: {
          counter: 1,
          volume: 106,
          quantity: 106,
          weightedAveragePrice: 1,
          averagePrice: 1,
        },
        sell: {
          counter: 1,
          volume: 50,
          quantity: 50,
          weightedAveragePrice: 1,
          averagePrice: 1,
        },
        stablecoinIn: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        cashIn: {
          counter: 1,
          volume: 106,
          quantity: 106,
          weightedAveragePrice: 1,
          averagePrice: 1,
        },
        cashOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
      });
    });

    it("SHOULD return metrics related to the provided token - EUR test", () => {
      const metrics = MetricsService.computeTokenMetrics(transactions, "EUR");
      expect(metrics).toEqual({
        counter: 9,
        fees: 5.725,
        quantity: 45124.649999999994,
        pnlRealized: -8726.3,
        pnlRealizedStablecoin: 106,
        pnlRealizedCash: 0,
        breakevenPrice: 0.19338211,
        receive: {
          counter: 3,
          volume: 67100,
          quantity: 65000,
          weightedAveragePrice: 1.03230769,
          averagePrice: 1.04,
        },
        send: {
          counter: 6,
          volume: 21273.7,
          quantity: 19870,
          weightedAveragePrice: 1.07064419,
          averagePrice: 1.06333333,
        },
        buy: {
          counter: 1,
          volume: 30000,
          quantity: 30000,
          weightedAveragePrice: 1,
          averagePrice: 1,
        },
        sell: {
          counter: 6,
          volume: 21273.7,
          quantity: 19870,
          weightedAveragePrice: 1.07064419,
          averagePrice: 1.06333333,
        },
        stablecoinIn: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        stablecoinOut: {
          counter: 1,
          volume: 106,
          quantity: 100,
          weightedAveragePrice: 1.06,
          averagePrice: 1.06,
        },
        cashIn: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
        cashOut: {
          counter: 0,
          volume: 0,
          quantity: 0,
          weightedAveragePrice: 0,
          averagePrice: 0,
        },
      });
    });
  });
});
