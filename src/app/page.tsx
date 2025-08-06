import Loading from "@/components/Loading";
import { LogViewer } from "@/components/LogViewer";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) redirect("/dashboard");
  else redirect("/login");

  return <Loading />;
}
