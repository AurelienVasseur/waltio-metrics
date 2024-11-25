import { config } from "../config";
import { Transaction } from "../types/transaction";

export default class TransactionsService {
  /**
   *
   * @param transactions Transactions
   * @returns An object containing received tokens, sent tokens and fees tokens
   */
  static getTokens(transactions: Transaction[]) {
    const tokensReceived = [
      ...new Set(
        transactions.filter((t) => t.tokenReceived).map((t) => t.tokenReceived!)
      ),
    ].sort((a, b) => a.localeCompare(b));
    const tokensSent = [
      ...new Set(
        transactions.filter((t) => t.tokenSent).map((t) => t.tokenSent!)
      ),
    ].sort((a, b) => a.localeCompare(b));
    const tokensFees = [
      ...new Set(
        transactions.filter((t) => t.tokenFees).map((t) => t.tokenFees!)
      ),
    ].sort((a, b) => a.localeCompare(b));
    return { tokensReceived, tokensSent, tokensFees };
  }

  /**
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if the token is used in the transaction
   */
  static isRelatedTo(transaction: Transaction, token: string) {
    return [
      transaction.tokenReceived,
      transaction.tokenSent,
      transaction.tokenFees,
    ].includes(token);
  }

  /**
   *
   * @param transactions Transactions
   * @param token Ticker of the token
   * @returns Transactions related to the token (buy, sell, fee)
   */
  static getTokenTransactions(transactions: Transaction[], token: string) {
    return transactions.filter((t) => this.isRelatedTo(t, token));
  }

  /**
   *
   * @param transaction Transaction
   * @returns True if there are fees
   */
  static hasFees(transaction: Transaction) {
    return transaction.fees &&
      transaction.tokenFees &&
      transaction.priceTokenFees
      ? true
      : false;
  }

  /**
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if the token is used as fees
   */
  static hasFeesFor(transaction: Transaction, token: string) {
    return this.hasFees(transaction) && transaction.tokenFees === token
      ? true
      : false;
  }

  /**
   *
   * @param transaction Transaction
   * @returns True if there is a received token
   */
  static isReceive(transaction: Transaction) {
    return transaction.tokenReceived &&
      transaction.amountReceived &&
      transaction.priceTokenReceived
      ? true
      : false;
  }

  /**
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if the received token is the token
   */
  static isReceiveFor(transaction: Transaction, token: string) {
    return this.isReceive(transaction) && transaction.tokenReceived === token
      ? true
      : false;
  }

  /**
   *
   * @param transaction Transaction
   * @returns True if there is a sent token
   */
  static isSend(transaction: Transaction) {
    return transaction.tokenSent &&
      transaction.amountSent &&
      transaction.priceTokenSent
      ? true
      : false;
  }

