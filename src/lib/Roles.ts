import { User } from "@clerk/nextjs/server";

declare global {
  interface UserPublicMetadata {
    role?: string;
  }
}

export type Without<T, U> = Extract<Exclude<T, U>, string>;

export namespace Permissions {
  export enum Nodes {
    Manage = "nodes:manage",
    Read = "nodes:read",
    Write = "nodes:write",
  }

  export enum Servers {
    Manage = "servers:manage",
    Read = "servers:read",
    Write = "servers:write",
    Self = "servers:self",
    Create = "servers:create",
  }

  export enum Settings {
    Read = "settings:read",
    Write = "settings:write",
  }

  export enum Roles {
    Read = "roles:read",
    Write = "roles:write",
  }

  export enum Profile {
    Self = "profile:self",
    Manage = "profile:manage",
    Read = "profile:read",
    Write = "profile:write",
  }

  export const allPermissions = () => {
    return [
      "*",
      ...Object.values(Permissions.Nodes),
      ...Object.values(Permissions.Servers),
      ...Object.values(Permissions.Settings),
      ...Object.values(Permissions.Roles),
      ...Object.values(Permissions.Profile),
    ];
  };

  export type AllPermissions =
    | Nodes
    | Servers
    | Settings
    | Roles
    | Profile
    | `${Without<Servers, Servers.Self>}:${string}`
    | `${Without<Nodes, Nodes.Manage>}:${string}`
    | "*";
}

export const UserRoles = (user: User) => {
  return {
    hasRole: (role: string) => {
      return user.publicMetadata.role === role;
    },
  };
};
