import React, { FC } from 'react';
import styled from 'styled-components';

import { formatCurrency, FormatCurrencyOptions, formatNumber } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';
import { ethers } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';

type WeiSource = Wei | number | string | ethers.BigNumber;

type CurrencyAmountProps = {
	currencyKey: string;
	amount: WeiSource;
	totalValue: WeiSource;
	sign?: string;
	conversionRate?: WeiSource | null;
	formatAmountOptions?: FormatCurrencyOptions;
	formatTotalValueOptions?: FormatCurrencyOptions;
	showTotalValue?: boolean;
	showValue?: boolean;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({
	currencyKey,
	amount,
	totalValue,
	sign,
	conversionRate,
	formatAmountOptions = {},
	formatTotalValueOptions = {},
	showTotalValue = true,
	showValue = true,
	...rest
}) => (
	<Container {...rest}>
		{!showValue ? null : (
			<Amount className="amount">{formatNumber(amount, formatAmountOptions)}</Amount>
		)}
		{!showTotalValue ? null : (
			<TotalValue className="total-value">
				{formatCurrency(
					currencyKey,
					conversionRate != null ? wei(totalValue).div(conversionRate) : totalValue,
					{ sign, ...formatTotalValueOptions }
				)}
			</TotalValue>
		)}
	</Container>
);

const Container = styled.span`
	${ContainerRowMixin};
	justify-items: end;
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Amount = styled.span`
	color: ${(props) => props.theme.colors.white};
`;
const TotalValue = styled.span``;

export default CurrencyAmount;
