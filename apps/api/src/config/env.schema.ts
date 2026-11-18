import { z } from 'zod';

const MAX_PORT = 65535;
const DEFAULT_PORT = 3001;

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(MAX_PORT).default(DEFAULT_PORT),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export type AppEnv = z.infer<typeof envSchema>;
