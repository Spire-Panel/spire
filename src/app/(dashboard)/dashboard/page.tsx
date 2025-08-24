"use client";

import { useProfile } from "@/hooks/useProfile";
import { Permissions } from "@/lib/Roles";
import React from "react";

type Props = {};

const page = (props: Props) => {
  const { data, isLoading } = useProfile();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.hasPermission(Permissions.Profile.Self)
        ? data?.profile.email
        : "No"}
    </div>
  );
};

export default page;
