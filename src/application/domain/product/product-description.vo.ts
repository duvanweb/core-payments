import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidProductDescriptionError } from './product-errors';

const MAX_LENGTH = 500;

export class ProductDescription extends ValueObject<string> {
  get value(): string {
    return this.props;
  }

  static create(value: string): Result<ProductDescription, InvalidProductDescriptionError> {
    if (value === null || value === undefined || value.trim().length === 0) {
      return err(new InvalidProductDescriptionError('Product description must not be empty'));
    }
    if (value.length > MAX_LENGTH) {
      return err(
        new InvalidProductDescriptionError(
          `Product description must not exceed ${MAX_LENGTH} characters`,
        ),
      );
    }
    return ok(new ProductDescription(value));
  }
}
