import { Entity } from '@application/domain/shared/entity';
import { Result } from '@application/domain/shared/result';
import { DomainError } from '@application/domain/shared/domain-error';
import { ProductTitle } from './product-title.vo';
import { ProductDescription } from './product-description.vo';
import { ProductPrice } from './product-price.vo';
import { ProductImage } from './product-image.vo';
import { Stock } from './stock.vo';

export interface ProductProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

/**
 * Product entity — the central aggregate of the product catalog.
 * Identity is based on `id` (UUID). Invariants are enforced through Value Objects.
 */
export class Product extends Entity<string> {
  constructor(
    id: string,
    readonly title: ProductTitle,
    readonly description: ProductDescription,
    readonly price: ProductPrice,
    readonly image: ProductImage,
    readonly stock: Stock,
  ) {
    super(id);
  }

  static create(props: ProductProps): Result<Product, DomainError> {
    return ProductTitle.create(props.title)
      .andThen((title) =>
        ProductDescription.create(props.description).map((description) => ({ title, description })),
      )
      .andThen(({ title, description }) =>
        ProductPrice.create(props.price).map((price) => ({ title, description, price })),
      )
      .andThen(({ title, description, price }) =>
        ProductImage.create(props.image).map((image) => ({ title, description, price, image })),
      )
      .andThen(({ title, description, price, image }) =>
        Stock.create(props.stock).map((stock) => ({ title, description, price, image, stock })),
      )
      .map(
        ({ title, description, price, image, stock }) =>
          new Product(props.id, title, description, price, image, stock),
      );
  }
}
