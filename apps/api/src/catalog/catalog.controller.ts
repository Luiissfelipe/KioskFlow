import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { catalogResponseSchema } from '@kioskflow/shared';
import { ResponseSchema } from '../http/response-schema.decorator.js';
import { CatalogService } from './catalog.service.js';

@ApiTags('Cardápio')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as categorias com os produtos e adicionais disponíveis, com preços em centavos' })
  @ResponseSchema({ status: 200, schema: catalogResponseSchema })
  list() {
    return this.catalogService.listAvailable();
  }
}
