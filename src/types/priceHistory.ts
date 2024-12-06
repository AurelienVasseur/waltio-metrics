import z from "zod";

export const PriceHistoryZod = z.object({
  date: z.date(),
  price: z.number(),
});

export type PriceHistory = z.infer<typeof PriceHistoryZod>;
