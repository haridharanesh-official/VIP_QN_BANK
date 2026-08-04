import { Injectable } from "@nestjs/common";
import { Prisma, type AuditLog } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface AuditInput { institutionId?: string; actorUserId?: string; action: string; entityType: string; entityId: string; requestId?: string; ipAddress?: string; userAgent?: string; beforeData?: Prisma.InputJsonValue; afterData?: Prisma.InputJsonValue; metadata?: Prisma.InputJsonValue }
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  create(data: AuditInput, client: Prisma.TransactionClient = this.prisma): Promise<AuditLog> { return client.auditLog.create({ data }); }
}
