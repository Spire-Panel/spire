import { User, IUser } from "./models/User.model";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/config/env";

// Define a simplified user type without Mongoose internals
export interface AuthUser {
  _id: string;
  email: string;
  // Add other user fields you want to expose
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export const JWT_SECRET = env.JWT_SECRET || "your-secret-key";

export async function signUp(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        message: "User already exists with this email",
      };
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Convert to plain object and extract only needed fields
    const userObj = user.toObject() as IUser;
    const { password: _password, ...userData } = userObj;
    const userWithoutPassword: AuthUser = {
      _id: userData._id.toString(),
      email: userData.email,
      // Add other fields you want to expose
    };

    return {
      success: true,
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: "An error occurred during signup",
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Convert to plain object and extract only needed fields
    const userObj = user.toObject() as IUser;
    const { password: _password, ...userData } = userObj;
    const userWithoutPassword: AuthUser = {
      _id: userData._id.toString(),
      email: userData.email,
      // Add other fields you want to expose
    };

    return {
      success: true,
      message: "Logged in successfully",
      token,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login",
    };
  }
}

export async function verifyToken(
  token: string
): Promise<{ valid: boolean; payload?: any }> {
  try {
    if (!token) return { valid: false };

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return { valid: false };

    return { valid: true, payload: { id: user._id, email: user.email } };
  } catch (error) {
    return { valid: false };
  }
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const { valid, payload } = await verifyToken(token);

  if (!valid) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }

  return { success: true, user: payload };
}
