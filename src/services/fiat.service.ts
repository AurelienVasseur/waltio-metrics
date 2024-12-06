import { config } from "../config";
import { PriceHistory, PriceHistoryZod } from "../types/priceHistory";
import { Transaction } from "../types/transaction";
import { parseCSV } from "../utils/csv.util";

export default class FiatService {
  /**
   * Retrieves the price history for a specific fiat currency.
   *
   * This function finds the configuration for the specified fiat currency
   * and parses the corresponding CSV file to extract the price history.
   *
   * @param fiat - The fiat currency token for which to retrieve the price history (e.g., "USD", "EUR").
   * @returns A promise resolving to an array of PriceHistory objects.
   */
  static async getPriceHistory(fiat: string): Promise<PriceHistory[]> {
    const fiatConfig = config.fiatsForProcessing.find((e) => e.token === fiat);
    if (!fiatConfig) return [];
    const csv: any[] = await parseCSV(fiatConfig.priceHistoryFilePath);
    let result: PriceHistory[] = [];
    csv.forEach((row) => {
      // Clean the keys to avoid accidental spaces
      const cleanRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.trim(), value])
      );
      const date = new Date(String(cleanRow["Date"]));
      const price = parseFloat(row["Price"]);
      const history: PriceHistory = { date, price };
      if (PriceHistoryZod.safeParse(history).success) result.push(history);
    });
    return result;
  }

  /**
   * Retrieves the price for a given date from the price history.
   *
   * If the price for the specified date is not found, it searches for the nearest
   * price within a ±7 days interval. If no price is found in that interval,
   * an error is thrown.
   *
   * @param priceHistory - The array of PriceHistory objects to search in.
   * @param date - The date for which to retrieve the price.
   * @returns The price as a number for the specified or nearest date.
   *
   * @throws An error if no price is found within the ±7 days interval.
   */
  static getPriceForDate(priceHistory: PriceHistory[], date: Date): number {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const targetTimestamp = date.getTime();

    // Sort the price history by date to ensure correct order
    priceHistory.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Search for an exact match
    const exactMatch = priceHistory.find(
      (entry) => entry.date.getTime() === targetTimestamp
    );
    if (exactMatch) {
      return exactMatch.price;
    }

    // Search for the nearest date within ±7 days
    let closest: PriceHistory | null = null;
    let closestDifference = SEVEN_DAYS_MS + 1; // Initialize with a value greater than 7 days

    for (const entry of priceHistory) {
      const difference = Math.abs(entry.date.getTime() - targetTimestamp);
      if (difference <= SEVEN_DAYS_MS && difference < closestDifference) {
        closest = entry;
        closestDifference = difference;
      }
    }

    if (closest) {
      return closest.price;
    }

    // Throw an error if no price is found within ±7 days
    throw new Error(
      `No price found for the date ${date.toISOString()} within a ±7 days interval.`
    );
  }

  /**
   * Converts the prices of transactions based on historical price data.
   *
   * This method iterates through a list of transactions, finds the price
   * for the transaction date from the provided price history, and adjusts
   * the price-related fields (`priceTokenFees`, `priceTokenReceived`, `priceTokenSent`)
   * by multiplying them with the corresponding price.
   *
   * @param transactions - The list of transactions to be converted. Each transaction includes a `date` and price-related fields.
   * @param priceHistory - The historical price data used for conversion. This should include a list of dates and their corresponding prices.
   * @returns An array of transactions with updated price fields, where applicable.
   *
   * @throws An error if a price for a transaction's date is not found within the price history.
   */
  static convertPrices(
    transactions: Transaction[],
    priceHistory: PriceHistory[]
  ): Transaction[] {
    return transactions.map((t) => {
      let convertedT = { ...t };
      const date = new Date(t.date);
      const price = this.getPriceForDate(priceHistory, date);
      convertedT.priceTokenFees = t.priceTokenFees
        ? t.priceTokenFees * price
        : undefined;
      convertedT.priceTokenReceived = t.priceTokenReceived
        ? t.priceTokenReceived * price
        : undefined;
      convertedT.priceTokenSent = t.priceTokenSent
        ? t.priceTokenSent * price
        : undefined;
      return convertedT;
    });
  }
}
