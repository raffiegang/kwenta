import axios from 'axios';
import { useQuery, BaseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/json/ethgasAPI.json';

type EthGasStationResponse = {
	average: number;
	avgWait: number;
	blockNum: number;
	block_time: number;
	fast: number;
	fastWait: number;
	fastest: number;
	fastestWait: number;
	gasPriceRange: Record<number, number>;
	safeLow: number;
	safeLowWait: number;
	speed: number;
};

type GasSpeed = {
	fast: number;
	average: number;
	slow: number;
};

const useEthGasStationQuery = (options?: BaseQueryOptions) => {
	return useQuery<GasSpeed, any>(
		QUERY_KEYS.Network.EthGasStation,
		async () => {
			const result = await axios.get<EthGasStationResponse>(ETH_GAS_STATION_API_URL);

			const { fast, average, safeLow } = result.data;

			return {
				fast: fast / 10,
				average: average / 10,
				slow: safeLow / 10,
			};
		},
		options
	);
};

export default useEthGasStationQuery;
