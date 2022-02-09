import ExchangePage from '../pages/exchange/exchange-page';

const exchange = new ExchangePage();
const testedAsset = 'sETH';

/*
* This end-to-end test illustrates the happy flow of swapping synths through the Kwenta exchange on Optimistic Kovan
* 1 sUSD is swapped
* This e2e test works with Chrome on Optimistic Kovan   
*/

describe('Trade 1 sUSD for sETH on Optimism', () => {
	context(`Trade sUSD => ${testedAsset}`, () => {
		before(() => {
			
			exchange.visit(`${testedAsset}-sUSD`);
			exchange.connectBrowserWallet();
			
			// we must be logged in now ; added statement we need a wallet address available
			cy.findByTestId('wallet-btn').should(`contain.text`,'0x');

			/* when this test is runned chained as a part of testrun the snippet below causes problems. However,if the test is run "standalone" it becomes required
			//   TODO: investigate fix for the above, for now assuming chained test runs		
			exchange.acceptMetamaskAccessRequest();
			exchange.waitUntilLoggedIn();
			*/
			
			
		});
		it(`should exchange with success`, () => {
			// enters a value of 1 sUSD
			exchange.getCurrencyAmount().type('1');
			exchange.getSubmitOrderBtn().click();
			exchange.confirmMetamaskTransaction();
			exchange.waitForTransactionSuccess();
		});
	});
});
