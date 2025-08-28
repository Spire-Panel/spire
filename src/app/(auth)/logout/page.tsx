"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    signOut();
    router.push("/");
  }, []);

  return <div>Logging out...</div>;
}
