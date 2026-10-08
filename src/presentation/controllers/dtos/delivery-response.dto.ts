import { ApiProperty } from '@nestjs/swagger';

export class DeliveryResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  transactionId: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ example: 'DHL', nullable: true })
  carrier: string | null;

  @ApiProperty({ example: 'TRACK123456', nullable: true })
  trackingNumber: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;
}
