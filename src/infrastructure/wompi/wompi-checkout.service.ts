import { createHash } from 'crypto';
import {
  WompiCheckoutPort,
  WompiCheckoutParams,
} from '@application/ports/gateways/wompi-checkout.port';

export interface WompiCheckoutConfig {
  checkoutUrl: string;
  publicKey: string;
  integritySecret: string;
  redirectUrl: string;
}

export class WompiCheckoutService implements WompiCheckoutPort {
  constructor(private readonly config: WompiCheckoutConfig) {}

  generateCheckoutUrl(params: WompiCheckoutParams): string {
    const signature = createHash('sha256')
      .update(
        params.reference +
          String(params.amountInCents) +
          params.currency +
          this.config.integritySecret,
      )
      .digest('hex');

    const queryParams = new URLSearchParams();
    queryParams.set('public-key', this.config.publicKey);
    queryParams.set('currency', params.currency);
    queryParams.set('amount-in-cents', String(params.amountInCents));
    queryParams.set('reference', params.reference);
    queryParams.set('signature:integrity', signature);
    queryParams.set('redirect-url', this.config.redirectUrl);
    queryParams.set('collect-shipping', 'true');

    queryParams.set('customer-data[email]', params.customer.email);
    queryParams.set('customer-data[full-name]', params.customer.fullName);
    queryParams.set('customer-data[phone-number]', params.customer.phoneNumber);
    queryParams.set('customer-data[phone-number-prefix]', params.customer.phoneNumberPrefix);
    if (params.customer.legalId) {
      queryParams.set('customer-data[legal-id]', params.customer.legalId);
    }
    if (params.customer.legalIdType) {
      queryParams.set('customer-data[legal-id-type]', params.customer.legalIdType);
    }

    queryParams.set('shipping-address[address-line-1]', params.shippingAddress.addressLine1);
    if (params.shippingAddress.addressLine2) {
      queryParams.set('shipping-address[address-line-2]', params.shippingAddress.addressLine2);
    }
    queryParams.set('shipping-address[country]', params.shippingAddress.country);
    queryParams.set('shipping-address[city]', params.shippingAddress.city);
    queryParams.set('shipping-address[phone-number]', params.shippingAddress.phoneNumber);
    queryParams.set('shipping-address[region]', params.shippingAddress.region);
    if (params.shippingAddress.name) {
      queryParams.set('shipping-address[name]', params.shippingAddress.name);
    }
    if (params.shippingAddress.postalCode) {
      queryParams.set('shipping-address[postal-code]', params.shippingAddress.postalCode);
    }

    return `${this.config.checkoutUrl}?${queryParams.toString()}`;
  }
}
