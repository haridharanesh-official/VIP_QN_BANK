import { Controller, Get, HttpStatus, Param, Query, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { z } from "zod";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution } from "../auth/auth.decorators";
import { PdfExporterService } from "./pdf-exporter.service";
import { DocxExporterService } from "./docx-exporter.service";

const uuid = z.string().uuid();
const viewSchema = z.enum(["QUESTION_PAPER", "ANSWER_KEY", "QUESTIONS_WITH_ANSWERS"]).default("QUESTION_PAPER");
const setSchema = z.enum(["A", "B", "C"]).default("A");

@Controller("papers/:id/export")
@UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class ExportsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfExporter: PdfExporterService,
    private readonly docxExporter: DocxExporterService
  ) {}

  @Get("pdf")
  async exportPdf(
    @CurrentInstitution() institutionId: string,
    @Param("id") id: string,
    @Query("view") rawView: string,
    @Query("set") rawSet: string,
    @Res() res: Response
  ): Promise<void> {
    const paperId = parseInput(uuid, id);
    const view = parseInput(viewSchema, rawView);
    const set = parseInput(setSchema, rawSet);

    const paper = await this.prisma.questionPaper.findFirst({
      where: { id: paperId, institutionId, deletedAt: null },
      include: { snapshots: { orderBy: { snapshotVersion: "desc" }, take: 1 } },
    });

    if (!paper || !paper.snapshots[0]) {
      throw new AppError("PAPER_NOT_FOUND", "Paper snapshot not found.", HttpStatus.NOT_FOUND);
    }

    const htmlContent = this.pdfExporter.generatePdfHtml(
      paper.title,
      paper.snapshots[0].paperData,
      view,
      `Set ${set}`
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${paper.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Set${set}.html"`
    );
    res.send(htmlContent);
  }

  @Get("docx")
  async exportDocx(
    @CurrentInstitution() institutionId: string,
    @Param("id") id: string,
    @Query("view") rawView: string,
    @Query("set") rawSet: string,
    @Res() res: Response
  ): Promise<void> {
    const paperId = parseInput(uuid, id);
    const view = parseInput(viewSchema, rawView);
    const set = parseInput(setSchema, rawSet);

    const paper = await this.prisma.questionPaper.findFirst({
      where: { id: paperId, institutionId, deletedAt: null },
      include: { snapshots: { orderBy: { snapshotVersion: "desc" }, take: 1 } },
    });

    if (!paper || !paper.snapshots[0]) {
      throw new AppError("PAPER_NOT_FOUND", "Paper snapshot not found.", HttpStatus.NOT_FOUND);
    }

    const textContent = this.docxExporter.generateDocxContent(
      paper.title,
      paper.snapshots[0].paperData,
      view,
      `Set ${set}`
    );

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${paper.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Set${set}.txt"`
    );
    res.send(textContent);
  }
}
