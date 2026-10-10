import { Entity } from '@application/domain/shared/entity';
import { Result } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { Quantity } from './quantity.vo';
import { AmountInCents } from './amount-in-cents.vo';
import { TransactionStatus } from './transaction-status.vo';
import { Reference } from './reference.vo';
import { ShippingAddress } from './shipping-address.vo';
import { ProductSnapshot } from './product-snapshot.vo';
import { CustomerSnapshot } from './customer-snapshot.vo';

export interface TransactionProps {
  id: string;
  productId: string;
  customerId: string | null;
  quantity: number;
  unitPriceInCents: number;
  baseFeeInCents: number;
  shippingFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
  status: string;
  wompiTransactionId: string | null;
  reference: string;
  productData: ProductSnapshot['props'];
  customerData: CustomerSnapshot['props'];
  shippingAddress: ShippingAddress['props'];
}

export class Transaction extends Entity<string> {
  constructor(
    id: string,
    readonly productId: string,
    readonly customerId: string | null,
    readonly quantity: Quantity,
    readonly unitPriceInCents: AmountInCents,
    readonly baseFeeInCents: AmountInCents,
    readonly shippingFeeInCents: AmountInCents,
    readonly totalAmountInCents: AmountInCents,
    readonly currency: string,
    readonly status: TransactionStatus,
    readonly wompiTransactionId: string | null,
    readonly reference: Reference,
    readonly productData: ProductSnapshot,
    readonly customerData: CustomerSnapshot,
    readonly shippingAddress: ShippingAddress,
  ) {
    super(id);
  }

  static create(props: TransactionProps): Result<Transaction, DomainError> {
    return Quantity.create(props.quantity)
      .andThen((quantity) =>
        AmountInCents.create(props.unitPriceInCents).map((unitPriceInCents) => ({
          quantity,
          unitPriceInCents,
        })),
      )
      .andThen(({ quantity, unitPriceInCents }) =>
        AmountInCents.create(props.baseFeeInCents).map((baseFeeInCents) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents }) =>
        AmountInCents.create(props.shippingFeeInCents).map((shippingFeeInCents) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents, shippingFeeInCents }) =>
        AmountInCents.create(props.totalAmountInCents).map((totalAmountInCents) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents, shippingFeeInCents, totalAmountInCents }) =>
        TransactionStatus.create(props.status).map((status) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
          status,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents, shippingFeeInCents, totalAmountInCents, status }) =>
        Reference.create(props.reference).map((reference) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
          status,
          reference,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents, shippingFeeInCents, totalAmountInCents, status, reference }) =>
        ProductSnapshot.create(props.productData).map((productData) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
          status,
          reference,
          productData,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents, shippingFeeInCents, totalAmountInCents, status, reference, productData }) =>
        CustomerSnapshot.create(props.customerData).map((customerData) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
          status,
          reference,
          productData,
          customerData,
        })),
      )
      .andThen(({ quantity, unitPriceInCents, baseFeeInCents, shippingFeeInCents, totalAmountInCents, status, reference, productData, customerData }) =>
        ShippingAddress.create(props.shippingAddress).map((shippingAddress) => ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
          status,
          reference,
          productData,
          customerData,
          shippingAddress,
        })),
      )
      .map(
        ({
          quantity,
          unitPriceInCents,
          baseFeeInCents,
          shippingFeeInCents,
          totalAmountInCents,
          status,
          reference,
          productData,
          customerData,
          shippingAddress,
        }) =>
          new Transaction(
            props.id,
            props.productId,
            props.customerId,
            quantity,
            unitPriceInCents,
            baseFeeInCents,
            shippingFeeInCents,
            totalAmountInCents,
            props.currency,
            status,
            props.wompiTransactionId,
            reference,
            productData,
            customerData,
            shippingAddress,
          ),
      );
  }
}
