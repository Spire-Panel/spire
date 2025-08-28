"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useServer } from "@/hooks/useServers";
import { useProfile } from "@/hooks/useProfile";
import { useMutation } from "@tanstack/react-query";
import { IServer } from "@/lib/models/Server.model";
import { toast } from "sonner";
import { ConsoleOutput } from "@/components/console/ConsoleOutput";
import { FileExplorer } from "@/components/files/FileExplorer";
import { ResourceUsageCharts } from "@/components/server/ResourceUsageCharts";
import { APITypes, DockerTypes } from "@/types/api";
import {
  Cpu,
  MemoryStick,
  HardDrive as HardDriveIcon,
  Server as ServerIcon,
  Terminal,
  Play,
  StopCircle,
  RotateCw,
  FolderOpen,
  Settings,
} from "lucide-react";
import {
  useRestartMutation,
  useStartMutation,
  useStopMutation,
} from "@/hooks/useStatusMutation";
import { useSendCommand } from "@/hooks/useServers";
import { useServerLogs } from "@/hooks/useServerLogs";

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Helper function to calculate CPU usage percentage
const calculateCpuUsage = (cpu: DockerTypes.CPUStats): number => {
  if (!cpu?.cpu_usage?.total_usage || !cpu.system_cpu_usage) return 0;
  return Math.min(
    100,
    Math.max(0, (cpu.cpu_usage.total_usage / cpu.system_cpu_usage) * 10000)
  );
};

