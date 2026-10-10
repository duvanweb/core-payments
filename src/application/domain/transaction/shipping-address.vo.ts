import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidShippingAddressError } from './transaction-errors';

export interface ShippingAddressProps {
  addressLine1: string;
  addressLine2?: string;
  country: string;
  city: string;
  phoneNumber: string;
  region: string;
  name?: string;
  postalCode?: string;
}

const COUNTRY_REGEX = /^[A-Z]{2}$/;

export class ShippingAddress extends ValueObject<ShippingAddressProps> {
  get addressLine1(): string {
    return this.props.addressLine1;
  }
  get addressLine2(): string | undefined {
    return this.props.addressLine2;
  }
  get country(): string {
    return this.props.country;
  }
  get city(): string {
    return this.props.city;
  }
  get phoneNumber(): string {
    return this.props.phoneNumber;
  }
  get region(): string {
    return this.props.region;
  }
  get name(): string | undefined {
    return this.props.name;
  }
  get postalCode(): string | undefined {
    return this.props.postalCode;
  }

  static create(props: ShippingAddressProps): Result<ShippingAddress, InvalidShippingAddressError> {
    if (!props.addressLine1 || props.addressLine1.trim().length === 0) {
      return err(new InvalidShippingAddressError('Address line 1 must not be empty'));
    }
    if (!props.country || !COUNTRY_REGEX.test(props.country)) {
      return err(new InvalidShippingAddressError('Country must be a 2-letter ISO code (e.g. CO)'));
    }
    if (!props.city || props.city.trim().length === 0) {
      return err(new InvalidShippingAddressError('City must not be empty'));
    }
    if (!props.phoneNumber || props.phoneNumber.trim().length === 0) {
      return err(new InvalidShippingAddressError('Phone number must not be empty'));
    }
    if (!props.region || props.region.trim().length === 0) {
      return err(new InvalidShippingAddressError('Region must not be empty'));
    }
    return ok(new ShippingAddress(props));
  }

  toJSON(): ShippingAddressProps {
    return this.props;
  }
}
