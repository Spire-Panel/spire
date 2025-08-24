import React from "react";
import { getSettings } from "@/actions/db.actions";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = async ({ children }: Props) => {
  const settings = await getSettings();
  if (!settings.onboardingComplete) redirect("/onboarding");

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
