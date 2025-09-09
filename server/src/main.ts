import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as morgan from 'morgan';
import { randomUUID } from 'node:crypto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('HTTP');

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );

  app.use((req: any, res: any, next: any) => {
    req.reqId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', req.reqId);
    next();
  });

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
  }

  app.use((req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
      const elapsed = Date.now() - start;
      const payload = {
        ts: new Date().toISOString(),
        reqId: req.reqId,
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        duration_ms: elapsed,
      };
      const level = res.statusCode >= 500 ? 'error' : 'log';
      (logger as any)[level](JSON.stringify(payload));
    });
    next();
  });

  const port = Number(process.env.PORT ?? 8080);
  const host = '0.0.0.0';
  await app.listen(port, host);
  new Logger('Bootstrap').log(
    `Started on http://${host}:${port} (${process.env.NODE_ENV || 'dev'})`,
  );
}
bootstrap();
