import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get('/')
  async root(): Promise<string> {
    return 'Hello World';
  }
}
