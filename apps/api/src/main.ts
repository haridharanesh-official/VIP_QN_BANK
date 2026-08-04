import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser = require("cookie-parser");
import helmet from "helmet";
import { json } from "express";
import { ApiExceptionFilter } from "./common/http-exception.filter";
import { requestIdMiddleware } from "./common/request-id.middleware";
import { readEnvironment } from "./config/environment";

async function bootstrap(): Promise<void> {
  const environment = readEnvironment();
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(helmet());
  app.use(json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix("api/v1");
  app.enableCors({ origin: environment.FRONTEND_URL, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE"] });
  await app.listen(environment.PORT, "0.0.0.0");
}

void bootstrap();
