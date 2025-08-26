"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/useProfile";
import { useServers } from "@/hooks/useServers";
import { Server, ServerOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Permissions } from "@/lib/Roles";

export default function ServersPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { data: profile } = useProfile();
  const { data: servers, isLoading } = useServers();

  const accessibleServers = servers?.filter((server) => {
    const hasDirectAccess = server.userIds?.includes(userId || "");

    const hasPermission =
      profile?.hasPermission(`servers:read:${server._id}`) ||
      profile?.hasPermission(Permissions.Servers.Read);

    return hasDirectAccess || hasPermission;
  });

  const hasPermissionToCreate = profile?.hasPermission(
    Permissions.Servers.Create
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servers</h1>
          <p className="text-muted-foreground">Manage your Minecraft servers</p>
        </div>
        {hasPermissionToCreate && (
          <Button onClick={() => router.push("/servers/new")}>
            Create Server
          </Button>
        )}
      </div>

      {!accessibleServers?.length ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed">
          <ServerOff className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No servers found
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have access to any servers yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accessibleServers.map((server) => (
            <Card
              key={server._id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => router.push(`/servers/${server._id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  {server.name}
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {server.status.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="text-sm font-medium">{server.version}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="text-sm font-medium">{server.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Port</p>
                    <p className="text-sm font-mono">{server.port}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className="text-sm font-mono">{server.memory}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
