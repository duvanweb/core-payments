import { CreateTransactionUseCase, TransactionConfig } from './create-transaction.use-case';
import { ProductRepositoryPort } from '@application/ports/repositories/product.repository.port';
import { TransactionRepositoryPort } from '@application/ports/repositories/transaction.repository.port';
import { WompiCheckoutPort, WompiCheckoutParams } from '@application/ports/gateways/wompi-checkout.port';
import { Product } from '@application/domain/product/product';
import { Transaction } from '@application/domain/transaction/transaction';
import { ResultAsync, okAsync } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { ProductNotFoundError } from '@application/domain/product/product-errors';
import { PriceMismatchError, InsufficientStockError } from '@application/domain/transaction/transaction-errors';
import { CreateTransactionInput } from '@application/ports/use-cases/create-transaction.use-case.port';

class FakeProductRepository implements ProductRepositoryPort {
  constructor(private readonly product: Product | null) {}
  findAll(): ResultAsync<Product[], DomainError> {
    return okAsync(this.product ? [this.product] : []);
  }
  findById(id: string): ResultAsync<Product | null, DomainError> {
    return okAsync(this.product && this.product.id === id ? this.product : null);
  }
}

class FakeTransactionRepository implements TransactionRepositoryPort {
  savedTransaction: Transaction | null = null;
  save(transaction: Transaction): ResultAsync<Transaction, DomainError> {
    this.savedTransaction = transaction;
    return okAsync(transaction);
  }
  findById(_id: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(null);
  }
  findByReference(_reference: string): ResultAsync<Transaction | null, DomainError> {
    return okAsync(null);
  }
  completeTransaction(_reference: string, _status: string, _wompiTransactionId: string): ResultAsync<Transaction, DomainError> {
    return okAsync(this.savedTransaction!);
  }
}

class FakeWompiCheckout implements WompiCheckoutPort {
  generateCheckoutUrl(_params: WompiCheckoutParams): string {
    return 'https://checkout.wompi.co/p/?reference=test-ref';
  }
}

function makeProduct(price: number = 95.0, stock: number = 10): Product {
  const result = Product.create({
    id: 'prod-001',
    title: 'Premium coffee beans',
    description: 'Premium coffee beans description',
    price,
    image: 'coffee-1kg.jpg',
    stock,
  });
  return result.match(
    (p) => p,
    () => { throw new Error('Failed to create test product'); },
  );
}

const config: TransactionConfig = {
  baseFeeInCents: 250000,
  shippingFeeInCents: 300000,
  currency: 'COP',
};

function makeInput(productPrice: number = 95.0, quantity: number = 1): CreateTransactionInput {
  return {
    productId: 'prod-001',
    quantity,
    productPrice,
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
}

describe('CreateTransactionUseCase', () => {
  it('returns Ok with checkoutUrl when product found, price matches, stock sufficient', async () => {
    const product = makeProduct();
    const productRepo = new FakeProductRepository(product);
    const txRepo = new FakeTransactionRepository();
    const wompi = new FakeWompiCheckout();
    const useCase = new CreateTransactionUseCase(productRepo, txRepo, wompi, config);

    const result = await useCase.execute(makeInput());

    expect(result.isOk()).toBe(true);
    result.match(
      (value) => {
        expect(value.transactionId).toBeDefined();
        expect(value.reference).toBeDefined();
        expect(value.checkoutUrl).toContain('checkout.wompi.co');
      },
      () => fail('Expected Ok'),
    );
  });

  it('returns Err with ProductNotFoundError when product not found', async () => {
    const productRepo = new FakeProductRepository(null);
    const txRepo = new FakeTransactionRepository();
    const wompi = new FakeWompiCheckout();
    const useCase = new CreateTransactionUseCase(productRepo, txRepo, wompi, config);

    const result = await useCase.execute(makeInput());

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(ProductNotFoundError),
    );
  });

  it('returns Err with PriceMismatchError when price does not match', async () => {
    const product = makeProduct(95.0);
    const productRepo = new FakeProductRepository(product);
    const txRepo = new FakeTransactionRepository();
    const wompi = new FakeWompiCheckout();
    const useCase = new CreateTransactionUseCase(productRepo, txRepo, wompi, config);

    const result = await useCase.execute(makeInput(99.99));

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(PriceMismatchError),
    );
  });

  it('returns Err with InsufficientStockError when stock insufficient', async () => {
    const product = makeProduct(95.0, 0);
    const productRepo = new FakeProductRepository(product);
    const txRepo = new FakeTransactionRepository();
    const wompi = new FakeWompiCheckout();
    const useCase = new CreateTransactionUseCase(productRepo, txRepo, wompi, config);

    const result = await useCase.execute(makeInput(95.0, 1));

    expect(result.isErr()).toBe(true);
    result.match(
      () => fail('Expected Err'),
      (error) => expect(error).toBeInstanceOf(InsufficientStockError),
    );
  });
});

function fail(message: string): never {
  throw new Error(message);
}
