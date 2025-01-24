import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { UserSearchParams } from './types';
import { UserService } from './user.service';

class UserDTO {
  id?: number;
  name: string;
  email: string;
  role: Role;
}

@Controller('/users')
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for name or email',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
    default: 0,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take',
    default: 10,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to order by',
    default: 'name',
  })
  async searchUsers(
    @Query('search') search?: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @Query('orderBy') orderBy: string = 'name',
  ): Promise<User[]> {
    const params: UserSearchParams = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      orderBy: orderBy ? { [orderBy]: 'asc' } : undefined,
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
    };
    return this.userService.users(params);
  }

  @Post('/')
  @ApiBody({
    description: 'User creation data',
    type: UserDTO,
  })
  async createUser(@Body() data: UserDTO): Promise<User> {
    return this.userService.createUser(data);
  }

  @Get('/:id')
  @ApiQuery({
    name: 'id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  async getUser(@Param('id') id: string): Promise<User> {
    return this.userService.user({ id: Number(id) });
  }

  @Put('/:id')
  @ApiQuery({
    name: 'id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiBody({
    description: 'User update data',
    type: UserDTO,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() data: { name: string; email: string; role: Role },
  ): Promise<User> {
    return this.userService.updateUser({ where: { id: Number(id) }, data });
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id: Number(id) });
  }
}
