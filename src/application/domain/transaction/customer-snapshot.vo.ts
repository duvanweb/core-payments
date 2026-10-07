import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidCustomerSnapshotError } from './transaction-errors';

export interface CustomerSnapshotProps {
  email: string;
  fullName: string;
  phoneNumber: string;
  phoneNumberPrefix: string;
  legalId?: string;
  legalIdType?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class CustomerSnapshot extends ValueObject<CustomerSnapshotProps> {
  get email(): string {
    return this.props.email;
  }
  get fullName(): string {
    return this.props.fullName;
  }
  get phoneNumber(): string {
    return this.props.phoneNumber;
  }
  get phoneNumberPrefix(): string {
    return this.props.phoneNumberPrefix;
  }
  get legalId(): string | undefined {
    return this.props.legalId;
  }
  get legalIdType(): string | undefined {
    return this.props.legalIdType;
  }

  static create(props: CustomerSnapshotProps): Result<CustomerSnapshot, InvalidCustomerSnapshotError> {
    if (!props.email || !EMAIL_REGEX.test(props.email)) {
      return err(new InvalidCustomerSnapshotError('Customer snapshot email must be a valid email'));
    }
    if (!props.fullName || props.fullName.trim().length === 0) {
      return err(new InvalidCustomerSnapshotError('Customer snapshot full name must not be empty'));
    }
    if (!props.phoneNumber || props.phoneNumber.trim().length === 0) {
      return err(new InvalidCustomerSnapshotError('Customer snapshot phone number must not be empty'));
    }
    if (!props.phoneNumberPrefix || props.phoneNumberPrefix.trim().length === 0) {
      return err(new InvalidCustomerSnapshotError('Customer snapshot phone prefix must not be empty'));
    }
    return ok(new CustomerSnapshot(props));
  }

  toJSON(): CustomerSnapshotProps {
    return this.props;
  }
}
