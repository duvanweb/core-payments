import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('calls $connect on onModuleInit', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;
    const connect = jest.fn().mockResolvedValue(undefined);
    (service as any).$connect = connect;

    await service.onModuleInit();
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('calls $disconnect on onModuleDestroy', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;
    const disconnect = jest.fn().mockResolvedValue(undefined);
    (service as any).$disconnect = disconnect;

    await service.onModuleDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
