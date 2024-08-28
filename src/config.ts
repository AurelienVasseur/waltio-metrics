import configJson from "../config.json";
import configTestJson from "../config.test.json";

interface Config {
  /**
   * Path of the file that contains transactions (export from Waltio).
   */
  filePath: string;
  /**
   * Fiat tickers (EUR, USD, etc.).
   */
  fiatTokens: string[];
  /**
   * Define token aliases.
   */
  tokenAliases: Record<string, string[]>;
  /**
   * A record of expected quantities for specific tokens.
   * The key is the token symbol and the value is the expected quantity.
   */
  expectedQuantities: Record<string, number>;
  /**
   * Define the groups and their composition.
   */
  groups: Record<string, string[]>;
  /**
   * Represents a single pricing scenario with a description
   * and expected prices for tokens.
   */
  scenarios: Record<
    string,
    {
      description: string;
      prices: Record<string, number>;
    }
  >;
}

const is_test = process.env.NODE_ENV === "test";

export const config: Config = is_test ? configTestJson : configJson;
