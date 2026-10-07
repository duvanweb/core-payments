import { Controller, Get, Inject } from '@nestjs/common';
import {
  GetProductsUseCasePort,
  GET_PRODUCTS_USE_CASE,
} from '@application/ports/use-cases/get-products.use-case.port';
import { Product } from '@application/domain/product/product';
import { resultToHttp } from '@presentation/controllers/result-to-http';
import { ProductResponseDto } from '@presentation/controllers/dtos/product-response.dto';

@Controller('products')
export class ProductController {
  constructor(
    @Inject(GET_PRODUCTS_USE_CASE)
    private readonly getProductsUseCase: GetProductsUseCasePort,
  ) {}

  @Get()
  async getProducts(): Promise<ProductResponseDto[]> {
    return this.getProductsUseCase.execute().match(
      (products) => products.map(toResponseDto),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }
}

function toResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    description: product.description.value,
    price: product.price.value,
    imageUrl: product.imageUrl.value,
    stock: product.stock.value,
  };
}
