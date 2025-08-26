import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import mongoose from "mongoose";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { ZodObject, ZodError } from "zod";

export const ZodErrorFormatter = <T extends ZodObject<any>>(
  validator: T,
  error: ZodError
) => {
  const fieldErrors = error.flatten().fieldErrors;
  const availableFields = Object.entries(validator.shape)
    .map(([key, schema]) => {
      const schemaAny = schema as any;
      const isOptional =
        typeof schemaAny?.isOptional === "function" && schemaAny.isOptional();
      return `${key}${isOptional ? " (optional)" : " (required)"}`;
    })
    .join(", ");

  return {
    ...fieldErrors,
    availableFields,
  };
};

export const objectIdSchema = z.custom<mongoose.Types.ObjectId | string>(
  (val) => {
    if (typeof val !== "string") return false;
    return mongoose.Types.ObjectId.isValid(val);
  },
  {
    message: "Invalid ObjectId",
  }
);
