import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { RuntimeServicesService, type RedisHealth } from "./runtime-services.service";

interface HealthResult { readonly status: "ok"; readonly service: "vip-maths-api"; readonly services: { readonly database: "healthy"; readonly redis: RedisHealth } }

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly runtime: RuntimeServicesService) {}
  @Get()
  async health(): Promise<HealthResult> {
    try { await this.prisma.$queryRaw`SELECT 1`; }
    catch { throw new ServiceUnavailableException({ status: "error", services: { database: "unavailable", redis: this.runtime.redisStatus() } }); }
    return { status: "ok", service: "vip-maths-api", services: { database: "healthy", redis: this.runtime.redisStatus() } };
  }
}
