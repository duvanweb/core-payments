import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for a product — the shape exposed over HTTP.
 * Domain entities are never exposed directly; the controller maps to this DTO.
 */
export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  stock: number;
}
