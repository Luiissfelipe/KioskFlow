import { describe, expect, it } from 'vitest';
import { parseServerEnv } from './server-env';

describe('parseServerEnv', () => {
  it('returns the api url when it is an http url', () => {
    const environment = { API_URL: 'http://localhost:3001' };

    const serverEnv = parseServerEnv(environment);

    expect(serverEnv).toEqual({ API_URL: 'http://localhost:3001' });
  });

  it('rejects a missing api url', () => {
    const environment = {};

    expect(() => parseServerEnv(environment)).toThrow(/API_URL/);
  });

  it('rejects an api url that is not http or https', () => {
    const environment = { API_URL: 'ftp://localhost:3001' };

    expect(() => parseServerEnv(environment)).toThrow(/API_URL/);
  });
});
