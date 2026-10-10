import { randomUUID } from 'crypto';
import { Result, ok, err } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { Product } from '@application/domain/product/product';
import { ProductNotFoundError } from '@application/domain/product/product-errors';
import { InsufficientStockError, PriceMismatchError } from '@application/domain/transaction/transaction-errors';
import { Transaction } from '@application/domain/transaction/transaction';
import { ProductSnapshot } from '@application/domain/transaction/product-snapshot.vo';
import { CustomerSnapshot } from '@application/domain/transaction/customer-snapshot.vo';
import { ShippingAddress } from '@application/domain/transaction/shipping-address.vo';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { WompiCheckoutPort } from '@application/ports/gateways/wompi-checkout.port';
import {
  CreateTransactionUseCasePort,
  CreateTransactionInput,
  CreateTransactionResult,
} from '@application/ports/use-cases/create-transaction.use-case.port';

export interface TransactionConfig {
  baseFeeInCents: number;
  shippingFeeInCents: number;
  currency: string;
}

export class CreateTransactionUseCase implements CreateTransactionUseCasePort {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly wompiCheckout: WompiCheckoutPort,
    private readonly config: TransactionConfig,
  ) {}

  execute(input: CreateTransactionInput): ReturnType<CreateTransactionUseCasePort['execute']> {
    return this.productRepository
      .findById(input.productId)
      .andThen((product): Result<Transaction, DomainError> => {
        if (product === null) {
          return err(new ProductNotFoundError(`Product with id ${input.productId} not found`));
        }

        const priceResult = this.validatePrice(product, input.productPrice);
        if (priceResult.isErr()) return priceResult;

        const stockResult = this.validateStock(product, input.quantity);
        if (stockResult.isErr()) return stockResult;

        return this.buildTransaction(product, input);
      })
      .andThen((transaction) =>
        this.transactionRepository.save(transaction),
      )
      .map((transaction) => this.buildResult(transaction));
  }

  private validatePrice(product: Product, productPrice: number): Result<void, DomainError> {
    const dbPriceInCents = Math.round(product.price.value * 100);
    const requestPriceInCents = Math.round(productPrice * 100);
    if (dbPriceInCents !== requestPriceInCents) {
      return err(
        new PriceMismatchError(
          `Product price mismatch: expected ${dbPriceInCents} cents, got ${requestPriceInCents} cents`,
        ),
      );
    }
    return ok(undefined);
  }

  private validateStock(product: Product, quantity: number): Result<void, DomainError> {
    if (product.stock.value < quantity) {
      return err(
        new InsufficientStockError(
          `Insufficient stock: requested ${quantity}, available ${product.stock.value}`,
        ),
      );
    }
    return ok(undefined);
  }

  private buildTransaction(
    product: Product,
    input: CreateTransactionInput,
  ): Result<Transaction, DomainError> {
    const productSnapshot = ProductSnapshot.create({
      id: product.id,
      title: product.title.value,
      price: product.price.value,
      image: product.image.value,
      description: product.description.value,
    });
    if (productSnapshot.isErr()) return productSnapshot;

    const customerSnapshot = CustomerSnapshot.create(input.customer);
    if (customerSnapshot.isErr()) return customerSnapshot;

    const shippingAddress = ShippingAddress.create(input.shippingAddress);
    if (shippingAddress.isErr()) return shippingAddress;

    const unitPriceInCents = Math.round(product.price.value * 100);
    const totalAmountInCents =
      unitPriceInCents * input.quantity +
      this.config.baseFeeInCents +
      this.config.shippingFeeInCents;
    const reference = randomUUID();

    return Transaction.create({
      id: randomUUID(),
      productId: product.id,
      customerId: null,
      quantity: input.quantity,
      unitPriceInCents,
      baseFeeInCents: this.config.baseFeeInCents,
      shippingFeeInCents: this.config.shippingFeeInCents,
      totalAmountInCents,
      currency: this.config.currency,
      status: 'PENDING',
      wompiTransactionId: null,
      reference,
      productData: productSnapshot.value.toJSON(),
      customerData: customerSnapshot.value.toJSON(),
      shippingAddress: shippingAddress.value.toJSON(),
    });
  }

  private buildResult(transaction: Transaction): CreateTransactionResult {
    const checkoutUrl = this.wompiCheckout.generateCheckoutUrl({
      reference: transaction.reference.value,
      amountInCents: transaction.totalAmountInCents.value,
      currency: transaction.currency,
      customer: {
        email: transaction.customerData.email,
        fullName: transaction.customerData.fullName,
        phoneNumber: transaction.customerData.phoneNumber,
        phoneNumberPrefix: transaction.customerData.phoneNumberPrefix,
        legalId: transaction.customerData.legalId,
        legalIdType: transaction.customerData.legalIdType,
      },
      shippingAddress: {
        addressLine1: transaction.shippingAddress.addressLine1,
        addressLine2: transaction.shippingAddress.addressLine2,
        country: transaction.shippingAddress.country,
        city: transaction.shippingAddress.city,
        phoneNumber: transaction.shippingAddress.phoneNumber,
        region: transaction.shippingAddress.region,
        name: transaction.shippingAddress.name,
        postalCode: transaction.shippingAddress.postalCode,
      },
    });

    return {
      transactionId: transaction.id,
      reference: transaction.reference.value,
      checkoutUrl,
    };
  }
}
