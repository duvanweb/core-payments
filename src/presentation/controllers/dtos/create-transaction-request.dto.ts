import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Matches, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerDataDto {
  @ApiProperty({ example: 'cliente@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '+57' })
  @IsString()
  @Matches(/^\+\d{1,4}$/)
  phoneNumberPrefix: string;

  @ApiProperty({ required: false, example: '123456789' })
  @IsOptional()
  @IsString()
  legalId?: string;

  @ApiProperty({ required: false, enum: ['CC', 'CE', 'NIT', 'PP', 'TI', 'DNI', 'RG', 'OTHER'] })
  @IsOptional()
  @IsString()
  legalIdType?: string;
}

export class ShippingAddressDto {
  @ApiProperty({ example: 'Calle 123 #45-67' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ required: false, example: 'Apto 101' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'CO' })
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  country: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ required: false, example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: '110111' })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CreateTransactionRequestDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Product price from the frontend, validated against DB', example: 95.0 })
  @IsNumber()
  productPrice: number;

  @ApiProperty({ type: CustomerDataDto })
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customer: CustomerDataDto;

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
