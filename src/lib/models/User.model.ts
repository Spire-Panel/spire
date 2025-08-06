import mongoose, { Document } from "mongoose";

export interface IUser extends Omit<Document, "__v"> {
  emails: string[];
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    emails: {
      type: [String],
      required: true,
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

const User =
  (mongoose.models?.User as mongoose.Model<IUser>) ||
  (mongoose.model<IUser>("User", UserSchema) as mongoose.Model<IUser>);

export { User };
