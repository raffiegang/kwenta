import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import Wei, { wei } from '@synthetixio/wei';

import { CurrencyKey, Synths } from 'constants/currency';
import { PeriodLabel } from 'constants/period';
import { Candle } from 'queries/rates/types';
import { zeroBN } from 'utils/formatters/number';
import useSynthetixQueries from '@synthetixio/queries';

export type TempCandle = {
	id: string;
	synth: string;
	open: Wei;
	high: Wei;
	low: Wei;
	close: Wei;
	timestamp: BigInt;
	isBase?: boolean;
};

const useCombinedCandleSticksChartData = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	selectedChartPeriodLabel,
}: {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	const baseCurrencyIsSUSD = baseCurrencyKey === Synths.sUSD;
	const quoteCurrencyIsSUSD = quoteCurrencyKey === Synths.sUSD;

	const base = useData(baseCurrencyKey, selectedChartPeriodLabel);
	const quote = useData(quoteCurrencyKey, selectedChartPeriodLabel);

	const data = useMemo(() => {
		return combineDataToPair(base.data, quote.data, baseCurrencyIsSUSD, quoteCurrencyIsSUSD);
	}, [base.data, quote.data, baseCurrencyIsSUSD, quoteCurrencyIsSUSD]);

	return {
		noData: (base.noData && !baseCurrencyIsSUSD) || (quote.noData && !quoteCurrencyIsSUSD),
		isLoading: (base.isLoading && !baseCurrencyIsSUSD) || (quote.isLoading && !quoteCurrencyIsSUSD),
		data,
	};
};

export const combineDataToPair = (
	baseData: Candle[],
	quoteData: Candle[],
	baseCurrencyIsSUSD: boolean,
	quoteCurrencyIsSUSD: boolean
) => {
	if (baseCurrencyIsSUSD) return quoteData.map(toTempCandle).map(fromTempCandle); // Double map to make sure output is still in the same format
	if (quoteCurrencyIsSUSD) return baseData.map(toTempCandle).map(fromTempCandle);

	if (!(baseData.length && quoteData.length)) return [];

	const baseCandles = baseData.map((candle: Candle) => ({
		isBase: true,
		...toTempCandle(candle),
	}));
	const quoteCandles = quoteData.map(toTempCandle);

	let allCandles: TempCandle[] = [];
	allCandles = allCandles.concat(baseCandles);
	allCandles = allCandles.concat(quoteCandles);
	allCandles = orderBy(allCandles, 'timestamp');

	let prevBaseCandle: TempCandle = baseCandles[0];
	let prevQuoteCandle: TempCandle = quoteCandles[0];

	return allCandles.reduce((candles, candle) => {
		let open = zeroBN;
		let high = zeroBN;
		let low = zeroBN;
		let close = zeroBN;
		if (candle.isBase) {
			open = candle.open.div(prevQuoteCandle.open);
			high = candle.high.div(prevQuoteCandle.high);
			low = candle.low.div(prevQuoteCandle.low);
			close = candle.close.div(prevQuoteCandle.close);
			prevBaseCandle = candle;
		} else {
			open = prevBaseCandle.open.div(candle.open);
			high = prevBaseCandle.high.div(candle.high);
			low = prevBaseCandle.low.div(candle.low);
			close = prevBaseCandle.close.div(candle.close);
			prevQuoteCandle = candle;
		}
		return candles.concat(
			fromTempCandle({
				timestamp: candle.timestamp,
				open,
				high,
				low,
				close,
			} as TempCandle)
		);
	}, [] as Candle[]);
};

type ChartDataQuery = {
	data: Candle[];
	noData: boolean;
	isLoading: boolean;
};

const useData = (
	currencyKey: CurrencyKey | null,
	selectedChartPeriodLabel: PeriodLabel
): ChartDataQuery => {
	const { useCandlesticksQuery } = useSynthetixQueries();
	const query = useCandlesticksQuery(currencyKey, selectedChartPeriodLabel.period);
	const data = query.isSuccess && query.data ? query.data : [];
	const noData = query.isSuccess && query.data && data.length === 0;
	return { data, noData, isLoading: query.isLoading };
};

const toTempCandle = (n: Candle): TempCandle => {
	return {
		id: n.id,
		synth: n.synth,
		open: wei(n.open.toLocaleString()),
		high: wei(n.high.toLocaleString()),
		low: wei(n.low.toLocaleString()),
		close: wei(n.close.toLocaleString()),
		timestamp: n.timestamp,
	};
};

const fromTempCandle = (n: TempCandle): Candle => {
	return {
		id: n.id,
		synth: n.synth,
		open: weiToBigInt(n.open),
		high: weiToBigInt(n.high),
		low: weiToBigInt(n.low),
		close: weiToBigInt(n.close),
		timestamp: n.timestamp,
	};
};

const weiToBigInt = (n: Wei): BigInt => {
	return BigInt(Math.ceil(n.mul(1e18).toNumber()));
};

export default useCombinedCandleSticksChartData;
