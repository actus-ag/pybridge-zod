import {
  ZodTypeAny,
  ZodTypeDef,
  ZodType,
  ParseInput,
  ParseReturnType,
  OK,
  RawCreateParams,
  ParseContext,
  z,
  ZodErrorMap,
} from "zod";

export interface ZodAsyncIterableDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  type: T;
  typeName: "ZodAsyncIterable";
}

export type ProcessedCreateParams = {
  errorMap?: ZodErrorMap;
  description?: string;
};
function processCreateParams(params: RawCreateParams): ProcessedCreateParams {
  if (!params) return {};
  const { errorMap, invalid_type_error, required_error, description } = params;
  if (errorMap && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  }
  if (errorMap) return { errorMap: errorMap, description };
  const customMap: ZodErrorMap = (iss, ctx) => {
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined") {
      return { message: required_error ?? ctx.defaultError };
    }
    return { message: invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

export class ZodAsyncIterable<T extends ZodTypeAny> extends ZodType<
  AsyncIterable<T["_output"]>,
  ZodAsyncIterableDef<T>,
  AsyncIterable<T["_input"]>
> {
  unwrap() {
    return this._def.type;
  }

  _parse(input: ParseInput): ParseReturnType<this["_output"]> {
    const { ctx } = this._processInputParams(input);
    const asyncIterable = (async function* () {
      yield ctx.data;
    })();
    return OK(asyncIterableFunction(asyncIterable, ctx, this._def.type));
  }

  static create = <T extends ZodTypeAny>(
    schema: T,
    params?: RawCreateParams
  ): ZodAsyncIterable<T> => {
    return new ZodAsyncIterable({
      type: schema,
      typeName: "ZodAsyncIterable",
      ...processCreateParams(params),
    });
  };
}

async function* asyncIterableFunction<T extends ZodTypeAny>(
  iterable: AsyncIterable<any>,
  ctx: ParseContext,
  type: T
) {
  for await (const item of iterable) {
    yield type.parseAsync(item, {
      path: ctx.path,
      errorMap: ctx.common.contextualErrorMap,
    });
  }
}

// const x = ZodAsyncIterable.create(z.string());
// const y = x.parse("");

// const fn = z.function(
//   z.tuple([z.string()]),
//   ZodAsyncIterable.create(z.string())
// );

// fn.returnType().parse("x");
