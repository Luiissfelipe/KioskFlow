import { z } from 'zod';

const serverEnvSchema = z.object({
  API_URL: z.url({ protocol: /^https?$/ }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(environment: Readonly<Record<string, string | undefined>>): ServerEnv {
  return serverEnvSchema.parse(environment);
}
