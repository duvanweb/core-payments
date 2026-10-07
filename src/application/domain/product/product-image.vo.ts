import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidProductImageError } from './product-errors';

export class ProductImage extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<ProductImage, InvalidProductImageError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidProductImageError('Product image must not be empty'));
    }
    return ok(new ProductImage(value));
  }
}
