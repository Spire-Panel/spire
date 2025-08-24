import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";

export const useServerLogs = (
  serverAddress: string,
  socketPort: string,
  glidePort: string,
  serverId: string
) => {
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const { data: pastLogs } = useQuery({
    queryKey: ["logs", serverId],
    queryFn: async () => {
      const res = await fetch(
        `${serverAddress}:${glidePort}/containers/${serverId}/logs`
      ).then((res) => res.json());
      return res.data;
    },
  });

  useEffect(() => {
    const sock = io(`${serverAddress}:${socketPort}`);
    setSocket(sock);

    sock.on("connect", () => {
      sock.emit("subscribe-logs", serverId);
    });

    sock.on("log", (line: string) => {
      setLiveLogs((prev) => [...prev.slice(-500), line]);
    });

    return () => {
      sock.disconnect();
    };
  }, [serverId, serverAddress, socketPort]);

  const combinedLogs = [...(pastLogs || []), ...liveLogs];

  return {
    logs: combinedLogs,
    isLoading: !pastLogs,
    socket,
  };
};
