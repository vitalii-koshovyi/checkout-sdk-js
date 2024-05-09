import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    INTERNAL_USE_ONLY,
    isRequestError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class ZipPaymentStrategy implements PaymentStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private requestSender: RequestSender,
    ) {}

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;
        const { getPaymentMethodOrThrow } = await this.paymentIntegrationService.loadPaymentMethod(
            methodId,
            options,
        );

        const {
            clientToken,
            initializationData,
        }: { clientToken?: string; initializationData?: { redirectUrl?: string } } =
            getPaymentMethodOrThrow(methodId);
        const redirectUrl = initializationData?.redirectUrl;

        if (!clientToken || !redirectUrl) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { id: nonce } = JSON.parse(clientToken);

        if (!nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        const { isStoreCreditApplied: useStoreCredit } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        await this.paymentIntegrationService.initializePayment(methodId, { useStoreCredit });

        await this.paymentIntegrationService.submitOrder(order, options);
        await this._prepareForReferredRegistration(methodId, nonce);

        try {
            await this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData: { nonce },
            });
        } catch (error) {
            if (isRequestError(error) && error.body.status === 'additional_action_required') {
                return new Promise(() => window.location.replace(redirectUrl));
            }

            throw error;
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async saveExternalId(methodId: string, token: string): Promise<void> {
        const url = `/api/storefront/payment/${methodId}/save-external-id`;
        const options = {
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
                ...SDK_VERSION_HEADERS,
            },
            body: {
                externalId: token,
                provider: methodId,
            },
        };

        await this.requestSender.post<void>(url, options);
    }

    private _prepareForReferredRegistration(methodId: string, externalId: string): Promise<void> {
        return this.saveExternalId(methodId, externalId);
    }
}
