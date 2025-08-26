import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { objectIdSchema } from "../utils";
import { INode } from "./Node.model";

export const ServerValidator = z.object({
  name: z.string(),
  version: z.string(),
  type: z.string(),
  port: z.number(),
  memory: z.string(),
  modpackId: z.string().or(z.number()).optional(),
  _id: z.string(),
  node: objectIdSchema,
  userIds: z.array(z.string()),
});

export const CreateServerValidator = ServerValidator.omit({
  _id: true,
  node: true,
  userIds: true,
});

export type IServer = {
  node: INode;
  userIds: string[];
  name: string;
  version: string;
  type: string;
  port: number;
  memory: string;
  modpackId: string | number;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
} & Document;

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
    node: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      required: true,
    },
    userIds: {
      type: [String],
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
