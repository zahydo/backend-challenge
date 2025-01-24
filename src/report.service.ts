import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as PDFDocument from 'pdfkit';

type UserReport = User & { activities?: { type: string; details?: string }[] };

@Injectable()
export class ReportService {
  async generatePdfAndReturnUrl(user: UserReport): Promise<string> {
    const pdfBuffer = await this.createPdf(user);

    // Convertir el Buffer del PDF a Base64
    const base64Pdf = pdfBuffer.toString('base64');

    // Crear una URL temporal en formato `data:application/pdf;base64,`
    const pdfUrl = `data:application/pdf;base64,${base64Pdf}`;

    return pdfUrl;
  }

  private async createPdf(user: UserReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // PDF content
      doc.fontSize(20).text(`User Report: ${user?.name}`, { align: 'center' });
      doc.fontSize(14).text(`Email: ${user?.email}`, { align: 'left' });
      doc.fontSize(14).text(`Role: ${user?.role}`, { align: 'left' });

      doc.moveDown();

      // Adding total login and pdf download activities
      const loginActivities = user?.activities?.filter(
        (activity) => activity.type === 'LOGIN',
      );
      const pdfDownloadActivities = user?.activities?.filter(
        (activity) => activity.type === 'PDF_DOWNLOAD',
      );
      doc.text(`Total Logins: ${loginActivities?.length || 0}`);
      doc.text(`Total PDF Downloads: ${pdfDownloadActivities?.length || 0}`);
      doc.moveDown();
      doc.text('Activities:');
      user?.activities?.forEach((activity, index) => {
        doc.text(
          `${index + 1}. ${activity.type} - ${activity.details || 'No details'}`,
        );
      });

      doc.end();
    });
  }
}
