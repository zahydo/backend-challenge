import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Activity, PDFReport, Prisma } from '@prisma/client';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async trackActivity(data: Prisma.ActivityCreateInput): Promise<Activity> {
    return this.prisma.activity.create({
      data: data,
    });
  }

  async trackReport(data: Prisma.PDFReportCreateInput): Promise<PDFReport> {
    return this.prisma.pDFReport.create({
      data: data,
    });
  }
}
