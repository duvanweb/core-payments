import { Entity } from '@application/domain/shared/entity';
import { Result, ok } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { CustomerEmail } from './customer-email.vo';
import { CustomerFullName } from './customer-full-name.vo';
import { CustomerPhoneNumber } from './customer-phone-number.vo';
import { CustomerPhonePrefix } from './customer-phone-prefix.vo';
import { CustomerLegalId } from './customer-legal-id.vo';
import { CustomerLegalIdType } from './customer-legal-id-type.vo';

export interface CustomerProps {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  phoneNumberPrefix: string;
  legalId?: string;
  legalIdType?: string;
}

export class Customer extends Entity<string> {
  constructor(
    id: string,
    readonly email: CustomerEmail,
    readonly fullName: CustomerFullName,
    readonly phoneNumber: CustomerPhoneNumber,
    readonly phoneNumberPrefix: CustomerPhonePrefix,
    readonly legalId: CustomerLegalId | null,
    readonly legalIdType: CustomerLegalIdType | null,
  ) {
    super(id);
  }

  static create(props: CustomerProps): Result<Customer, DomainError> {
    return CustomerEmail.create(props.email)
      .andThen((email) =>
        CustomerFullName.create(props.fullName).map((fullName) => ({ email, fullName })),
      )
      .andThen(({ email, fullName }) =>
        CustomerPhoneNumber.create(props.phoneNumber).map((phoneNumber) => ({
          email,
          fullName,
          phoneNumber,
        })),
      )
      .andThen(({ email, fullName, phoneNumber }) =>
        CustomerPhonePrefix.create(props.phoneNumberPrefix).map((phoneNumberPrefix) => ({
          email,
          fullName,
          phoneNumber,
          phoneNumberPrefix,
        })),
      )
      .andThen(({ email, fullName, phoneNumber, phoneNumberPrefix }) => {
        if (props.legalId) {
          return CustomerLegalId.create(props.legalId).map((legalId) => ({
            email,
            fullName,
            phoneNumber,
            phoneNumberPrefix,
            legalId,
          }));
        }
        return ok({
          email,
          fullName,
          phoneNumber,
          phoneNumberPrefix,
          legalId: null as CustomerLegalId | null,
        });
      })
      .andThen(({ email, fullName, phoneNumber, phoneNumberPrefix, legalId }) => {
        if (props.legalIdType) {
          return CustomerLegalIdType.create(props.legalIdType).map((legalIdType) => ({
            email,
            fullName,
            phoneNumber,
            phoneNumberPrefix,
            legalId,
            legalIdType,
          }));
        }
        return ok({
          email,
          fullName,
          phoneNumber,
          phoneNumberPrefix,
          legalId,
          legalIdType: null as CustomerLegalIdType | null,
        });
      })
      .map(
        ({ email, fullName, phoneNumber, phoneNumberPrefix, legalId, legalIdType }) =>
          new Customer(
            props.id,
            email,
            fullName,
            phoneNumber,
            phoneNumberPrefix,
            legalId,
            legalIdType,
          ),
      );
  }
}
