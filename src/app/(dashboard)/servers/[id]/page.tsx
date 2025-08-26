"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Terminal,
  HardDrive,
  Settings,
  Play,
  StopCircle,
  RotateCw,
  FolderOpen,
} from "lucide-react";
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
import { useServerLogs } from "@/hooks/useServerLogs";
import { useNode } from "@/hooks/useNodes";
import { IServer } from "@/lib/models/Server.model";
import {
  useStopMutation,
  useRestartMutation,
  useStartMutation,
} from "@/hooks/useStatusMutation";
import { toast } from "sonner";
import { ConsoleOutput } from "@/components/console/ConsoleOutput";
import { FileExplorer } from "@/components/files/FileExplorer";

// Mock data - will be replaced with real data
const mockStats = {
  cpu: 35,
  memory: 65,
  storage: 42,
  status: "online" as const,
  players: {
    online: 3,
    max: 20,
  },
};

export default function ServerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("console");
  const [command, setCommand] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: server, isLoading } = useServer(id as string);
  const { data: profile } = useProfile();
  const { mutateAsync: restart } = useRestartMutation();
  const { mutateAsync: start } = useStartMutation();
  const { mutateAsync: stop } = useStopMutation();
  const { logs, isConnected, reconnect } = useServerLogs(server as IServer);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // In a real implementation, this would send the command to the server
    setConsoleOutput((prev) => [
      ...prev,
      `> ${command}`,
      "Command executed successfully",
    ]);
    setCommand("");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{server.name}</h1>
            <Badge variant={server.status.running ? "default" : "destructive"}>
              {server.status.running ? "Online" : "Offline"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {server.type} {server.version} • {mockStats.players.online}/
            {mockStats.players.max} players
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/servers/${id}/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {server.status.running ? (
            <Button variant="destructive" size="sm" onClick={stopServer}>
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button size="sm" onClick={startServer}>
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={restartServer}>
            <RotateCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.cpu}%</div>
            <Progress value={mockStats.cpu} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.memory}%</div>
            <Progress value={mockStats.memory} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((mockStats.memory / 100) * 8192)} MB / 8192 MB
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.storage}%</div>
            <Progress value={mockStats.storage} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              42 GB / 100 GB used
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="console" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Console
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Files
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
