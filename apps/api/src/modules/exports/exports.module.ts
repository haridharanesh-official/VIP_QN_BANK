import { Module } from "@nestjs/common";
import { ExportsController } from "./exports.controller";
import { PdfExporterService } from "./pdf-exporter.service";
import { DocxExporterService } from "./docx-exporter.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExportsController],
  providers: [PdfExporterService, DocxExporterService],
  exports: [PdfExporterService, DocxExporterService],
})
export class ExportsModule {}
