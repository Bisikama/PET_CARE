import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreateUserInput: { email: string; name: string }): Promise<any> {
    return await this.prisma.user.create({
      data: {
        email: CreateUserInput.email,
        name: CreateUserInput.name,
      },
    });
  }

  async findAll(): Promise<any> {
    return this.prisma.user.findMany();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
