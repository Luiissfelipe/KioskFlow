import { Body, Controller, Get, Post, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { z } from 'zod';
import { AppModule } from '../app.module.js';
import { ResponseSchema } from './response-schema.decorator.js';

const publicProfileSchema = z.object({ name: z.string() });
const createProfileSchema = z.object({ name: z.string().min(2) });

@Controller('contract-probe')
class ContractProbeController {
  @Get()
  @ResponseSchema({ status: 200, schema: publicProfileSchema })
  read() {
    return { name: 'Ana', passwordHash: 'not-for-clients' };
  }

  @Post()
  create(@Body({ schema: createProfileSchema }) body: z.infer<typeof createProfileSchema>) {
    return body;
  }
}

describe('ResponseSchema with the global schema pipe and serializer', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/kioskflow');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ContractProbeController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useLogger(false);
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  it('removes fields that the response schema does not declare', async () => {
    const response = await request(server).get('/contract-probe');

    expect(response.body).toEqual({ name: 'Ana' });
  });

  it('rejects a body that fails its schema with 400', async () => {
    const response = await request(server).post('/contract-probe').send({ name: 'A' });

    expect(response.status).toBe(400);
  });

  it('documents the response schema in the openapi document', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build());

    const responseBody = document.paths['/contract-probe']?.get?.responses['200'];
    expect(responseBody).toMatchObject({
      content: { 'application/json': { schema: { properties: { name: { type: 'string' } } } } },
    });
  });
});
