import { Controller, Get, Inject, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import {
  GetProductsUseCasePort,
  GET_PRODUCTS_USE_CASE,
} from '@application/ports/use-cases/get-products.use-case.port';
import {
  GetProductByIdUseCasePort,
  GET_PRODUCT_BY_ID_USE_CASE,
} from '@application/ports/use-cases/get-product-by-id.use-case.port';
import { Product } from '@application/domain/product/product';
import { resultToHttp } from '@presentation/controllers/result-to-http';
import { ProductResponseDto } from '@presentation/controllers/dtos/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(GET_PRODUCTS_USE_CASE)
    private readonly getProductsUseCase: GetProductsUseCasePort,
    @Inject(GET_PRODUCT_BY_ID_USE_CASE)
    private readonly getProductByIdUseCase: GetProductByIdUseCasePort,
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

  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, description: 'The product', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get(':id')
  async getProductById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ProductResponseDto> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.getProductByIdUseCase.execute(id).match(
      (product) => toResponseDto(product, baseUrl),
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
