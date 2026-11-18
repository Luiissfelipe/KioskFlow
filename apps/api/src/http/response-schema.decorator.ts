import { applyDecorators, SerializeOptions } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import type { z } from 'zod';

type HandlerReturning<TValue> = (...args: never[]) => TValue | Promise<TValue>;

interface ResponseSchemaOptions<TSchema extends z.ZodType> {
  readonly status: number;
  readonly schema: TSchema;
}

export function ResponseSchema<TSchema extends z.ZodType>({ status, schema }: ResponseSchemaOptions<TSchema>) {
  const decorate = applyDecorators(SerializeOptions({ schema }), ApiResponse({ status, standardSchema: schema }));
  return <THandler extends HandlerReturning<z.input<TSchema>>>(
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<THandler>,
  ): void => {
    decorate(target, key, descriptor);
  };
}
