import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { UnitOfWorkPort } from '../../application/ports/unit-of-work.port';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly prisma: PrismaService) {}

  transaction<T>(callback: (tx: any) => Promise<T>) {
    return this.prisma.$transaction(callback);
  }
}
