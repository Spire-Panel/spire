"use server";

import RoleModel from "@/lib/models/Role.model";
import { clerkClient } from "@clerk/nextjs/server";
import { Permissions } from "@/lib/Roles";

export const createRole = async (
  name: string,
  order: number,
  permissions: Permissions.AllPermissions[]
) => {
  const newRole = await RoleModel.findOneAndUpdate(
    { name },
    { name, order, permissions },
    { upsert: true, new: true }
  );
  return newRole;
};

export const isRoleValid = async (role: string) => {
  const roleExists = await RoleModel.findOne({ name: role });
  return !!roleExists;
};

export const getRoles = async () => {
  const roles = await RoleModel.find({});
  return roles;
};

export const getRole = async (role: string) => {
  const roleExists = await RoleModel.findOne({ name: role });
  return roleExists;
};

export const isUserAllowed = async (
  userId: string,
  role: string,
  permissions: Permissions.AllPermissions[],
  behaviour: Permissions.Behaviour
) => {
  const user = await (await clerkClient()).users.getUser(userId);
  const roles = await getRoles();
  if (roles.length === 0) return false;

  const userClerkRole = user.publicMetadata.role;
  if (!userClerkRole) return false;

  const clerkRoleExists = roles.find((r) => r.name === userClerkRole);
  if (!clerkRoleExists) return false;

  const roleExists = roles.find((r) => r.name === role);
  if (!roleExists) return false;

  const rolePermissions = roleExists.permissions;

  if (rolePermissions.includes("*")) return true;

  // make sure that all permissions in the array are met
  const isUserAllowed =
    behaviour === Permissions.Behaviour.And
      ? permissions.every((p) => rolePermissions.includes(p))
      : permissions.some((p) => rolePermissions.includes(p));

  if (!!roleExists.inheritChildren) {
    const childRoles = await getRoles();
    const childRoleExists = childRoles.find((r) => r.name === role);
    if (!childRoleExists) return false;
    for (const childRole of childRoles) {
      if (childRole.name === role) continue;
      const isRoleAboveChild = clerkRoleExists.order > childRole.order;
      if (!isRoleAboveChild) continue;
      const childRolePermissions = childRole.permissions;
      rolePermissions.push(...childRolePermissions);
      const isUserAllowedChild =
        behaviour === Permissions.Behaviour.And
          ? permissions.every((p) => rolePermissions.includes(p))
          : permissions.some((p) => rolePermissions.includes(p));
      if (!isUserAllowedChild) continue;

      return true;
    }

    return false;
  } else {
    if (!isUserAllowed) return false;
  }

  return true;
};

export const getUserPermissions = async (userId: string) => {
  const user = await (await clerkClient()).users.getUser(userId);
  const roles = await getRoles();
  if (roles.length === 0) return [];

  const userClerkRole = user.publicMetadata.role;
  if (!userClerkRole) return [];

  const clerkRoleExists = roles.find((r) => r.name === userClerkRole);
  if (!clerkRoleExists) return [];

  const rolePermissions = clerkRoleExists.permissions;

  if (rolePermissions.includes("*")) return ["*"]; // don't need to list all permissions...

  if (clerkRoleExists.inheritChildren) {
    const childRoles = await getRoles();
    const childRoleExists = childRoles.find((r) => r.name === userClerkRole);
    if (!childRoleExists) return [];
    for (const childRole of childRoles) {
      if (childRole.name === userClerkRole) continue;
      const isRoleAboveChild = clerkRoleExists.order > childRole.order;
      if (!isRoleAboveChild) continue;
      const childRolePermissions = childRole.permissions;
      rolePermissions.push(...childRolePermissions);
    }
  }

  const allPermissions = roles.flatMap((r) => r.permissions);
  if (allPermissions.includes("*") && userClerkRole !== "admin") {
    return [...new Set(allPermissions.filter((p) => p !== "*"))];
  }

  return [...new Set(allPermissions)];
};

export const userHasPermissions = async (
  userId: string,
  ...permissions: Permissions.AllPermissions[]
) => {
  const userPermissions = await getUserPermissions(userId);
  return permissions.every((p) => userPermissions.includes(p));
};
