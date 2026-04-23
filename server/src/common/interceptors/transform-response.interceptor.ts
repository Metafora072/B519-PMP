import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AUTH_SKIP_SERIALIZE } from "../constants/auth.constants";

function serializeBigInt(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item));
  }

  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, serializeBigInt(nestedValue)]),
  );
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipSerialize = this.reflector.getAllAndOverride<boolean>(AUTH_SKIP_SERIALIZE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipSerialize) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: serializeBigInt(data),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
