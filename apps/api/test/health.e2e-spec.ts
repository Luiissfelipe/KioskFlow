import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createApp } from '../src/create-app.js';

describe('GET /health with a real postgres', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
    app.useLogger(false);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers ok when the database responds', async () => {
    const response = await request(app.getHttpServer() as Server).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });
});
