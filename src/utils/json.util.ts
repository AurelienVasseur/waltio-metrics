import { Dirent, Stats } from "fs";
import * as p from "path";

var fs = require("fs");

/**
 * Generates a unique timestamp string in the format "YYYY-MM-DD_HH-mm-ss".
 * @returns {string} A unique timestamp string.
 */
export function generateUniqueTimestamp() {
  // Get the current date and time
  const currentDate = new Date();
  // Extract the year, month, day, hour, minute, and second
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hour = String(currentDate.getHours()).padStart(2, "0");
  const minute = String(currentDate.getMinutes()).padStart(2, "0");
  const second = String(currentDate.getSeconds()).padStart(2, "0");
  // Construct the unique timestamp string
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

/**
 * Clean directory (create or remove content)
 * @param path Path
 * @param removeContent Remove the content of the directories if true and if the directory exists
 */
async function prepareDirectory(path: string, removeContent: boolean) {
  try {
    //Check if directory exists
    const exists: boolean = (() => {
      try {
        const stats: Stats = fs.statSync(path);
        return stats.isDirectory();
      } catch (error) {
        return false;
      }
    })();

    if (exists) {
      if (!removeContent) return;
      // Directory exists, remove its contents
      const files: Dirent[] = fs.readdirSync(path, {
        withFileTypes: true,
      });
      for (const file of files) {
        const filePath = p.join(path, file.name);
        fs.rmSync(filePath, { recursive: true });
      }
    } else {
      // Directory does not exist, create it
      try {
        // to avoid conflict if a file has the expected name
        fs.rmSync(path, { recursive: true });
      } catch (error) {}
      fs.mkdirSync(path);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clean the output directory
 * @param timestamp Timestamp string
 */
export async function cleanOutput(timestamp: string) {
  try {
    const outputPath = p.join(__dirname, "../../output");
    const timestampPath = p.join(outputPath, timestamp);
    await prepareDirectory(outputPath, false);
    await prepareDirectory(timestampPath, true);
    // Raw
    const rawPath = p.join(timestampPath, "raw");
    const rawTransactionsPath = p.join(rawPath, "transactions");
    const rawMetricsPath = p.join(rawPath, "metrics");
    await prepareDirectory(rawPath, true);
    await prepareDirectory(rawTransactionsPath, true);
    await prepareDirectory(rawMetricsPath, true);
    // Aliased
    const aliasedPath = p.join(timestampPath, "aliased");
    const aliasedTransactionsPath = p.join(aliasedPath, "transactions");
    const aliasedMetricsPath = p.join(aliasedPath, "metrics");
    await prepareDirectory(aliasedPath, true);
    await prepareDirectory(aliasedTransactionsPath, true);
    await prepareDirectory(aliasedMetricsPath, true);
  } catch (error) {
    console.error("Error preparing the output directory:", error);
    throw error;
  }
}

/**
 * Save an object into a new JSON file in the output folder
 * @param timestamp Timestamp string
 * @param obj JSON object to save
 * @param fileName File name
 * @param type "raw" or "aliased"
 * @param sub Sub directory
 */
export async function save(
  timestamp: string,
  obj: any,
  fileName: string,
  type?: "raw" | "aliased",
  sub?: "transactions" | "metrics"
) {
  try {
    // Replace disallowed characters and spaces with an underscore
    const securedFileName = fileName
      .replaceAll(" ", "_")
      .replaceAll(/[\\\/:\*\?"<>\|]/g, "_");

    const subpath = `${type ? type + "/" : ""}${sub ? sub + "/" : ""}${securedFileName}`;
    const path = p.join(__dirname, `../../output/${timestamp}/${subpath}.json`);

    const json = JSON.stringify(obj, null, 2);
    fs.writeFileSync(path, json);
  } catch (error) {
    console.error("Error saving " + fileName);
  }
}
