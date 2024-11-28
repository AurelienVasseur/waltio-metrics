import { Metric, MetricSection, MetricZod } from "../types/metric";
import { Transaction } from "../types/transaction";
import { Volume, VolumeSection, VolumeZod } from "../types/volume";
import TransactionsService from "./transactions.service";

export default class MetricsService {
  /**
   *
   * @param transactions Transactions
   * @returns Volumes metrics related to provided transactions
   */
  static computeVolumes(transactions: Transaction[]): Volume {
    let v: Volume = VolumeZod.parse({});

    v.counter = transactions.length;

    transactions.forEach((t) => {
      const hasFees = TransactionsService.hasFees(t);
      const isReceive = TransactionsService.isReceive(t);
      const isSend = TransactionsService.isSend(t);
      const isBuy = TransactionsService.isBuy(t);
      const isSell = TransactionsService.isSell(t);
      const isStablecoinIn = TransactionsService.isStablecoinIn(t);
      const isStablecoinOut = TransactionsService.isStablecoinOut(t);
      const isCashIn = TransactionsService.isCashIn(t);
      const isCashOut = TransactionsService.isCashOut(t);

      const volumeReceive = isReceive
        ? t.amountReceived! * t.priceTokenReceived!
        : 0;
      const volumeSend = isSend ? t.amountSent! * t.priceTokenSent! : 0;

      if (hasFees) v.fees += t.fees! * t.priceTokenFees!;
      if (isReceive) {
        v.receive.counter++;
        v.receive.volume += volumeReceive;
      }
      if (isSend) {
        v.send.counter++;
        v.send.volume += volumeSend;
      }
      if (isBuy) {
        v.buy.counter++;
        v.buy.volume += volumeReceive;
      }
      if (isSell) {
        v.sell.counter++;
        v.sell.volume += volumeSend;
      }
      if (isStablecoinIn) {
        v.stablecoinIn.counter++;
        v.stablecoinIn.volume += volumeReceive;
      }
      if (isStablecoinOut) {
        v.stablecoinOut.counter++;
        v.stablecoinOut.volume += volumeSend;
      }
      if (isCashIn) {
        v.cashIn.counter++;
        v.cashIn.volume += volumeReceive;
      }
      if (isCashOut) {
        v.cashOut.counter++;
        v.cashOut.volume += volumeSend;
      }
    });

    v.pnlRealized = v.sell.volume - v.buy.volume;
    v.pnlRealizedStablecoin = v.stablecoinOut.volume - v.stablecoinIn.volume;
    v.pnlRealizedCash = v.cashOut.volume - v.cashIn.volume;

    let format = (vo: Volume): Volume => {
      let formatSection = (o: VolumeSection): VolumeSection => {
        return {
          counter: Number(o.counter.toFixed(3)) || 0,
          volume: Number(o.volume.toFixed(3)) || 0,
        };
      };
      vo.pnlRealized = Number(vo.pnlRealized.toFixed(3)) || 0;
      vo.pnlRealizedStablecoin =
        Number(vo.pnlRealizedStablecoin.toFixed(3)) || 0;
      vo.pnlRealizedCash = Number(vo.pnlRealizedCash.toFixed(3)) || 0;
      vo.fees = Number(vo.fees.toFixed(3)) || 0;
      vo.receive = formatSection(vo.receive);
      vo.send = formatSection(vo.send);
      vo.buy = formatSection(vo.buy);
      vo.sell = formatSection(vo.sell);
      vo.stablecoinIn = formatSection(vo.stablecoinIn);
      vo.stablecoinOut = formatSection(vo.stablecoinOut);
      vo.cashIn = formatSection(vo.cashIn);
      vo.cashOut = formatSection(vo.cashOut);
      return vo;
    };

    return format(v);
  }

