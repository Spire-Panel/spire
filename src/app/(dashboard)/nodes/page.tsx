"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Network,
  HardDrive,
  Cpu,
  Activity,
  Settings,
  Server,
  ArrowUpDown,
  Search,
  MemoryStick,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { NodeStatus } from "@/components/dashboard/NodeStatus";
import { useNodes } from "@/hooks/useNodes";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useServers } from "@/hooks/useServers";
import { useRouter } from "next/navigation";

type NodeStatus = "online" | "offline" | "degraded";

interface Node {
  id: string;
  name: string;
  status: NodeStatus;
  location: string;
  ip: string;
  version: string;
  lastSeen: Date;
  cpu: {
    cores: number;
    usage: number;
  };
  memory: {
    total: number;
    used: number;
  };
  storage: {
    total: number;
    used: number;
  };
  servers: number;
}

const NodesPage = () => {
  const { data: nodes, isLoading } = useNodes(true);
  const { data: servers, isLoading: serversIsLoading } = useServers();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Node;
    direction: "ascending" | "descending";
  } | null>(null);
  const [serversInNodeCount, setServersInNodeCount] = useState<
    Map<string, number>
  >(new Map());
  const router = useRouter();

  const filteredNodes = (nodes || []).filter(
    (node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.connectionUrl.split("://")[1].includes(searchQuery)
  );

  useEffect(() => {
    if (nodes && servers) {
      const serversInNodeCount = nodes.reduce((acc, node) => {
        const serversInNode = servers.filter(
          (server) => server.node._id === node._id
        );
        acc.set(node._id, serversInNode.length > 0 ? serversInNode.length : 0);
        return acc;
      }, new Map<string, number>());
      setServersInNodeCount(serversInNodeCount);
    }
  }, [nodes, servers]);

  const sortedNodes = [...filteredNodes].sort((a, b) => {
    if (!sortConfig) return 0;

    // @ts-ignore
    const aValue = a[sortConfig.key];
    // @ts-ignore
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Node) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: NodeStatus) => {
    const statusMap = {
      online: "bg-green-500",
      offline: "bg-red-500",
      degraded: "bg-yellow-500",
    };

    return (
      <div className="flex items-center">
        <span
          className={`h-2 w-2 rounded-full ${statusMap[status]} mr-2`}
        ></span>
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nodes</h1>
          <p className="text-muted-foreground">
            Manage and monitor your server nodes
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              className="pl-9 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Nodes
                </CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nodes?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {nodes?.filter((n) => n.online).length || 0} online
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Servers
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nodes
                    ?.map((node) => {
                      const serversInNode = servers?.filter(
                        (server) => server.node._id === node._id
                      );
                      return serversInNode?.length || 0;
                    })
                    .reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all nodes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Health
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nodes?.length
                    ? `${Math.round(
                        (nodes.filter((n) => n.online).length / nodes.length) *
                          100
                      )}%`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {nodes?.filter((n) => n.online).length || 0} of{" "}
                  {nodes?.length || 0} nodes online
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Node List</CardTitle>
              <CardDescription>
                Manage and monitor your server nodes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                          onClick={() => requestSort("name")}
                        >
                          <div className="flex items-center cursor-pointer">
                            Node
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Resources
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Last Seen
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {sortedNodes.length > 0 ? (
                        sortedNodes.map((node) => {
                          return (
                            <tr
                              key={node._id}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="font-medium">{node.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {node.connectionUrl.split("://")[1]}
                                </div>
                              </td>
                              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                {getStatusBadge(
                                  !!node.online ? "online" : "offline"
                                )}
                              </td>
                              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm">
                                    <Cpu className="mr-1 h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {node.cpuUsagePercent}% of {node.cpuCores}{" "}
                                      cores
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <MemoryStick className="mr-1 h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {formatBytes(
                                        node.memoryUsageMB
                                          ? node.memoryUsageMB * 1024 * 1024
                                          : 0
                                      )}{" "}
                                      /{" "}
                                      {formatBytes(
                                        node.memoryUsageTotal
                                          ? node.memoryUsageTotal * 1024 * 1024
                                          : 0
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <HardDrive className="mr-1 h-3 w-3 text-muted-foreground" />
                                    <span>
                                      {serversInNodeCount.get(node._id) || 0}{" "}
                                      servers
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                {formatDistanceToNow(
                                  node.lastSeen || new Date(),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </td>
                              <td className="p-4 align-middle text-right [&:has([role=checkbox])]:pr-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    router.push(`/nodes/${node._id}`);
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-4 text-center text-muted-foreground"
                          >
                            {searchQuery
                              ? "No nodes match your search"
                              : "No nodes found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Node Metrics</CardTitle>
              <CardDescription>
                Detailed metrics and performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {nodes?.map((node) => (
                  <div key={node._id} className="space-y-4">
                    <h3 className="text-lg font-medium">{node.name}</h3>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Node Settings</CardTitle>
              <CardDescription>
                Configure node settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-4">Node Discovery</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Automatic Node Discovery
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Automatically discover and add nodes on your network
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-4">Maintenance Mode</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Enable Maintenance Mode
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Take nodes offline for maintenance
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NodesPage;
