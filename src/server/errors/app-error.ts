export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

import { ZodError } from "zod";

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 }
    );
  }
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
