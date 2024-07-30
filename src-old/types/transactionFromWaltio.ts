import z from "zod";

const REGEX_DATE = new RegExp(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/, "g"); // 02/24/2024 12:29:09

export const TransactionFromWaltioZod = z.object({
  type: z.enum(["Échange", "Dépôt", "Retrait"]),
  date: z.string().regex(REGEX_DATE),
  timeZone: z.string(),
  amountReceived: z.number().optional(),
  tokenReceived: z.string().optional(),
  amountSent: z.number().optional(),
  tokenSent: z.string().optional(),
  fees: z.number().optional(),
  tokenFees: z.string().optional(),
  platform: z.string(),
  description: z.string(),
  label: z.string(),
  priceTokenSent: z.number().optional(),
  priceTokenReceived: z.number().optional(),
  priceTokenFees: z.number().optional(),
  address: z.string(),
  trasactionHash: z.string(),
  externalId: z.string(),
});

export type TransactionFromWaltio = z.infer<typeof TransactionFromWaltioZod>;
