import { DomainError } from '@application/domain/shared/domain-error';

export const WOMPI_CHECKOUT = Symbol('WOMPI_CHECKOUT');

export interface WompiCheckoutParams {
  reference: string;
  amountInCents: number;
  currency: string;
  customer: {
    email: string;
    fullName: string;
    phoneNumber: string;
    phoneNumberPrefix: string;
    legalId?: string;
    legalIdType?: string;
  };
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    country: string;
    city: string;
    phoneNumber: string;
    region: string;
    name?: string;
    postalCode?: string;
  };
}

export interface WompiCheckoutPort {
  generateCheckoutUrl(params: WompiCheckoutParams): string;
}

export type { DomainError };