export default function ServerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("console");
  const [command, setCommand] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceHistory, setResourceHistory] = useState<
    Array<{
      timestamp: Date;
      cpu: number;
      memory: number;
    }>
  >([]);

  const { data: server, isLoading } = useServer(id as string, {
    refetch: true,
    refetchInterval: 3000,
  });

  const { mutateAsync: sendCommand, isPending: isSendingCommand } =
    useSendCommand(id as string);
  const { mutateAsync: restart, isPending: isRestarting } =
    useRestartMutation();
  const { mutateAsync: start, isPending: isStarting } = useStartMutation();
  const { mutateAsync: stop, isPending: isStopping } = useStopMutation();

  // Update resource history when server status changes
  useEffect(() => {
    if (
      server?.status?.cpu?.cpu_usage?.total_usage &&
      server?.status?.memory?.usage
    ) {
      setResourceHistory((prev) => {
        const cpuUsage = calculateCpuUsage(server.status.cpu);
        const newHistory = [
          ...prev,
          {
            timestamp: new Date(),
            cpu: cpuUsage,
            memory: server.status.memory.usage,
          },
        ];

        // Keep only the last 60 data points (3 minutes of data at 3s intervals)
        return newHistory.slice(-60);
      });
    }
  }, [server?.status]);

  const { data: profile } = useProfile();
  const { logs, isConnected, reconnect, setLogs } = useServerLogs(
    server as APITypes.Server
  );

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isSendingCommand) return;

    const commandLine = `> ${command}`;
    setLogs([commandLine]);
    setCommand("");

    try {
      const response = await sendCommand(command);

      if (response && response.length > 0) {
        setLogs(response);
      }
    } catch (error) {
      console.error("Error sending command:", error);
      setLogs([
        "Error: Failed to execute command. Make sure the server is running and you have permission.",
      ]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const restartServer = async () => {
    if (!server) return;
    try {
      setIsSubmitting(true);
      const { success, error } = await restart({
        id: server._id,
      });

      if (success) {
        toast.success("Server restarted successfully!");
        setTimeout(() => {
          reconnect();
        }, 2000);
      } else {
        throw new Error(error || "Failed to restart server");
      }
    } catch (error) {
      console.error("Error restarting server:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to restart server"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startServer = async () => {
    if (!server) return;
    try {
      setIsSubmitting(true);
      const { success, error } = await start({
        id: server._id,
      });

      if (success) {
        toast.success("Server started successfully!");
        setTimeout(() => {
          reconnect();
        }, 2000);
      } else {
        throw new Error(error || "Failed to start server");
      }
    } catch (error) {
      console.error("Error starting server:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start server"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopServer = async () => {
    if (!server) return;
    try {
      setIsSubmitting(true);
      const { success, error } = await stop({
        id: server._id,
      });

      if (success) {
        toast.success("Server stopped successfully!");
        setTimeout(() => {
          reconnect();
        }, 2000);
      } else {
        throw new Error(error || "Failed to stop server");
      }
    } catch (error) {
      console.error("Error stopping server:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to stop server"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Server className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Server not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested server could not be found.
        </p>
        <Button className="mt-4" onClick={() => router.push("/servers")}>
          Back to Servers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{server.name}</h1>
            <Badge variant={server.status.running ? "default" : "destructive"}>
              {server.status.running ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startServer}
              disabled={isSubmitting || server?.status?.running}
            >
              <Play className="h-4 w-4 mr-2" /> Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stopServer}
              disabled={isSubmitting || server?.status?.status !== "RUNNING"}
            >
              <StopCircle className="h-4 w-4 mr-2" /> Stop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={restartServer}
              disabled={isSubmitting || server?.status?.status !== "RUNNING"}
            >
              <RotateCw className="h-4 w-4 mr-2" /> Restart
            </Button>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <ServerIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {server.status.running ? "Online" : "Offline"}
              </div>
              <p className="text-xs text-muted-foreground">
                {server.status.running
                  ? "Server is online"
                  : "Server is offline"}
              </p>
            </CardContent>
          </Card>

          {/* CPU Usage Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {server?.status?.cpu && server.status.running
                  ? `${calculateCpuUsage(server.status.cpu).toFixed(1)}%`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {server?.status?.cpu?.online_cpus || server.status.running
                  ? "?"
                  : "Server is offline"}{" "}
                {server?.status?.running && "cores"}
              </p>
            </CardContent>
          </Card>

          {/* Memory Usage Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Memory Usage
              </CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {server?.status?.memory && server.status.running
                  ? formatBytes(server.status.memory.usage)
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {server?.status?.memory && server.status.running
                  ? `of ${formatBytes(server.status.memory.limit)}`
                  : "Server is offline"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Usage Charts */}
        {server?.status?.running && resourceHistory.length > 0 && (
          <div className="mt-6">
            <ResourceUsageCharts
              status={{
                cpu: server.status.cpu,
                memory: server.status.memory,
              }}
              history={resourceHistory}
            />
          </div>
        )}
      </div>
      <Tabs defaultValue="console" className="space-y-4">
        <TabsList>
          <TabsTrigger value="console" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Console
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <HardDriveIcon className="h-4 w-4" /> Files
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" /> Backups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Console</CardTitle>
              <CardDescription>
                View and interact with the server console
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 border border-gray-700 rounded-md h-[32rem] flex flex-col">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {!isConnected ? "Connecting..." : "Connected"}
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <ConsoleOutput logs={logs} className="h-full" />
                </div>
                <div className="border-t border-gray-700 p-2">
                  <form onSubmit={handleCommandSubmit} className="flex gap-2">
                    <div className="text-gray-400 flex items-center">
                      <span className="text-green-400">$</span>
                    </div>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="flex-1 bg-gray-800 text-gray-200 px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter command..."
                      disabled={!isConnected}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!command.trim() || !isConnected}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-0">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader>
              <CardTitle>File Explorer</CardTitle>
              <CardDescription>
                Browse and edit your server files
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              {server && (
                <div className="h-full">
                  <FileExplorer
                    serverId={server._id}
                    initialPath="/"
                    className="h-full border-0"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backups</CardTitle>
              <CardDescription>Manage server backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-2" />
                  <p>Backup management will be implemented here</p>
                  <p className="text-sm">Create and restore server backups</p>
                  <Button className="mt-4">Create Backup</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
