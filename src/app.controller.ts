import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('message')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('send')
  async send() {
    await this.appService.send();
  }
}