  /**
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if the sent token is the token
   */
  static isSendFor(transaction: Transaction, token: string) {
    return this.isSend(transaction) && transaction.tokenSent === token
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "buy transaction" if it's an exchange
   * or a deposit with the label "Achat de crypto"
   *
   * @param transaction Transaction
   * @returns True if it's a buy transaction
   */
  static isBuy(transaction: Transaction) {
    return ((transaction.type === "Échange" &&
      transaction.tokenSent &&
      transaction.priceTokenSent) ||
      (transaction.type === "Dépôt" &&
        transaction.label === "Achat de crypto")) &&
      transaction.tokenReceived &&
      transaction.priceTokenReceived
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "buy for a token transaction" if it's a
   * buy transaction and if the received token is the token
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if it's a buy transaction of the token
   */
  static isBuyFor(transaction: Transaction, token: string) {
    return this.isBuy(transaction) && transaction.tokenReceived === token
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "sell transaction" if it's an exchange
   *
   * @param transaction Transaction
   * @returns True if it's a sell transaction
   */
  static isSell(transaction: Transaction) {
    return transaction.type === "Échange" &&
      transaction.tokenSent &&
      transaction.priceTokenSent &&
      transaction.tokenReceived &&
      transaction.priceTokenReceived
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "sell for a token transaction" if it's a
   * sell transaction and if the sent token is the token
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if it's a sell transaction of the token
   */
  static isSellFor(transaction: Transaction, token: string) {
    return this.isSell(transaction) && transaction.tokenSent === token
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "stablecoin-in transaction" if it's a buy transaction
   * with a stablecoin sent token
   *
   * @param transaction Transaction
   * @returns True if it's a buy transaction with a stablecoin sent token
   */
  static isStablecoinIn(transaction: Transaction) {
    return this.isBuy(transaction) &&
      transaction.type === "Échange" &&
      config.stablecoinTokens.includes(transaction.tokenSent!)
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "stablecoin-in for a token transaction" if it's a
   * stablecoin-in transaction and if the received token is the token
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if it's a stablecoin-in transaction of the token
   */
  static isStablecoinInFor(transaction: Transaction, token: string) {
    return this.isStablecoinIn(transaction) &&
      transaction.tokenReceived === token
      ? true
      : false;
  }

  /**
   * A transaction is considerd as a "stablecoin-out transaction" if it's a sell transaction
   * with a stablecoin received token
   *
   * @param transaction Transaction
   * @returns True if it's a transaction with a stablecoin received token
   */
  static isStablecoinOut(transaction: Transaction) {
    return this.isSell(transaction) &&
      config.stablecoinTokens.includes(transaction.tokenReceived!)
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "stablecoin-out for a token transaction" if it's a
   * stablecoin-out transaction and if the sent token is the token
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if it's a stablecoin-out transaction of the token
   */
  static isStablecoinOutFor(transaction: Transaction, token: string) {
    return this.isStablecoinOut(transaction) && transaction.tokenSent === token
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "cash-in transaction" if it's a buy transaction
   * with a fiat sent token
   *
   * @param transaction Transaction
   * @returns True if it's a buy transaction with a fiat sent token
   */
  static isCashIn(transaction: Transaction) {
    return this.isBuy(transaction) &&
      (transaction.type === "Dépôt" ||
        (transaction.type === "Échange" &&
          config.fiatTokens.includes(transaction.tokenSent!)))
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "cash-in for a token transaction" if it's a
   * cash-in transaction and if the received token is the token
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if it's a cash-in transaction of the token
   */
  static isCashInFor(transaction: Transaction, token: string) {
    return this.isCashIn(transaction) && transaction.tokenReceived === token
      ? true
      : false;
  }

  /**
   * A transaction is considerd as a "cash-out transaction" if it's a sell transaction
   * with a fiat received token
   *
   * @param transaction Transaction
   * @returns True if it's a transaction with a fiat received token
   */
  static isCashOut(transaction: Transaction) {
    return this.isSell(transaction) &&
      config.fiatTokens.includes(transaction.tokenReceived!)
      ? true
      : false;
  }

  /**
   * A transaction is considered as a "cash-out for a token transaction" if it's a
   * cash-out transaction and if the send token is the token
   *
   * @param transaction Transaction
   * @param token Token
   * @returns True if it's a cash-out transaction of the token
   */
  static isCashOutFor(transaction: Transaction, token: string) {
    return this.isCashOut(transaction) && transaction.tokenSent === token
      ? true
      : false;
  }

  /**
   * Function to replace token names with their aliases.
   * @param transactions List of transactions
   * @returns A list of transactions with the token names replaced by aliases
   */
  static generateAliased(transactions: Transaction[]) {
    // Create a reverse mapping of NAME -> ALIAS for efficient lookup
    const reverseAliasMap: Record<string, string> = {};
    for (const [alias, names] of Object.entries(config.tokenAliases)) {
      names.forEach((name) => {
        reverseAliasMap[name] = alias; // Map each NAME to its ALIAS
      });
    }
    return transactions.map((transaction) => {
      // Create a copy of the transaction to avoid mutating the original
      const updatedTransaction = { ...transaction };
      // Replace tokens if they exist in the reverseAliasMap
      if (
        updatedTransaction.tokenReceived &&
        reverseAliasMap[updatedTransaction.tokenReceived]
      ) {
        updatedTransaction.tokenReceived =
          reverseAliasMap[updatedTransaction.tokenReceived];
      }
      if (
        updatedTransaction.tokenSent &&
        reverseAliasMap[updatedTransaction.tokenSent]
      ) {
        updatedTransaction.tokenSent =
          reverseAliasMap[updatedTransaction.tokenSent];
      }
      if (
        updatedTransaction.tokenFees &&
        reverseAliasMap[updatedTransaction.tokenFees]
      ) {
        updatedTransaction.tokenFees =
          reverseAliasMap[updatedTransaction.tokenFees];
      }

      return updatedTransaction;
    });
  }
}
