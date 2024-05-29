import { RequestOptions } from '../common/http-request';

import { CheckoutButtonMethodType } from './strategies';
import { AmazonPayV2ButtonInitializeOptions } from './strategies/amazon-pay-v2';
import {
    BraintreePaypalButtonInitializeOptions,
    BraintreePaypalCreditButtonInitializeOptions,
    BraintreeVenmoButtonInitializeOptions,
} from './strategies/braintree';
import { PaypalButtonInitializeOptions } from './strategies/paypal';

export { CheckoutButtonInitializeOptions } from '../generated/checkout-button-initialize-options';

/**
 * The set of options for configuring the checkout button.
 */
export interface CheckoutButtonOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: CheckoutButtonMethodType;
}

export interface BaseCheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    [key: string]: unknown;

    /**
     * The options that are required to facilitate AmazonPayV2. They can be
     * omitted unless you need to support AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree PayPal. They can be
     * omitted unless you need to support Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree Credit. They can be
     * omitted unless you need to support Braintree Credit.
     */
    braintreepaypalcredit?: BraintreePaypalCreditButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree Venmo. They can be
     * omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoButtonInitializeOptions;

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;

    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;

    /**
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;
}
