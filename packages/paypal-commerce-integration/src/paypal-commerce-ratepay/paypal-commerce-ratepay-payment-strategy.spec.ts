import {
    BillingAddress,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import {
    getPayPalCommerceIntegrationServiceMock,
    getPayPalCommerceRatePayPaymentMethod,
    getPayPalSDKMock,
} from '../mocks';
import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { PayPalCommerceHostWindow, PayPalOrderStatus, PayPalSDK } from '../paypal-commerce-types';

import { PaypalCommerceRatePay } from './paypal-commerce-ratepay-initialize-options';
import PaypalCommerceRatepayPaymentStrategy from './paypal-commerce-ratepay-payment-strategy';

describe('PayPalCommerceAlternativeMethodRatePayPaymentStrategy', () => {
    let billingAddress: BillingAddress;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceIntegrationService: PayPalCommerceIntegrationService;
    let paypalSdk: PayPalSDK;
    let strategy: PaypalCommerceRatepayPaymentStrategy;
    let loadingIndicator: LoadingIndicator;

    const paypalCommerceRatePayMethodsOptions: PaypalCommerceRatePay = {
        container: '#checkout-payment-continue',
        legalTextContainer: 'legal-text-container',
        loadingContainerId: 'checkout-page-container-id',
        getFieldsValues: () => {
            return {
                ratepayBirthDate: {
                    getDate: () => 1,
                    getMonth: () => 1,
                    getFullYear: () => 2000,
                },
                ratepayPhoneNumber: '234343434',
                ratepayPhoneCountryCode: '49',
            };
        },
    };

    const initializationOptions: PaymentInitializeOptions = {
        methodId: 'ratepay',
        gatewayId: 'paypalcommercealternativemethods',
        paypalcommerceratepay: paypalCommerceRatePayMethodsOptions,
    };

    beforeEach(() => {
        paypalCommerceIntegrationService = getPayPalCommerceIntegrationServiceMock();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        loadingIndicator = new LoadingIndicator();

        strategy = new PaypalCommerceRatepayPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceIntegrationService,
            loadingIndicator,
        );

        jest.spyOn(loadingIndicator, 'show').mockReturnValue(undefined);
        jest.spyOn(loadingIndicator, 'hide').mockReturnValue(undefined);

        jest.spyOn(paypalCommerceIntegrationService, 'getOrderStatus').mockResolvedValue(
            PayPalOrderStatus.PollingStop,
        );
        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'legal-text-container') {
                const el = document.createElement('div');

                el.innerHTML = 'Mocked legal text';

                return el;
            }

            return null;
        });

        paypalSdk = getPayPalSDKMock();
        paypalSdk.Legal.FUNDING = {
            PAY_UPON_INVOICE: 'PAY_UPON_INVOICE',
        };

        paymentMethod = getPayPalCommerceRatePayPaymentMethod();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);

        jest.spyOn(paypalCommerceIntegrationService, 'loadPayPalSdk').mockResolvedValue(paypalSdk);
        jest.spyOn(paypalCommerceIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(
            paypalSdk,
        );
        jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockResolvedValue('1eddfd');
        jest.spyOn(paypalCommerceIntegrationService, 'submitPayment').mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as PayPalCommerceHostWindow).paypal;
    });

    it('creates an instance of the PayPal Commerce RatePay payment strategy', () => {
        expect(strategy).toBeInstanceOf(PaypalCommerceRatepayPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if loadingContainerId is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    legalTextContainer: 'legal-text-container',
                    container: '#checkout-payment-continue',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if gatewayId is not provided', async () => {
            const options = {
                methodId: 'ratepay',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if options.paypalcommerceratepay is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if container is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    legalTextContainer: 'legal-text-container',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if legalTextContainer is not provided', async () => {
            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws error if merchantId is not provided', async () => {
            paymentMethod.initializationData.merchantId = '';

            const options = {
                methodId: 'ratepay',
                gatewayId: 'paypalcommercealternativemethods',
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                    legalTextContainer: 'legal-text-container',
                },
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });

    describe('#toggleLoadingIndicator', () => {
        it('shows loading indicator on execute', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(loadingIndicator.show).toHaveBeenCalled();
        });

        it('hides loading indicator when error occurs', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);

            try {
                await strategy.execute(payload);
                await new Promise((_resolve, reject) => process.nextTick(reject));
            } catch (error: unknown) {
                expect(loadingIndicator.hide).toHaveBeenCalled();
            }
        });
    });

    describe('#createFraudnetScript', () => {
        it('add fraudNet script to document', async () => {
            await strategy.initialize(initializationOptions);

            const fraudNetScript = document.querySelectorAll(
                '[fncls = "fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99"]',
            );

            expect(fraudNetScript).toBeDefined();
        });

        it('add another needed fraudNet script', async () => {
            await strategy.initialize(initializationOptions);

            const script = document.querySelector('script[src="https://c.paypal.com/da/r/fb.js"]');

            expect(script).toBeDefined();
        });
    });

    describe('#renderLegalText', () => {
        it('throws error if legalTextContainerElement is not found', async () => {
            jest.spyOn(document, 'getElementById').mockImplementation(() => null);

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('renders legal text', async () => {
            await strategy.initialize(initializationOptions);

            const source = document.getElementsByTagName('html')[0].innerHTML;
            const legalText = source.search(
                'By clicking on the button, you agree to the terms of payment and performance of a risk check from the payment partner, Ratepay. You also agree to PayPal’s privacy statement. If your request to purchase upon invoice is accepted, the purchase price claim will be assigned to Ratepay, and you may only pay Ratepay, not the merchant.',
            );

            expect(legalText).toBeDefined();
        });
    });

    describe('#execute()', () => {
        it('throws an error if payload.payment is not provided', async () => {
            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('throws an error if orderId is not defined', async () => {
            jest.spyOn(paypalCommerceIntegrationService, 'createOrder').mockResolvedValue('');

            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fetch order status', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(paypalCommerceIntegrationService.getOrderStatus).toHaveBeenCalledWith(
                'paypalcommercealternativemethods',
                { params: { useMetadata: true } },
            );
        });

        it('submits order', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('submits payment with correct data', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            const expectedPayload = {
                methodId: 'ratepay',
                paymentData: {
                    formattedPayload: {
                        device_info: null,
                        method_id: 'ratepay',
                        paypal_account: {
                            order_id: '1eddfd',
                        },
                        rate_pay: {
                            birth_date: '2000-02-01',
                            phone: {
                                country_code: undefined,
                                national_number: '234343434',
                            },
                        },
                        set_as_default_stored_instrument: null,
                        vault_payment_instrument: null,
                    },
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayload);
        });

        it('initialize polling mechanism', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceIntegrationService.getOrderStatus).toHaveBeenCalled();
        });

        it('stop polling mechanism if corresponding status received', async () => {
            jest.spyOn(paypalCommerceIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.PollingError,
            );

            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            jest.spyOn(global, 'clearTimeout');

            try {
                await strategy.initialize(initializationOptions);
                await strategy.execute(payload);
            } catch (e) {
                expect(clearTimeout).toHaveBeenCalled();
            }
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });

        it('deinitialize polling mechanism', async () => {
            const payload = {
                payment: {
                    methodId: 'ratepay',
                    gatewayId: 'paypalcommercealternativemethods',
                },
            };

            jest.spyOn(paypalCommerceIntegrationService, 'getOrderStatus').mockResolvedValue(
                PayPalOrderStatus.PollingStop,
            );

            jest.spyOn(document, 'getElementById').mockImplementation((id) => {
                if (id === 'legal-text-container') {
                    const el = document.createElement('div');

                    el.remove = jest.fn();

                    return el;
                }

                return null;
            });
            jest.spyOn(global, 'clearTimeout');

            await strategy.initialize(initializationOptions);
            await strategy.execute(payload);
            await new Promise((resolve) => process.nextTick(resolve));
            await strategy.deinitialize();

            expect(clearTimeout).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
