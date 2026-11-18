import { envSchema, type AppEnv } from './env.schema.js';

export class EnvValidationError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid environment: ${problems.join('; ')}`);
    this.name = 'EnvValidationError';
  }
}

export function parseEnv(source: Readonly<Record<string, string | undefined>>): AppEnv {
  const result = envSchema.safeParse(source);
  if (result.success) {
    return result.data;
  }
  throw new EnvValidationError(result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`));
}
