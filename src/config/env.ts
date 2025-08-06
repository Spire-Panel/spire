"server only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .optional()
    .default("mongodb://localhost:27017/spire"),
  JWT_SECRET: z.string().optional().default("secret"),
  JWT_EXPIRES_IN: z.string().optional().default("7d"),
});

try {
  envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", error.message);
  }
}

// Export validated environment variables
export const env = envSchema.parse(process.env);

// Export a type for the environment variables
export type Env = z.infer<typeof envSchema>;
