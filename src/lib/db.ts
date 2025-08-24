import { env } from "@/config/env";
import mongoose, { Model } from "mongoose";

declare global {
  var mongoose: any;
}

const MONGODB_URI = env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

import "./models/User.model";
import { Permissions } from "./Roles";
export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = await mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("mongo connected");
        return mongoose;
      })
      .catch((e) => console.log(e));
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  where?: mongoose.QueryOptions;
  populates?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
export async function modelPaginate<TModel>(
  model: Model<TModel>,
  options: PaginationOptions & Record<string, any> = {}
) {
  const { page = 1, pageSize = 10, where, populates } = options;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [total, items] = await Promise.all([
    model.countDocuments(where),
    !!populates && populates.length > 0
      ? new Promise((resolve) => {
          const query = model
            .find({
              ...where,
            })
            .skip(skip)
            .limit(take);

          for (const populate of populates) {
            query.populate(populate);
          }

          resolve(query);
        })
      : model
          .find({
            ...where,
          })
          .skip(skip)
          .limit(take),
  ]);

  return {
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export default dbConnect;
