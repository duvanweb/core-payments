import { createHash } from 'crypto';
import { WompiCheckoutService, WompiCheckoutConfig } from './wompi-checkout.service';
import { WompiCheckoutParams } from '@application/ports/gateways/wompi-checkout.port';

const config: WompiCheckoutConfig = {
  checkoutUrl: 'https://checkout.co.uat.wompi.dev/p/',
  publicKey: 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
  integritySecret: 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp',
  redirectUrl: 'http://localhost:3000/payment/result',
};

const params: WompiCheckoutParams = {
  reference: 'ref-123',
  amountInCents: 9500000,
  currency: 'COP',
  customer: {
    email: 'cliente@example.com',
    fullName: 'Juan Pérez',
    phoneNumber: '3001234567',
    phoneNumberPrefix: '+57',
  },
  shippingAddress: {
    addressLine1: 'Calle 123 #45-67',
    country: 'CO',
    city: 'Bogotá',
    phoneNumber: '3001234567',
    region: 'Cundinamarca',
  },
};

describe('WompiCheckoutService', () => {
  let service: WompiCheckoutService;

  beforeAll(() => {
    service = new WompiCheckoutService(config);
  });

  it('uses the checkout URL as base', () => {
    const url = service.generateCheckoutUrl(params);
    expect(url.startsWith('https://checkout.co.uat.wompi.dev/p/?')).toBe(true);
  });

  it('includes all mandatory parameters', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    expect(search.get('public-key')).toBe(config.publicKey);
    expect(search.get('currency')).toBe('COP');
    expect(search.get('amount-in-cents')).toBe('9500000');
    expect(search.get('reference')).toBe('ref-123');
    expect(search.get('signature:integrity')).toBeDefined();
  });

  it('computes the integrity signature as SHA-256(reference + amount + currency + secret)', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    const expected = createHash('sha256')
      .update('ref-1239500000COP' + config.integritySecret)
      .digest('hex');

    expect(search.get('signature:integrity')).toBe(expected);
  });

  it('uses colon notation for nested params, NOT brackets', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    // Colons are percent-encoded as %3A in the raw string, but parse back to ':'
    expect(search.get('customer-data:email')).toBe('cliente@example.com');
    expect(search.get('customer-data:full-name')).toBe('Juan Pérez');
    expect(search.get('customer-data:phone-number')).toBe('3001234567');
    expect(search.get('customer-data:phone-number-prefix')).toBe('+57');
    expect(search.get('shipping-address:address-line-1')).toBe('Calle 123 #45-67');
    expect(search.get('shipping-address:country')).toBe('CO');
    expect(search.get('shipping-address:city')).toBe('Bogotá');
    expect(search.get('shipping-address:region')).toBe('Cundinamarca');

    // Bracket notation must NOT appear (would be %5B...%5D if present)
    const queryString = url.split('?')[1];
    expect(queryString).not.toContain('%5B');
    expect(queryString).not.toContain('%5D');
  });

  it('includes redirect-url and collect-shipping', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    expect(search.get('redirect-url')).toBe(config.redirectUrl);
    expect(search.get('collect-shipping')).toBe('true');
  });

  it('includes customer data values', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    expect(search.get('customer-data:email')).toBe('cliente@example.com');
    expect(search.get('customer-data:full-name')).toBe('Juan Pérez');
    expect(search.get('customer-data:phone-number')).toBe('3001234567');
    expect(search.get('customer-data:phone-number-prefix')).toBe('+57');
  });

  it('includes shipping address values', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    expect(search.get('shipping-address:address-line-1')).toBe('Calle 123 #45-67');
    expect(search.get('shipping-address:country')).toBe('CO');
    expect(search.get('shipping-address:city')).toBe('Bogotá');
    expect(search.get('shipping-address:phone-number')).toBe('3001234567');
    expect(search.get('shipping-address:region')).toBe('Cundinamarca');
  });

  it('includes legal-id when provided', () => {
    const url = service.generateCheckoutUrl({
      ...params,
      customer: { ...params.customer, legalId: '12345678', legalIdType: 'CC' },
    });
    const search = new URL(url).searchParams;

    expect(search.get('customer-data:legal-id')).toBe('12345678');
    expect(search.get('customer-data:legal-id-type')).toBe('CC');
  });

  it('omits legal-id when not provided', () => {
    const url = service.generateCheckoutUrl(params);
    const search = new URL(url).searchParams;

    expect(search.has('customer-data:legal-id')).toBe(false);
    expect(search.has('customer-data:legal-id-type')).toBe(false);
  });
});
