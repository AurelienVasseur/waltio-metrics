import configJson from "../config.json";

interface Config {
  // Fiat tickers (EUR, USD, etc.)
  fiatTokens: string[];
  /**
   * A record of expected quantities for specific tokens.
   * The key is the token symbol and the value is the expected quantity.
   */
  expectedQuantities: Record<string, number>;
  // Define the groups and their composition
  groups: Record<string, string[]>;
}

export const config: Config = configJson;
