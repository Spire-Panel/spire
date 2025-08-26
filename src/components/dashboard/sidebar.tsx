"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Permissions } from "@/lib/Roles";
import { useProfile } from "@/hooks/useProfile";
import { Loading } from "../ui/loading";
import { Network, Server, Settings } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  permission: Permissions.AllPermissions[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { data, isLoading } = useProfile();

  if (isLoading) return <Loading fullScreen />;

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      permission: [Permissions.Servers.Self],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Nodes",
      href: "/nodes",
      permission: [Permissions.Nodes.Manage],
      icon: <Network className="h-4 w-4" />,
    },
    {
      name: "Servers",
      href: "/servers",
      permission: [Permissions.Servers.Self],
      icon: <Server className="h-4 w-4" />,
    },
    {
      name: "Settings",
      href: "/settings",
      permission: [Permissions.Settings.Read],
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <span>Spire</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => {
              console.log(data?.hasPermission(item.permission));
              if (!data?.hasPermission(item.permission)) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                    pathname.startsWith(item.href)
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                      : ""
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
