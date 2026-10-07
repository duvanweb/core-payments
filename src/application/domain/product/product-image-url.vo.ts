import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidProductImageUrlError } from './product-errors';

export class ProductImageUrl extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<ProductImageUrl, InvalidProductImageUrlError> {
    try {
      new URL(value);
      return ok(new ProductImageUrl(value));
    } catch {
      return err(new InvalidProductImageUrlError('Product image URL must be a valid URL'));
    }
  }
}
