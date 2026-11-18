import { APP_ENV } from './config/app-env.token.js';
import type { AppEnv } from './config/env.schema.js';
import { createApp } from './create-app.js';

const app = await createApp();
await app.listen(app.get<AppEnv>(APP_ENV).PORT);
