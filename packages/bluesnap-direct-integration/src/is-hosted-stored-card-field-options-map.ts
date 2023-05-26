import {
    HostedFieldOptionsMap,
    HostedFieldType,
    HostedStoredCardFieldOptionsMap,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function isHostedStoredCardFieldOptionsMap(
    fields: HostedFieldOptionsMap,
): fields is HostedStoredCardFieldOptionsMap {
    return HostedFieldType.CardNumberVerification in fields;
}
