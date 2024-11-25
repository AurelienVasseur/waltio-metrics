/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 *
 * @param {string} str - The input string to capitalize.
 * @returns {string} - The capitalized string, or an empty string if the input is invalid.
 *
 * @example
 * // Capitalize a single word
 * capitalize("hELLo"); // "Hello"
 *
 * @example
 * // Handles empty input
 * capitalize(""); // ""
 *
 * @example
 * // Handles non-string input
 * capitalize(null); // ""
 */
export default function capitalize(str: string) {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
