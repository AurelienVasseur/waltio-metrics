import * as fs from "fs";
import * as p from "path";
import { parse } from "csv-parse";

type CSVRecord = Record<string, string>; // Each line will be a key-value object

/**
 * Parse a CSV file and return its content as an array of objects.
 *
 * @param filePath - Path to the CSV file.
 * @returns A promise resolving to an array of objects representing the CSV content.
 */
export const parseCSV = async (filePath: string): Promise<CSVRecord[]> => {
  return new Promise((resolve, reject) => {
    const results: CSVRecord[] = [];

    const path = p.join(__dirname, `../../${filePath}`);

    fs.createReadStream(path)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
