import mongoose, { Document } from "mongoose";
import z from "zod";

export const SpireSettingsValidator = z.object({
  onboardingComplete: z.boolean().optional().default(false),
  apiKey: z.string().optional(),
});

export interface ISpireSettings {
  onboardingComplete: boolean;
  apiKey: string;
}

const SpireSettingsSchema = new mongoose.Schema<ISpireSettings>(
  {
    onboardingComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
    apiKey: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
export type ISpireSettingsDocument = mongoose.Document & ISpireSettings;

const SpireSettings =
  (mongoose.models?.SpireSettings as mongoose.Model<ISpireSettings>) ||
  (mongoose.model(
    "SpireSettings",
    SpireSettingsSchema
  ) as mongoose.Model<ISpireSettings>);

export default SpireSettings;
