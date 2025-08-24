import mongoose, { Document } from "mongoose";
import { z } from "zod";

export const NodeValidator = z.object({
  name: z.string(),
  connectionUrl: z.string(),
  secret: z.string(),
  portAllocations: z.array(z.number()).optional(),
});

export type INode = z.infer<typeof NodeValidator>;
export type INodeDocument = mongoose.Document & INode;

const NodeSchema = new mongoose.Schema<INode>(
  {
    name: {
      type: String,
      required: true,
    },
    connectionUrl: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      required: true,
    },
    portAllocations: {
      type: [Number],
      required: false,
      validate: {
        validator: (v: number[]) => {
          return v.every((port) => port >= 1024 && port <= 65535);
        },
        message: "Port allocations must be between 1024 and 65535",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Node =
  (mongoose.models?.Node as mongoose.Model<INode>) ||
  (mongoose.model("Node", NodeSchema) as mongoose.Model<INode>);

export default Node;
