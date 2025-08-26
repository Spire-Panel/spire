"use client";

import { useProfile } from "@/hooks/useProfile";
import { Permissions } from "@/lib/Roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Cpu, HardDrive, Network } from "lucide-react";
import { NodeStatus } from "@/components/dashboard/NodeStatus";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { formatDistanceToNow } from "date-fns";
import { useNodes } from "@/hooks/useNodes";
import { Skeleton } from "@/components/ui/skeleton";
import { useServers } from "@/hooks/useServers";

const DashboardPage = () => {
  const { data: data, isLoading } = useProfile();
  const { data: nodes, isLoading: nodesIsLoading } = useNodes(true);
  const { data: servers, isLoading: serversIsLoading } = useServers();
  const totalServers = servers?.length || 0;
  const activeUsers = 42;

  // format storage to GB from bytes
  const allStorageOfAllNodes =
    nodes?.reduce(
      (acc, node) =>
        acc +
        (node.storageTotalSpace ? node.storageTotalSpace : 0) /
          1024 /
          1024 /
          1024,
      0
    ) || 0;
  const usedStorageOfAllNodes =
    nodes?.reduce(
      (acc, node) =>
        acc +
        (node.storageUsedSpace ? node.storageUsedSpace : 0) /
          1024 /
          1024 /
          1024,
      0
    ) || 0;
  const storagePercentage = Math.round(
    (usedStorageOfAllNodes / allStorageOfAllNodes) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {data?.profile?.firstName || "User"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            {formatDistanceToNow(new Date(), { addSuffix: true })}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricsCard
          title="Total Nodes"
          value={nodes?.length || 0}
          description={`${nodes?.filter((n) => n.online).length || 0} active`}
          icon={<Network className="h-4 w-4" />}
        />
        <MetricsCard
          title="Servers"
          value={totalServers}
          description="Running across all nodes"
          loading={serversIsLoading}
          icon={<HardDrive className="h-4 w-4" />}
        />
        <MetricsCard
          title="Total Storage Used"
          loading={nodesIsLoading}
          value={`${usedStorageOfAllNodes.toFixed(2)}GB`}
          description={`${storagePercentage}% of ${allStorageOfAllNodes.toFixed(
            2
          )}GB`}
          icon={<Cpu className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nodes" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Nodes
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nodesIsLoading ? (
              <Skeleton className="h-64" />
            ) : (
              // i know it's a mess but...
              nodes?.map((node) => (
                <NodeStatus
                  key={node._id}
                  id={node._id}
                  name={node.name}
                  status={node.online ? "online" : "offline"}
                  uptime={node.uptime || 0}
                  cpuUsage={node.cpuUsagePercent || 0}
                  memoryUsage={node.memoryUsageMB || 0}
                  totalMemory={node.memoryUsageTotal || 0}
                  memoryUsagePercent={node.memoryUsagePercent || 0}
                  lastUpdated={node.lastUpdated || new Date()}
                  storageFreeSpace={node.storageFreeSpace || 0}
                  storageUsedSpace={node.storageUsedSpace || 0}
                  storageTotalSpace={node.storageTotalSpace || 0}
                  storageUsedPercent={node.storageUsedPercent || 0}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Activity feed will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
