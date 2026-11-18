import { Global, Module } from '@nestjs/common';
import { APP_ENV } from './app-env.token.js';
import { parseEnv } from './parse-env.js';

@Global()
@Module({
  providers: [{ provide: APP_ENV, useFactory: () => parseEnv(process.env) }],
  exports: [APP_ENV],
})
export class ConfigModule {}
