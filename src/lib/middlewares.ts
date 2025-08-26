/**
 * Custom error handler created by Ethan Burkett.
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "./db";
import { HttpError } from "./api-utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ClerkClient } from "@clerk/backend";
import { Permissions } from "./Roles";

export const withErrorHandler = <
  TParams extends Record<string, unknown> = Record<string, unknown>
>(
  handler: ApiHandler<TParams>,
  permissions: (context: { params: TParams }) => {
    behaviour: Permissions.Behaviour;
    permissions: Permissions.AllPermissions[];
  }
) => {
  return async (
    request: NextRequest,
    context: ApiHandlerContext<TParams> & {
      clerk: ClerkClient;
    }
  ) => {
    const params = await context.params;
    try {
      const au = await auth();
      if (!au.userId) throw new HttpError(401, "Unauthorized");
      const clerk = await clerkClient();
      const users = clerk.users;
      const user = await users.getUser(au.userId);
      if (!user) throw new HttpError(401, "Unauthorized");
      const metadata = user.publicMetadata;
      if (!metadata.role) {
        await users.updateUserMetadata(au.userId, {
          publicMetadata: {
            role: "user",
          },
        });
      }

      const perms = permissions({
        params,
      });
      const roleValid = await isUserAllowed(
        au.userId,
        metadata.role || "user",
        perms.permissions,
        perms.behaviour
      );
      if (!roleValid)
        throw new HttpError(
          401,
          `Unauthorized. You do not have the required permissions to access this resource.`
        );

      const response = await handler(request, {
        ...context,
        params,
        clerk,
        auth,
        userId: au.userId,
      });

      // Only process successful responses (2xx status codes)
      if (response.status >= 200 && response.status < 300) {
        try {
          const data = await response.clone().json();
          // catch me all for redundant keys in responses
          if (!!data.data && !!data.meta) {
            return NextResponse.json(
              { data: data.data, meta: data.meta, success: true },
              { status: response.status, headers: response.headers }
            );
          }
          return NextResponse.json(
            { data, success: true },
            { status: response.status, headers: response.headers }
          );
        } catch (e) {
          // If response is not JSON, return as is
          return response;
        }
      }
      return response;
    } catch (error) {
      console.error("Error in withErrorHandler middleware:", error);
      if (error instanceof HttpError) {
        return error.toResponse();
      }

      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
        { status: 500 }
      );
    }
  };
};

export const AvailableModels = [
  "Node",
  "SpireSettings",
  "Role",
  "Server",
] as const;
export type AvailableModels = (typeof AvailableModels)[number];

type ModelDictionary = {
  [K in AvailableModels]: mongoose.Model<any>;
};

interface ApiHandlerContext<
  TParams extends Record<string, unknown> = Record<string, unknown>
> {
  params: TParams;
  clerk: ClerkClient;
  auth: typeof auth;
  userId: string;
}

type ApiHandler<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = (
  request: NextRequest,
  context: ApiHandlerContext<TParams>
) => Promise<Response>;

type ApiHandlerWithModels<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = (
  request: NextRequest,
  context: ApiHandlerContext<TParams> & { models: ModelDictionary },
  permissions?: string[]
) => Promise<Response> | Promise<NextResponse> | NextResponse | Response;

/**
 * Middleware that injects models into the API route handler
 * @param handler The API route handler function
 * @returns Next.js 13+ App Router API route handler with models injected
 */
// Import models to ensure they're registered with Mongoose
import Node from "./models/Node.model";
import SpireSettings from "./models/SpireSettings.model";
import Role from "./models/Role.model";
import Server from "./models/Server.model";
import { isUserAllowed } from "@/actions/roles.actions";

export const withModel = <
  TParams extends Record<string, unknown> = Record<string, unknown>
>(
  handler: ApiHandlerWithModels<TParams>
): ApiHandler<TParams> => {
  return async (request: NextRequest, context: ApiHandlerContext<TParams>) => {
    await dbConnect();

    const models: ModelDictionary = {
      Node,
      SpireSettings,
      Role,
      Server,
    };

    return handler(request, {
      ...context,
      models,
    });
  };
};

/**
 * Composes multiple middlewares into a single middleware
 * @param handler The handler function to wrap
 * @param middlewares Array of middleware functions to apply
 * @returns A single middleware function that applies all middlewares
 */
type Middleware<
  TParams extends Record<string, unknown> = Record<string, unknown>
> = (handler: ApiHandler<TParams>) => ApiHandler<TParams>;

export const applyMiddlewares = <
  TParams extends Record<string, unknown> = Record<string, unknown>
>(
  handler: ApiHandlerWithModels<TParams>,
  ...middlewares: Middleware<TParams>[]
): ApiHandler<TParams> => {
  return middlewares.reduceRight<ApiHandler<TParams>>(
    (acc, middleware) => middleware(acc),
    handler as unknown as ApiHandler<TParams>
  );
};

/**
 * Combined middleware that applies both error handling and model injection
 * @param handler The API route handler function with models
 * @returns Next.js 13+ App Router API route handler with error handling and models injected
 */
const wrapWithErrorHandler = <TParams extends Record<string, unknown>>(
  permissions: (context: { params: Record<string, unknown> }) => {
    behaviour: Permissions.Behaviour;
    permissions: Permissions.AllPermissions[];
  },
  handler: ApiHandler<TParams>
): ApiHandler<TParams> => {
  return withErrorHandler(
    handler as ApiHandler<Record<string, unknown>>,
    permissions
  ) as ApiHandler<TParams>;
};

export const withMiddleware = <
  TParams extends Record<string, unknown> = Record<string, unknown>
>(
  permissions: (context: { params: Record<string, unknown> }) => {
    behaviour: Permissions.Behaviour;
    permissions: Permissions.AllPermissions[];
  },
  handler: ApiHandlerWithModels<TParams>
): ApiHandler<TParams> => {
  const withModelMiddleware = withModel<TParams>(handler);

  return wrapWithErrorHandler(permissions, withModelMiddleware);
};
