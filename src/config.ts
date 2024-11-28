import configJson from "../config.json";
import configTestJson from "../config.test.json";

interface Config {
  /**
   * Path of the file that contains transactions (export from Waltio).
   */
  filePath: string;
  /**
   * The fiat currency used as the reference in the Waltio file for calculations (e.g. "EUR").
   */
  fiatReference: string;
  /**
   * A list of fiat currencies to process for calculations.
   */
  fiatsForProcessing: {
    // The fiat token to process (e.g., "USD", "EUR").
    token: string;
    // Path to the file containing the price history for the specified fiat token.
    priceHistoryFilePath: string;
  }[];
  /**
   * Fiat tickers (e.g., EUR, USD, etc.).
   */
  fiatTokens: string[];
  /**
   * Stablecoin tickers (e.g., USDT, USDC, etc.).
   */
  stablecoinTokens: string[];
  /**
   * Define token aliases, allowing for mapping of tokens to their alternate names.
   */
  tokenAliases: Record<string, string[]>;
}

const is_test = process.env.NODE_ENV === "test";

export const config: Config = is_test ? configTestJson : configJson;
