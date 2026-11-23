import { defineConfig, mergeConfig } from 'vitest/config';
import unitConfig from './vitest.config.mjs';

export default mergeConfig(unitConfig, defineConfig({ test: { projects: ['apps/api/vitest.db.config.mjs'] } }));
