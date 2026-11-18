import { Logger, type INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createApp } from '../create-app.js';

const DATABASE_PASSWORD = 'password-that-must-not-be-logged';
const UNREACHABLE_DATABASE_URL = `postgresql://kioskflow:${DATABASE_PASSWORD}@localhost:1/kioskflow`;

describe('GET /health', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.stubEnv('DATABASE_URL', UNREACHABLE_DATABASE_URL);
    app = await createApp();
    app.useLogger(false);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('answers 503 with a stable error code when the database cannot be reached', async () => {
    const response = await request(app.getHttpServer() as Server).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ code: 'DATABASE_UNAVAILABLE' });
  });

  it('logs why the database failed without the connection password', async () => {
    const logError = vi.spyOn(Logger.prototype, 'error');

    await request(app.getHttpServer() as Server).get('/health');

    expect(logError).toHaveBeenCalledWith(expect.stringContaining('ECONNREFUSED'));
    expect(logError).not.toHaveBeenCalledWith(expect.stringContaining(DATABASE_PASSWORD));
  });
});
