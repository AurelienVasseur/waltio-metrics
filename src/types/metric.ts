import z from "zod";

export const MetricSection = z.object({
  counter: z.number().default(0),
  volume: z.number().default(0),
  quantity: z.number().default(0),
  weightedAveragePrice: z.number().default(0),
  averagePrice: z.number().default(0),
});

export type MetricSection = z.infer<typeof MetricSection>;

export const MetricZod = z.object({
  counter: z.number().default(0),
  fees: z.number().default(0),
  quantity: z.number().default(0),
  pnlRealized: z.number().default(0),
  pnlRealizedStablecoin: z.number().default(0),
  pnlRealizedCash: z.number().default(0),
  breakevenPrice: z.number().default(0),
  receive: MetricSection.default({}),
  send: MetricSection.default({}),
  buy: MetricSection.default({}),
  sell: MetricSection.default({}),
  stablecoinIn: MetricSection.default({}),
  stablecoinOut: MetricSection.default({}),
  cashIn: MetricSection.default({}),
  cashOut: MetricSection.default({}),
});

export type Metric = z.infer<typeof MetricZod>;
