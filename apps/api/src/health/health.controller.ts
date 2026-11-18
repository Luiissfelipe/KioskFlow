import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { ResponseSchema } from '../http/response-schema.decorator.js';
import { healthResponseSchema } from './health.schema.js';
import { HealthService } from './health.service.js';

@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verifica se a API e o banco de dados estão disponíveis' })
  @ResponseSchema({ status: 200, schema: healthResponseSchema })
  @ApiServiceUnavailableResponse({ description: 'O banco de dados não respondeu' })
  check() {
    return this.healthService.check();
  }
}
