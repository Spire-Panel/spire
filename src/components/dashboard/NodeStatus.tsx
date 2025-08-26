import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Server, ServerOff, Clock, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface NodeStatusProps {
  nodeId?: string;
  id?: string;
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number; // in seconds
  cpuUsage: number; // percentage
  memoryUsage: number; // mb
  totalMemory: number; // bytes
  memoryUsagePercent: number; // percentage
  lastUpdated: Date;
  storageFreeSpace?: number; // bytes
  storageUsedSpace?: number; // bytes
  storageTotalSpace?: number; // bytes
  storageUsedPercent?: number; // percentage
  className?: string;
}

export function NodeStatus({
  nodeId,
  id,
  name,
  status = "offline",
  uptime = 0,
  cpuUsage = 0,
  memoryUsage = 0,
  totalMemory = 0,
  memoryUsagePercent = 0,
  lastUpdated = new Date(),
  storageFreeSpace = 0,
  storageUsedSpace = 0,
  storageTotalSpace = 0,
  storageUsedPercent = 0,
  className,
}: NodeStatusProps) {
  const statusConfig = {
    online: {
      icon: <Server className="h-4 w-4 text-green-500" />,
      text: "Online",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    offline: {
      icon: <ServerOff className="h-4 w-4 text-red-500" />,
      text: "Offline",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    degraded: {
      icon: <Server className="h-4 w-4 text-yellow-500" />,
      text: "Degraded",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  }[status];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatStorage = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${Math.round(bytes / (1024 * 1024))}MB`;
    return `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;
  };
  const router = useRouter();

  return (
    <div onClick={() => router.push(`/nodes/${id}`)}>
      <Card
        className={cn(
          "w-full cursor-pointer transition-all hover:shadow-[0_8px_5px_-5px_var(--color-primary)] hover:translate-y-[-2px]",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "rounded-full p-1.5",
                statusConfig.bg,
                statusConfig.color
              )}
            >
              {statusConfig.icon}
            </div>
            <CardTitle className="text-sm font-medium">{name}</CardTitle>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatUptime(uptime)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>CPU</span>
                <span>{Math.round(cpuUsage)}%</span>
              </div>
              <Progress
                value={cpuUsage}
                max={100}
                className="h-2"
                color={cpuUsage > 80 ? "bg-red-500" : "bg-primary"}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Memory</span>
                <span>
                  {memoryUsage > 1024
                    ? `${Math.round(memoryUsage)}MB`
                    : `${memoryUsage}MB`}{" "}
                  ({memoryUsagePercent}% of {totalMemory}MB)
                </span>
              </div>
              <Progress
                value={memoryUsagePercent}
                max={100}
                className="h-2"
                color={memoryUsagePercent > 80 ? "bg-red-500" : "bg-primary"}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Storage</span>
                <span>
                  {formatStorage(storageUsedSpace)} (
                  {storageUsedPercent.toFixed(1)}% of{" "}
                  {formatStorage(storageTotalSpace)})
                </span>
              </div>
              <Progress
                value={storageUsedPercent}
                max={100}
                className="h-2"
                color={storageUsedPercent > 80 ? "bg-red-500" : "bg-primary"}
              />
            </div>
            <div className="pt-2 text-xs text-muted-foreground flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              <span>
                Last updated:{" "}
                {new Intl.DateTimeFormat(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }).format(new Date(lastUpdated))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
