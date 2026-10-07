import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidProductPriceError } from './product-errors';

export class ProductPrice extends ValueObject<number> {
  get value(): number {
    return this.props;
  }

  static create(value: number): Result<ProductPrice, InvalidProductPriceError> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return err(new InvalidProductPriceError('Product price must be a finite number'));
    }
    if (value < 0) {
      return err(new InvalidProductPriceError('Product price must not be negative'));
    }
    return ok(new ProductPrice(value));
  }
}