  /**
   *
   * @param transactions Transactions
   * @param token Ticker
   * @returns Metrics related to a specific token based on the provided transactions
   */
  static computeTokenMetrics(
    transactions: Transaction[],
    token: string
  ): Metric {
    let m: Metric = MetricZod.parse({});

    transactions.forEach((t) => {
      const isRelatedTo = TransactionsService.isRelatedTo(t, token);
      const hasFeesFor = TransactionsService.hasFeesFor(t, token);
      const isReceiveFor = TransactionsService.isReceiveFor(t, token);
      const isSendFor = TransactionsService.isSendFor(t, token);
      const isBuyFor = TransactionsService.isBuyFor(t, token);
      const isSellFor = TransactionsService.isSellFor(t, token);
      const isStablecoinInFor = TransactionsService.isStablecoinInFor(t, token);
      const isStablecoinOutFor = TransactionsService.isStablecoinOutFor(
        t,
        token
      );
      const isCashInFor = TransactionsService.isCashInFor(t, token);
      const isCashOutFor = TransactionsService.isCashOutFor(t, token);

      const volumeReceiveFor = isReceiveFor
        ? t.amountReceived! * t.priceTokenReceived!
        : 0;
      const volumeSendFor = isSendFor ? t.amountSent! * t.priceTokenSent! : 0;

      if (isRelatedTo) m.counter++;
      if (hasFeesFor) {
        m.fees += t.fees! * t.priceTokenFees!;
        m.quantity -= t.fees!;
      }
      if (isReceiveFor) {
        m.quantity += t.amountReceived!;
        m.receive.counter++;
        m.receive.volume += volumeReceiveFor;
        m.receive.quantity += t.amountReceived!;
        m.receive.weightedAveragePrice += volumeReceiveFor;
        m.receive.averagePrice += t.priceTokenReceived!;
      }
      if (isSendFor) {
        m.quantity -= t.amountSent!;
        m.send.counter++;
        m.send.volume += volumeSendFor;
        m.send.quantity += t.amountSent!;
        m.send.weightedAveragePrice += volumeSendFor;
        m.send.averagePrice += t.priceTokenSent!;
      }
      if (isBuyFor) {
        m.buy.counter++;
        m.buy.volume += volumeReceiveFor;
        m.buy.quantity += t.amountReceived!;
        m.buy.weightedAveragePrice += volumeReceiveFor;
        m.buy.averagePrice += t.priceTokenReceived!;
      }
      if (isSellFor) {
        m.sell.counter++;
        m.sell.volume += volumeSendFor;
        m.sell.quantity += t.amountSent!;
        m.sell.weightedAveragePrice += volumeSendFor;
        m.sell.averagePrice += t.priceTokenSent!;
      }
      if (isStablecoinInFor) {
        m.stablecoinIn.counter++;
        m.stablecoinIn.volume += volumeReceiveFor;
        m.stablecoinIn.quantity += t.amountReceived!;
        m.stablecoinIn.weightedAveragePrice += volumeReceiveFor;
        m.stablecoinIn.averagePrice += t.priceTokenReceived!;
      }
      if (isStablecoinOutFor) {
        m.stablecoinOut.counter++;
        m.stablecoinOut.volume += volumeSendFor;
        m.stablecoinOut.quantity += t.amountSent!;
        m.stablecoinOut.weightedAveragePrice += volumeSendFor;
        m.stablecoinOut.averagePrice += t.priceTokenSent!;
      }
      if (isCashInFor) {
        m.cashIn.counter++;
        m.cashIn.volume += volumeReceiveFor;
        m.cashIn.quantity += t.amountReceived!;
        m.cashIn.weightedAveragePrice += volumeReceiveFor;
        m.cashIn.averagePrice += t.priceTokenReceived!;
      }
      if (isCashOutFor) {
        m.cashOut.counter++;
        m.cashOut.volume += volumeSendFor;
        m.cashOut.quantity += t.amountSent!;
        m.cashOut.weightedAveragePrice += volumeSendFor;
        m.cashOut.averagePrice += t.priceTokenSent!;
      }
    });

    m.pnlRealized = m.sell.volume - m.buy.volume;
    m.pnlRealizedStablecoin = m.stablecoinOut.volume - m.stablecoinIn.volume;
    m.pnlRealizedCash = m.cashOut.volume - m.cashIn.volume;
    m.breakevenPrice =
      m.pnlRealized >= 0 ? 0 : Math.abs(m.pnlRealized) / m.quantity;

    m.receive.weightedAveragePrice =
      m.receive.weightedAveragePrice / m.receive.quantity;
    m.receive.averagePrice = m.receive.averagePrice / m.receive.counter;

    m.send.weightedAveragePrice = m.send.weightedAveragePrice / m.send.quantity;
    m.send.averagePrice = m.send.averagePrice / m.send.counter;

    m.buy.weightedAveragePrice = m.buy.weightedAveragePrice / m.buy.quantity;
    m.buy.averagePrice = m.buy.averagePrice / m.buy.counter;

    m.sell.weightedAveragePrice = m.sell.weightedAveragePrice / m.sell.quantity;
    m.sell.averagePrice = m.sell.averagePrice / m.sell.counter;

    m.stablecoinIn.weightedAveragePrice =
      m.stablecoinIn.weightedAveragePrice / m.stablecoinIn.quantity;
    m.stablecoinIn.averagePrice =
      m.stablecoinIn.averagePrice / m.stablecoinIn.counter;

    m.stablecoinOut.weightedAveragePrice =
      m.stablecoinOut.weightedAveragePrice / m.stablecoinOut.quantity;
    m.stablecoinOut.averagePrice =
      m.stablecoinOut.averagePrice / m.stablecoinOut.counter;

    m.cashIn.weightedAveragePrice =
      m.cashIn.weightedAveragePrice / m.cashIn.quantity;
    m.cashIn.averagePrice = m.cashIn.averagePrice / m.cashIn.counter;

    m.cashOut.weightedAveragePrice =
      m.cashOut.weightedAveragePrice / m.cashOut.quantity;
    m.cashOut.averagePrice = m.cashOut.averagePrice / m.cashOut.counter;

    let format = (mo: Metric): Metric => {
      let formatSection = (o: MetricSection): MetricSection => {
        return {
          counter: Number(o.counter.toFixed(3)) || 0,
          volume: Number(o.volume.toFixed(3)) || 0,
          quantity: Number(o.quantity.toFixed(8)) || 0,
          weightedAveragePrice: Number(o.weightedAveragePrice.toFixed(8)) || 0,
          averagePrice: Number(o.averagePrice.toFixed(8)) || 0,
        };
      };
      mo.pnlRealized = Number(mo.pnlRealized.toFixed(3)) || 0;
      mo.pnlRealizedStablecoin =
        Number(mo.pnlRealizedStablecoin.toFixed(3)) || 0;
      mo.pnlRealizedCash = Number(mo.pnlRealizedCash.toFixed(3)) || 0;
      mo.breakevenPrice = Number(mo.breakevenPrice.toFixed(8)) || 0;
      mo.fees = Number(mo.fees.toFixed(3)) || 0;
      mo.receive = formatSection(mo.receive);
      mo.send = formatSection(mo.send);
      mo.buy = formatSection(mo.buy);
      mo.sell = formatSection(mo.sell);
      mo.stablecoinIn = formatSection(mo.stablecoinIn);
      mo.stablecoinOut = formatSection(mo.stablecoinOut);
      mo.cashIn = formatSection(mo.cashIn);
      mo.cashOut = formatSection(mo.cashOut);
      return mo;
    };

    return format(m);
  }
}
