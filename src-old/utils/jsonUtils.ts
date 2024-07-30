var fs = require("fs");

/**
 * Save an object into a new JSON file into the output folder
 * @param obj JSON object to save
 * @param fileName
 * @returns
 */
export async function saveJson(
  obj: any,
  fileName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(obj);
    fs.writeFile(`./output/${fileName}.json`, json, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
