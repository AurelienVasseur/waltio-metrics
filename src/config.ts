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
   * Stablecoin tickers (USDT, USDC, etc.).
   */
  stablecoinTokens: string[];
  /**
   * Define token aliases.
   */
  tokenAliases: Record<string, string[]>;
}

const is_test = process.env.NODE_ENV === "test";

export const config: Config = is_test ? configTestJson : configJson;
