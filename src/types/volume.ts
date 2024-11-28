import z from "zod";

export const VolumeSection = z.object({
  counter: z.number().default(0),
  volume: z.number().default(0),
});

export type VolumeSection = z.infer<typeof VolumeSection>;

export const VolumeZod = z.object({
  counter: z.number().default(0),
  fees: z.number().default(0),
  pnlRealized: z.number().default(0),
  pnlRealizedStablecoin: z.number().default(0),
  pnlRealizedCash: z.number().default(0),
  receive: VolumeSection.default({}),
  send: VolumeSection.default({}),
  buy: VolumeSection.default({}),
  sell: VolumeSection.default({}),
  stablecoinIn: VolumeSection.default({}),
  stablecoinOut: VolumeSection.default({}),
  cashIn: VolumeSection.default({}),
  cashOut: VolumeSection.default({}),
});

export type Volume = z.infer<typeof VolumeZod>;
