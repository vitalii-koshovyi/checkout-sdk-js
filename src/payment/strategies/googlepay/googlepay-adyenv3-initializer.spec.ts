import GooglePayAdyenV3Initializer from './googlepay-adyenv3-initializer';
import { getAdyenV3PaymentDataMock, getAdyenV3PaymentDataRequest, getAdyenV3PaymentMethodMock, getAdyenV3TokenizedPayload, getCheckoutMock } from './googlepay.mock';

describe('GooglePayAdyenV3Initializer', () => {
    let googlePayInitializer: GooglePayAdyenV3Initializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayAdyenV3Initializer();
    });

    it('creates an instance of GooglePayAdyenV3Initializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayAdyenV3Initializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for adyenV3', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getAdyenV3PaymentMethodMock(),
                false
            );

            expect(initialize).toEqual(getAdyenV3PaymentDataRequest());
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(getAdyenV3PaymentDataMock());

            expect(tokenizePayload).toEqual(getAdyenV3TokenizedPayload());
        });
    });
});
