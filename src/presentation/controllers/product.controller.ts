import { Controller, Get, Inject, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import {
  GetProductsUseCasePort,
  GET_PRODUCTS_USE_CASE,
} from '@application/ports/use-cases/get-products.use-case.port';
import { Product } from '@application/domain/product/product';
import { resultToHttp } from '@presentation/controllers/result-to-http';
import { ProductResponseDto } from '@presentation/controllers/dtos/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(GET_PRODUCTS_USE_CASE)
    private readonly getProductsUseCase: GetProductsUseCasePort,
  ) {}

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products', type: [ProductResponseDto] })
  @Get()
  async getProducts(@Req() req: Request): Promise<ProductResponseDto[]> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.getProductsUseCase.execute().match(
      (products) => products.map((p) => toResponseDto(p, baseUrl)),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }
}

function toResponseDto(product: Product, baseUrl: string): ProductResponseDto {
  return {
    id: product.id,
    title: product.title.value,
    description: product.description.value,
    price: product.price.value,
    imageUrl: `${baseUrl}/images/${product.image.value}`,
    stock: product.stock.value,
  };
}
