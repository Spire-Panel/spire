"use client";
import { RoleTabs } from "@/components/settings/RoleTabs";
import { useRequiredPermission } from "@/hooks/useRequiredPermission";
import { Permissions } from "@/lib/Roles";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage application settings and user roles.
        </p>
      </div>
      <RoleTabs />
    </div>
  );
}
