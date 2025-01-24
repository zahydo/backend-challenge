import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '../services/user.service';
import { PrismaService } from '../services/prisma.service';
import { TrackingService } from '../services/tracking.service';
import { ReportService } from '../services/report.service';
import { RootController } from '../controllers/root.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, RootController],
  providers: [UserService, PrismaService, TrackingService, ReportService],
})
export class AppModule {}
