import mongoose, { Document } from "mongoose";

export interface ISpireSettings extends Document {
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

const SpireSettings =
  (mongoose.models?.SpireSettings as mongoose.Model<ISpireSettings>) ||
  (mongoose.model(
    "SpireSettings",
    SpireSettingsSchema
  ) as mongoose.Model<ISpireSettings>);

export default SpireSettings;
