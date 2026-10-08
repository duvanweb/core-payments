import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const DELIVERY_STATUSES = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: DELIVERY_STATUSES, example: 'IN_TRANSIT' })
  @IsString()
  @IsNotEmpty()
  @IsIn(DELIVERY_STATUSES)
  status: string;

  @ApiProperty({ example: 'DHL', required: false })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiProperty({ example: 'TRACK123456', required: false })
  @IsString()
  @IsOptional()
  trackingNumber?: string;
}
