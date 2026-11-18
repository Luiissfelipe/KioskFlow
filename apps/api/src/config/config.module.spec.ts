import { Test } from '@nestjs/testing';
import { ConfigModule } from './config.module.js';
import { EnvValidationError } from './parse-env.js';

describe('ConfigModule', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('refuses to start when the environment is invalid', async () => {
    vi.stubEnv('DATABASE_URL', 'invalid');

    const compile = Test.createTestingModule({ imports: [ConfigModule] }).compile();

    await expect(compile).rejects.toThrow(EnvValidationError);
  });
});
