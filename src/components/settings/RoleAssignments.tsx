"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkUsers } from "@/hooks/useClerkUsers";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "../ui/skeleton";
import { useRoles } from "@/hooks/useRoles";
import { useUpdateUserRoleMutation } from "@/hooks/useUpdateUserRoleMutation";

export function RoleAssignments() {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const {
    data: clerkUsers,
    isLoading: clerkUsersLoading,
    refetch: refetchClerkUsers,
    isRefetching: clerkUsersRefetching,
  } = useClerkUsers();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { mutateAsync: updateRoleMutation } = useUpdateUserRoleMutation();

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    if (!user) return;

    setIsSaving((prev) => ({ ...prev, [userId]: true }));

    try {
      const role = roles?.find((r) => r._id.toString() === newRoleId);
      if (!role) return;

      await updateRoleMutation({ userId, role: role.name });

      refetchClerkUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(
        `Failure: ${
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "An error occurred"
        }`
      );
    } finally {
      toast.success("Role updated successfully");
      setIsSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Manage User Roles</h4>
        <p className="text-sm text-muted-foreground">
          Assign roles to users to control their access and permissions.
        </p>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-12 gap-4 p-4 border-b font-medium">
          <div className="col-span-4">User</div>
          <div className="col-span-6">Email</div>
          <div className="col-span-2">Role</div>
        </div>
        {clerkUsersLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-4 border-b items-center"
              >
                <div className="col-span-4">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-6">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))
          : clerkUsers?.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 p-4 border-b items-center"
              >
                <div className="col-span-4">
                  {user.firstName} {user.lastName}
                </div>
                <div className="col-span-6 text-sm text-muted-foreground">
                  {user.emailAddresses[0].emailAddress}
                </div>
                <div className="col-span-2">
                  <Select
                    value={roles
                      ?.find((r) => r.name === user.publicMetadata.role)
                      ?._id.toString()}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={isSaving[user.id] || clerkUsersRefetching}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={user.publicMetadata.role} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem
                          key={role._id.toString()}
                          value={role._id.toString()}
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isSaving[user.id] && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Saving...
                    </div>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
