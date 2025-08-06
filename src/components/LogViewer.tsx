"use client";

import { useServerLogs } from "@/hooks/useServerLogs";

export const LogViewer = ({
  serverAddress,
  serverId,
  socketPort,
  glidePort,
}: {
  serverAddress: string;
  serverId: string;
  socketPort: string;
  glidePort: string;
}) => {
  const { logs } = useServerLogs(
    serverAddress,
    socketPort,
    glidePort,
    serverId
  );

  return (
    <div>
      <h1>Logs</h1>
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  );
};
