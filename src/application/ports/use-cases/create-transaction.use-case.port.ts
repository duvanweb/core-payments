import { UseCase } from '@application/ports/use-cases/use-case.port';
import { DomainError } from '@application/domain/shared/domain-error';
import { CustomerSnapshotProps } from '@application/domain/transaction/customer-snapshot.vo';
import { ShippingAddressProps } from '@application/domain/transaction/shipping-address.vo';

export const CREATE_TRANSACTION_USE_CASE = Symbol('CREATE_TRANSACTION_USE_CASE');

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  productPrice: number;
  customer: CustomerSnapshotProps;
  shippingAddress: ShippingAddressProps;
}

export interface CreateTransactionResult {
  transactionId: string;
  reference: string;
  checkoutUrl: string;
}

export interface CreateTransactionUseCasePort
  extends UseCase<CreateTransactionInput, CreateTransactionResult, DomainError> {}
