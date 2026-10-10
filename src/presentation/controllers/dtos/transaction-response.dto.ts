import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionResponseDto {
  @ApiProperty() transactionId: string;
  @ApiProperty() reference: string;
  @ApiProperty() checkoutUrl: string;
}

export class TransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() status: string;
  @ApiProperty() reference: string;
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() totalAmountInCents: number;
  @ApiProperty() currency: string;
  @ApiProperty({ nullable: true }) wompiTransactionId: string | null;
  @ApiProperty({ nullable: true }) customerId: string | null;
  @ApiProperty() createdAt: Date;
}
