"use server";
import { clerkClient } from "@clerk/nextjs/server";

export const updateRole = async (userId: string, role: string) => {
  const clerk = await clerkClient();
  const users = clerk.users;
  await users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  });
};
