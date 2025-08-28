import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DockerTypes } from "@/types/api";

interface ServerStatus {
  cpu: DockerTypes.CPUStats;
  memory: DockerTypes.MemoryStats;
}

interface ResourceUsageChartsProps {
  status: ServerStatus | null;
  history: Array<{
    timestamp: Date;
    cpu: number;
    memory: number;
  }>;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function ResourceUsageCharts({
  status,
  history,
}: ResourceUsageChartsProps) {
  const chartData = useMemo(() => {
    return history.map((entry) => ({
      ...entry,
      timestamp: format(entry.timestamp, "HH:mm:ss"),
      memoryUsage: (entry.memory / (status?.memory?.limit || 1)) * 100,
    }));
  }, [history, status?.memory?.limit]);

  if (!status) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis
                  label={{
                    value: "Usage %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "CPU Usage",
                  ]}
                  labelFormatter={(label: string) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis
                  label={{
                    value: "Usage %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => {
                    const bytes = (value / 100) * (status?.memory?.limit || 0);
                    return [
                      `${value.toFixed(2)}% (${formatBytes(bytes)})`,
                      "Memory Usage",
                    ];
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="memoryUsage"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
