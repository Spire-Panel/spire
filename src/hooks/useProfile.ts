"use client";

import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/lib/api-utils";
import { APITypes } from "@/types/api";
import { Permissions } from "@/lib/Roles";

const buildHasPermission =
  (permissions: Permissions.AllPermissions[]) =>
  (permission: Permissions.AllPermissions) =>
    permissions.includes("*") || permissions.includes(permission);

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await Fetch<APITypes.Profile>("/api/v1/me");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    select: (data) => ({
      profile: data,
      hasPermission: buildHasPermission(data.permissions),
    }),
  });
};
