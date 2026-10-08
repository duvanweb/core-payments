import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateTransactionUseCasePort,
  CreateTransactionInput,
  CREATE_TRANSACTION_USE_CASE,
} from '@application/ports/use-cases/create-transaction.use-case.port';
import {
  GetTransactionUseCasePort,
  GET_TRANSACTION_USE_CASE,
} from '@application/ports/use-cases/get-transaction.use-case.port';
import { Transaction } from '@application/domain/transaction/transaction';
import { resultToHttp } from '@presentation/controllers/result-to-http';
import { CreateTransactionRequestDto } from '@presentation/controllers/dtos/create-transaction-request.dto';
import {
  CreateTransactionResponseDto,
  TransactionResponseDto,
} from '@presentation/controllers/dtos/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    @Inject(CREATE_TRANSACTION_USE_CASE)
    private readonly createTransactionUseCase: CreateTransactionUseCasePort,
    @Inject(GET_TRANSACTION_USE_CASE)
    private readonly getTransactionUseCase: GetTransactionUseCasePort,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction (checkout)' })
  @ApiResponse({ status: 201, description: 'Transaction created', type: CreateTransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Price mismatch or insufficient stock' })
  async create(
    @Body() dto: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    const input: CreateTransactionInput = {
      productId: dto.productId,
      quantity: dto.quantity,
      productPrice: dto.productPrice,
      customer: {
        email: dto.customer.email,
        fullName: dto.customer.fullName,
        phoneNumber: dto.customer.phoneNumber,
        phoneNumberPrefix: dto.customer.phoneNumberPrefix,
        legalId: dto.customer.legalId,
        legalIdType: dto.customer.legalIdType,
      },
      shippingAddress: {
        addressLine1: dto.shippingAddress.addressLine1,
        addressLine2: dto.shippingAddress.addressLine2,
        country: dto.shippingAddress.country,
        city: dto.shippingAddress.city,
        phoneNumber: dto.shippingAddress.phoneNumber,
        region: dto.shippingAddress.region,
        name: dto.shippingAddress.name,
        postalCode: dto.shippingAddress.postalCode,
      },
    };

    return this.createTransactionUseCase.execute(input).match(
      (result) => result,
      (error) => {
        throw resultToHttp(error);
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiResponse({ status: 200, description: 'Transaction found', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getById(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.getTransactionUseCase.execute(id).match(
      (transaction) => toResponseDto(transaction),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }
}

function toResponseDto(transaction: Transaction): TransactionResponseDto {
  return {
    id: transaction.id,
    status: transaction.status.value,
    reference: transaction.reference.value,
    productId: transaction.productId,
    quantity: transaction.quantity.value,
    totalAmountInCents: transaction.totalAmountInCents.value,
    currency: transaction.currency,
    wompiTransactionId: transaction.wompiTransactionId,
    customerId: transaction.customerId,
    createdAt: new Date(),
  };
}
