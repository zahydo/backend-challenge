import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import { TrackingService } from './tracking.service';
import { ReportService } from './report.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [UserService, PrismaService, TrackingService, ReportService],
})
export class AppModule {}
