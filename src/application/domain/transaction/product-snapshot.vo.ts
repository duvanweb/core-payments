import { ValueObject } from '@application/domain/shared/value-object';
import { Result, ok, err } from '@application/domain/shared/result';
import { InvalidProductSnapshotError } from './transaction-errors';

export interface ProductSnapshotProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
}

export class ProductSnapshot extends ValueObject<ProductSnapshotProps> {
  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get price(): number {
    return this.props.price;
  }
  get image(): string {
    return this.props.image;
  }
  get description(): string {
    return this.props.description;
  }

  static create(props: ProductSnapshotProps): Result<ProductSnapshot, InvalidProductSnapshotError> {
    if (!props.id || props.id.trim().length === 0) {
      return err(new InvalidProductSnapshotError('Product snapshot id must not be empty'));
    }
    if (!props.title || props.title.trim().length === 0) {
      return err(new InvalidProductSnapshotError('Product snapshot title must not be empty'));
    }
    if (typeof props.price !== 'number' || props.price < 0) {
      return err(new InvalidProductSnapshotError('Product snapshot price must be a non-negative number'));
    }
    if (!props.image || props.image.trim().length === 0) {
      return err(new InvalidProductSnapshotError('Product snapshot image must not be empty'));
    }
    if (!props.description || props.description.trim().length === 0) {
      return err(new InvalidProductSnapshotError('Product snapshot description must not be empty'));
    }
    return ok(new ProductSnapshot(props));
  }

  toJSON(): ProductSnapshotProps {
    return this.props;
  }
}
