import { Body, Controller, Get, Inject, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  GetDeliveryUseCasePort,
  GetDeliveryInput,
  GET_DELIVERY_USE_CASE,
} from '@application/ports/use-cases/get-delivery.use-case.port';
import {
  UpdateDeliveryStatusUseCasePort,
  UpdateDeliveryStatusInput,
  UPDATE_DELIVERY_STATUS_USE_CASE,
} from '@application/ports/use-cases/update-delivery-status.use-case.port';
import { Delivery } from '@application/domain/delivery/delivery';
import { resultToHttp } from '@presentation/controllers/result-to-http';
import { DeliveryResponseDto } from '@presentation/controllers/dtos/delivery-response.dto';
import { UpdateDeliveryStatusDto } from '@presentation/controllers/dtos/update-delivery-status.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(
    @Inject(GET_DELIVERY_USE_CASE)
    private readonly getDeliveryUseCase: GetDeliveryUseCasePort,
    @Inject(UPDATE_DELIVERY_STATUS_USE_CASE)
    private readonly updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCasePort,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by id' })
  @ApiResponse({ status: 200, description: 'Delivery found', type: DeliveryResponseDto })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async getById(@Param('id') id: string): Promise<DeliveryResponseDto> {
    return this.getDeliveryUseCase.execute({ id }).match(
      (delivery) => toResponseDto(delivery),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get delivery by transaction id' })
  @ApiResponse({ status: 200, description: 'Delivery found', type: DeliveryResponseDto })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async getByTransactionId(@Query('transactionId') transactionId: string): Promise<DeliveryResponseDto> {
    const input: GetDeliveryInput = { transactionId };
    return this.getDeliveryUseCase.execute(input).match(
      (delivery) => toResponseDto(delivery),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update delivery status' })
  @ApiResponse({ status: 200, description: 'Status updated', type: DeliveryResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ): Promise<DeliveryResponseDto> {
    const input: UpdateDeliveryStatusInput = {
      id,
      status: dto.status,
      carrier: dto.carrier,
      trackingNumber: dto.trackingNumber,
    };
    return this.updateDeliveryStatusUseCase.execute(input).match(
      (delivery) => toResponseDto(delivery),
      (error) => {
        throw resultToHttp(error);
      },
    );
  }
}

function toResponseDto(delivery: Delivery): DeliveryResponseDto {
  return {
    id: delivery.id,
    transactionId: delivery.transactionId,
    status: delivery.status.value,
    carrier: delivery.carrier,
    trackingNumber: delivery.trackingNumber,
    createdAt: new Date(),
  };
}
