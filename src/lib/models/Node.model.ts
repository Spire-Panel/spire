import mongoose, { Document } from "mongoose";
import { z } from "zod";

export const NodeValidator = z.object({
  name: z.string(),
  connectionUrl: z.string(),
  secret: z.string(),
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
