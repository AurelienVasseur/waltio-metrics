import configJson from "../config.json";
import configTestJson from "../config.test.json";

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

const is_test = process.env.NODE_ENV === "test";

export const config: Config = is_test ? configTestJson : configJson;
