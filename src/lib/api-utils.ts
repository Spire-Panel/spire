import {
  NextResponse,
  type NextResponse as NextResponseType,
} from "next/server";
import { PaginationOptions } from "./db";
import { ZodError, ZodObject } from "zod";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "HttpError";
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  toResponse(): NextResponseType {
    return NextResponse.json(
      {
        success: false,
        error: this.message,
        ...(this.details && {
          details: !!this.details.details ? this.details.details : this.details,
        }),
      },
      { status: this.statusCode }
    );
  }
}

export const Errors = {
  NotFound: (message = "Resource not found", details?: Record<string, any>) =>
    new HttpError(404, message, details),
  BadRequest: (message = "Bad request", details?: Record<string, any>) =>
    new HttpError(400, message, details),
  Unauthorized: (message = "Unauthorized", details?: Record<string, any>) =>
    new HttpError(401, message, details),
  Forbidden: (message = "Forbidden", details?: Record<string, any>) =>
    new HttpError(403, message, details),
  Conflict: (message = "Conflict", details?: Record<string, any>) =>
    new HttpError(409, message, details),
  InternalServerError: (
    message = "Internal server error",
    details?: Record<string, any>
  ) => new HttpError(500, message, details),
  fromStatus: (
    status: number,
    message?: string,
    details?: Record<string, any>
  ) => new HttpError(status, message || "An error occurred", details),
};

export const Responses = {
  NotFound: (body?: Record<string, any>) =>
    NextResponse.json(body, { status: 404 }),
  BadRequest: (body?: Record<string, any>) =>
    NextResponse.json(body, { status: 400 }),
  Unauthorized: (body?: Record<string, any>) =>
    NextResponse.json(body, { status: 401 }),
  Forbidden: (body?: Record<string, any>) =>
    NextResponse.json(body, { status: 403 }),
  InternalServerError: (body?: Record<string, any>) =>
    NextResponse.json(body, { status: 500 }),
  Success: (body?: Record<string, any>) =>
    NextResponse.json(body || {}, { status: 200 }),
  Created: (body?: Record<string, any>) =>
    NextResponse.json(body || {}, { status: 201 }),
  Status: (status: number, body?: Record<string, any>) =>
    NextResponse.json(body || {}, { status }),
};

export async function paginate<TData = unknown>(
  data: TData[],
  options: PaginationOptions
) {
  const { page = 1, pageSize = 10, where } = options;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [total, items] = await Promise.all([
    data.length,
    data.slice(skip, skip + take),
  ]);

  return {
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export const Fetch = async <TData>(url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error("Failed to fetch data");

    const body = await res.json();

    if (!!body.success) return body as APIResponse<TData>;

    throw new Error(body.error);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export interface APIResponse<TData> {
  success: boolean;
  data: TData;
  error?: string;
}
