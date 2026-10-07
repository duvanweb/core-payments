/**
 * Response DTO for a product — the shape exposed over HTTP.
 * Domain entities are never exposed directly; the controller maps to this DTO.
 */
export class ProductResponseDto {
  id: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}
