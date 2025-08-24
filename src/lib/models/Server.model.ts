import mongoose, { Document } from "mongoose";
import { z } from "zod";

export const ServerValidator = z.object({
  name: z.string(),
  version: z.string(),
  type: z.string(),
  port: z.number(),
  memory: z.string(),
  modpackId: z.string().or(z.number()).optional(),
  _id: z.string(),
});

export type IServer = z.infer<typeof ServerValidator> & Document;

const ServerSchema = new mongoose.Schema<IServer>(
  {
    name: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    memory: {
      type: String,
      required: true,
    },
    modpackId: {
      type: String,
      required: false,
    },
    _id: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    timestamps: true,
    versionKey: false,
  }
);

const Server =
  (mongoose.models?.Server as mongoose.Model<IServer>) ||
  (mongoose.model("Server", ServerSchema) as mongoose.Model<IServer>);

export default Server;
