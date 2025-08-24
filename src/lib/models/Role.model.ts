import { z } from "zod";
import mongoose, { Document } from "mongoose";
import { Permissions } from "@/lib/Roles";

export const RoleValidator = z.object({
  name: z.string(),
  permissions: z.array(z.enum(Permissions.allPermissions())),
  order: z.number().default(0),
  inheritChildren: z.boolean().default(false),
});

export type IRole = z.infer<typeof RoleValidator>;

const RoleSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    inheritChildren: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Role =
  (mongoose.models?.Role as mongoose.Model<IRole>) ||
  (mongoose.model("Role", RoleSchema) as mongoose.Model<IRole>);

export default Role;
