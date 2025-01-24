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
import { Activity, ActivityType, Role, User } from '@prisma/client';
import { ActivityDTO, UserDTO, UserSearchParams } from '../utils/types';
import { UserService } from '../services/user.service';
import { TrackingService } from '../services/tracking.service';
import { ReportService } from '../services/report.service';

@Controller('/users')
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly trackingService: TrackingService,
    private readonly reportService: ReportService,
  ) {}

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
    @Query('take') take: number = 10000,
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

  @Post('/:id/activity')
  @ApiQuery({
    name: 'id',
    required: true,
    type: Number,
    description: 'User ID',
  })
  @ApiBody({
    description: 'Activity data',
    type: Object,
  })
  async trackActivity(
    @Param('id') id: string,
    @Body() data: ActivityDTO,
  ): Promise<Activity> {
    return this.trackingService.trackActivity({
      type: data.type as ActivityType,
      details: data.details,
      title: data.title,
      timestamp: new Date(),
      user: { connect: { id: Number(id) } },
    });
  }

  @Get('/:id/report')
  async createReport(
    @Param('id') id: string,
  ): Promise<{ message: string; url: string }> {
    const user = await this.userService.user({ id: Number(id) });
    const pdfUrl = await this.reportService.generatePdfAndReturnUrl(user);
    await this.trackingService.trackActivity({
      type: 'PDF_DOWNLOAD',
      title: 'Report generated',
      details: `User report generated for ${user.name}`,
      timestamp: new Date(),
      user: { connect: { id: Number(id) } },
    });
    await this.trackingService.trackReport({
      title: 'User report',
      url: pdfUrl,
      user: { connect: { id: Number(id) } },
    });
    return { message: 'Report generated successfully', url: pdfUrl };
  }
}
