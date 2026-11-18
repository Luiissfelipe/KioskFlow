import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { HealthResponse } from './health.schema.js';

function describeDatabaseFailure(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `${error.name} ${error.code}: ${error.message.trim()}`;
  }
  return error instanceof Error ? `${error.name}: ${error.message.trim()}` : 'Database check failed';
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error: unknown) {
      this.logger.error(describeDatabaseFailure(error));
      throw new ServiceUnavailableException({ code: 'DATABASE_UNAVAILABLE' });
    }
    return { status: 'ok', database: 'up' };
  }
}
