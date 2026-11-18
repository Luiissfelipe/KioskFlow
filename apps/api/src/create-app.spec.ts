import type { Server } from 'node:http';
import request from 'supertest';
import { APP_ENV } from './config/app-env.token.js';
import type { AppEnv } from './config/env.schema.js';
import { EnvValidationError } from './config/parse-env.js';
import { createApp } from './create-app.js';

const VALID_DATABASE_URL = 'postgresql://user:pass@localhost:5432/kioskflow';

describe('createApp', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exposes the validated environment to the application', async () => {
    vi.stubEnv('DATABASE_URL', VALID_DATABASE_URL);
    vi.stubEnv('PORT', '4010');

    const app = await createApp();
    const env = app.get<AppEnv>(APP_ENV);
    await app.close();

    expect(env.PORT).toBe(4010);
  });

  it('serves the swagger page at /api/docs', async () => {
    vi.stubEnv('DATABASE_URL', VALID_DATABASE_URL);
    const app = await createApp();
    await app.init();

    const response = await request(app.getHttpServer() as Server).get('/api/docs');
    await app.close();

    expect(response.status).toBe(200);
  });

  it('documents the health response from its zod schema', async () => {
    vi.stubEnv('DATABASE_URL', VALID_DATABASE_URL);
    const app = await createApp();
    await app.init();

    const response = await request(app.getHttpServer() as Server).get('/api/docs-json');
    await app.close();

    expect(response.body).toHaveProperty(['paths', '/health', 'get', 'responses', '200']);
  });

  it('refuses to create the application when the environment is invalid', async () => {
    vi.stubEnv('DATABASE_URL', 'invalid');

    const creation = createApp();

    await expect(creation).rejects.toThrow(EnvValidationError);
  });
});
