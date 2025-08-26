import { Permissions } from "@/lib/Roles";
import { useProfile } from "./useProfile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useRequiredPermission = (
  permission: Permissions.AllPermissions
) => {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [hasPermission, setHasPermission] = useState(false);
  useEffect(() => {
    console.log({ profile });
    const hasPermission = profile?.hasPermission(permission);
    console.log({ hasPermission });
    if (!hasPermission) setHasPermission(false);
    else setHasPermission(true);
  }, [profile]);

  return !!hasPermission ? hasPermission : <>No Permission.</>;
};
