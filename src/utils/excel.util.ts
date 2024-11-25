import Excel from "exceljs";

/**
 * Extract rows from an excel file
 * @param filePath
 * @returns Rows
 */
export async function getRowsFromExcelFile(
  filePath: string
): Promise<Excel.Row[]> {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    return [];
  }
  const startIdx = 2;
  const endIdx = worksheet.rowCount - 1;
  const rows = worksheet.getRows(startIdx, endIdx) ?? [];
  return rows;
}

/**
 * Get value of a cell in a row
 * @param row
 * @param cellIndex
 * @returns Value in string
 */
export function getCellValue(row: Excel.Row, cellIndex: number): string {
  const cell = row.getCell(cellIndex);
  return cell.value ? cell.value.toString() : "";
}
