import { EnvValidationError, parseEnv } from './parse-env.js';

const VALID_DATABASE_URL = 'postgresql://user:pass@localhost:5432/kioskflow';

describe('parseEnv', () => {
  it('applies defaults for NODE_ENV and PORT when only DATABASE_URL is given', () => {
    const env = parseEnv({ DATABASE_URL: VALID_DATABASE_URL });

    expect(env).toEqual({ NODE_ENV: 'development', PORT: 3001, DATABASE_URL: VALID_DATABASE_URL });
  });

  it('reads PORT as a number', () => {
    const env = parseEnv({ DATABASE_URL: VALID_DATABASE_URL, PORT: '4010' });

    expect(env.PORT).toBe(4010);
  });

  it('rejects a PORT outside the valid range', () => {
    const parse = () => parseEnv({ DATABASE_URL: VALID_DATABASE_URL, PORT: '70000' });

    expect(parse).toThrow(EnvValidationError);
  });

  it('rejects a DATABASE_URL that is not a postgres url', () => {
    const parse = () => parseEnv({ DATABASE_URL: 'mysql://user:pass@localhost:3306/kioskflow' });

    expect(parse).toThrow(EnvValidationError);
  });

  it('names the missing variable in the error', () => {
    const parse = () => parseEnv({});

    expect(parse).toThrow(/DATABASE_URL/);
  });

  it('does not leak the received value in the error message', () => {
    const parse = () => parseEnv({ DATABASE_URL: 'not-a-url-super-secret-value' });

    expect(parse).toThrow(EnvValidationError);
    expect(parse).not.toThrow(/super-secret-value/);
  });
});
