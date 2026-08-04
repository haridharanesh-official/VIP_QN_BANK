import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { connect } from "node:net";
import { readEnvironment } from "./config/environment";

export type RedisHealth = "healthy" | "optional-unavailable";

@Injectable()
export class RuntimeServicesService implements OnModuleInit {
  private readonly logger = new Logger(RuntimeServicesService.name);
  private redisHealth: RedisHealth = "optional-unavailable";

  async onModuleInit(): Promise<void> {
    const environment = readEnvironment();
    try {
      await this.probeRedis(environment.REDIS_URL);
      this.redisHealth = "healthy";
    } catch {
      if (environment.REDIS_REQUIRED === "true") throw new Error("Redis is required but unavailable.");
      this.logger.warn("Redis unavailable; continuing because REDIS_REQUIRED=false.");
    }
  }

  redisStatus(): RedisHealth { return this.redisHealth; }

  private probeRedis(value: string): Promise<void> {
    const url = new URL(value);
    return new Promise((resolvePromise, reject) => {
      const socket = connect({ host: url.hostname, port: Number(url.port || 6379) });
      const timer = setTimeout(() => socket.destroy(new Error("Redis connection timed out.")), 1000);
      socket.once("connect", () => { clearTimeout(timer); socket.end(); resolvePromise(); });
      socket.once("error", (error) => { clearTimeout(timer); reject(error); });
    });
  }
}
