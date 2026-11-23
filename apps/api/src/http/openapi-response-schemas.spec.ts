import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject, OperationObject, PathItemObject } from '@nestjs/swagger';
import type { Server } from 'node:http';
import request from 'supertest';
import { createApp } from '../create-app.js';

const OPENAPI_DOCUMENT_PATH = '/api/docs-json';
const SUCCESS_STATUS = /^2\d\d$/;
const JSON_MEDIA_TYPE = 'application/json';
const STANDARD_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace', 'query'] as const;

function listOperations(pathItem: PathItemObject): [string, OperationObject][] {
  const standard = STANDARD_METHODS.flatMap((method): [string, OperationObject][] => {
    const operation = pathItem[method];
    return operation ? [[method, operation]] : [];
  });
  return [...standard, ...Object.entries(pathItem.additionalOperations ?? {})];
}

function hasJsonResponseSchema(operation: OperationObject): boolean {
  return Object.entries(operation.responses).some(
    ([status, response]) =>
      SUCCESS_STATUS.test(status) &&
      response !== undefined &&
      'description' in response &&
      response.content?.[JSON_MEDIA_TYPE]?.schema !== undefined,
  );
}

function listOperationsWithoutJsonResponseSchema(document: OpenAPIObject): string[] {
  return Object.entries(document.paths).flatMap(([path, pathItem]) =>
    listOperations(pathItem)
      .filter(([, operation]) => !hasJsonResponseSchema(operation))
      .map(([method]) => `${method.toUpperCase()} ${path}`),
  );
}

describe('OpenAPI document of the application', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/kioskflow');
    app = await createApp();
    app.useLogger(false);
    await app.init();
    const response = await request(app.getHttpServer() as Server).get(OPENAPI_DOCUMENT_PATH);
    document = response.body as OpenAPIObject;
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  it('includes the health route in the document', () => {
    expect(document.paths).toHaveProperty(['/health', 'get']);
  });

  it('documents a json response schema for every operation', () => {
    expect(listOperationsWithoutJsonResponseSchema(document)).toEqual([]);
  });
});
