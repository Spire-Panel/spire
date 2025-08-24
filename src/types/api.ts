import { Permissions } from "@/lib/Roles";

export namespace APITypes {
  export interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    role: string;
    permissions: Permissions.AllPermissions[];
  }
}
