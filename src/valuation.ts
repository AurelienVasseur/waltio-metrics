import { config } from "./config";
import { Result } from "./parseTransactions";

/**
 * Represents the valuation of a token under a specific scenario,
 * including computed and expected values.
 */
export type TokenValuation = {
  computed: number;
  expected: number | undefined;
};

/**
 * Represents the valuation of all tokens under a specific scenario,
 * including the total computed and expected valuations.
 */
export type ScenarioValuation = {
  scenarioName: string;
  scenarioDescription: string;
  tokenValuations: Record<string, TokenValuation>;
  totalComputed: number;
  totalExpected: number | undefined;
};

/**
 * Represents the overall valuation result for all scenarios.
 */
export type ValuationsResult = ScenarioValuation[];

/**
 * Calculates the valuations for each token based on multiple scenarios.
 * The function computes valuations for both `computed` and `expected` quantities,
 * and it also calculates the total valuations for each scenario.
 *
 * @param result - The result object containing the parsed transaction data.
 * @returns An array of objects containing the calculated valuations for each scenario.
 */
export function calculateValuations(result: Result): ValuationsResult {
  const valuations: ValuationsResult = [];

  // Iterate over each scenario in the configuration
  Object.keys(config.scenarios).forEach((scenarioName) => {
    const scenario = config.scenarios[scenarioName]!;
    const scenarioValuations: ScenarioValuation = {
      scenarioName: scenarioName,
      scenarioDescription: scenario.description,
      tokenValuations: {},
      totalComputed: 0,
      totalExpected: 0,
    };

    // Calculate the valuation for each token in the current scenario
    Object.keys(result.tokens).forEach((token) => {
      const tokenData = result.tokens[token]!;
      const tokenPrice = scenario.prices[token];

      // Only consider tokens that are included in the current scenario's price list
      if (tokenPrice !== undefined) {
        // Calculate the value based on the `computed` quantity
        const computedValue = tokenData.quantity.computed * tokenPrice;
        scenarioValuations.totalComputed += computedValue;

        // Calculate the value based on the `expected` quantity (if defined)
        const expectedValue = tokenData.quantity.expected
          ? tokenData.quantity.expected * tokenPrice
          : undefined;

        // Update the total expected valuation for the scenario
        if (expectedValue !== undefined) {
          scenarioValuations.totalExpected =
            (scenarioValuations.totalExpected || 0) + expectedValue;
        } else {
          scenarioValuations.totalExpected = undefined;
        }

        // Store the token's valuation in the scenario object
        scenarioValuations.tokenValuations[token] = {
          computed: computedValue,
          expected: expectedValue,
        };
      }
    });

    // Add the scenario's valuations to the final result array
    valuations.push(scenarioValuations);
  });

  return valuations;
}
