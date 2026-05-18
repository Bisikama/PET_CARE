import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async create(@Body() CreateUserInput: { email: string; name: string }): Promise<any> {
    return await this.appService.create(CreateUserInput);
  }

  @Get()
  async findAll(): Promise<any> {
    return await this.appService.findAll();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
