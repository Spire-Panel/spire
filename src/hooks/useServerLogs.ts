import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { IServer } from "@/lib/models/Server.model";

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

export const useServerLogs = (server?: IServer) => {
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const socketUrl = server?.node?.connectionUrl?.replace(/:\d+/, ":8080");

  const { data: pastLogs, refetch: refetchPastLogs } = useQuery({
    queryKey: ["logs", server?._id],
    queryFn: async () => {
      if (!server) return [];
      try {
        const res = await fetch(
          `${server.node.connectionUrl}/containers/${server._id}/logs`
        );
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        return data.data || [];
      } catch (error) {
        console.error("Error fetching logs:", error);
        return [];
      }
    },
    enabled: !!server && isConnected,
    refetchOnWindowFocus: false,
  });

  const subscribeToLogs = useCallback(
    (sock: Socket) => {
      if (!server?._id) return;

      // Store the last timestamp to detect duplicates
      let lastLogTimestamp: string | null = null;

      setLiveLogs((prev) => {
        // Only add reconnection message if it's not already the last message
        const lastMessage = prev[prev.length - 1];
        if (lastMessage !== "=== Reconnecting to logs ===") {
          return [...prev, "=== Reconnecting to logs ==="];
        }
        return prev;
      });

      // Remove any existing log listeners to prevent duplicates
      sock.off("log");

      sock.emit(
        "subscribe-logs",
        server._id,
        (response: { success: boolean }) => {
          if (response?.success) {
            setLiveLogs((prev) => {
              // Only add connection message if it's not already the last message
              const lastMessage = prev[prev.length - 1];
              if (lastMessage !== "=== Connected to server logs ===") {
                return [...prev, "=== Connected to server logs ==="];
              }
              return prev;
            });
            setRetryCount(0);
          }
        }
      );

      sock.on("log", (line: string) => {
        if (line.trim() === "") return;

        const timestampMatch = line.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
        const currentTimestamp = timestampMatch ? timestampMatch[1] : null;

        if (currentTimestamp && currentTimestamp === lastLogTimestamp) {
          return;
        }

        lastLogTimestamp = currentTimestamp;

        setLiveLogs((prev) => {
          if (prev.length > 0 && prev[prev.length - 1] === line) {
            return prev;
          }
          if (
            line.includes("[stream ended]") &&
            prev[prev.length - 1]?.includes("[stream ended]")
          ) {
            return prev;
          }

          return [...prev, line];
        });
      });

      sock.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);

        if (reason === "io server disconnect") {
          sock.connect();
        } else if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount);
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            sock.connect();
          }, delay);
        }
      });

      sock.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
        refetchPastLogs();
      });

      sock.on("error", (error) => {
        console.error("Socket error:", error);
        setLiveLogs((prev) => [
          ...prev,
          `=== Error: ${error.message || "Connection error"} ===`,
        ]);
      });
    },
    [server?._id, retryCount, refetchPastLogs]
  );

  useEffect(() => {
    if (!socketUrl) return;

    console.log("Initializing socket connection to:", socketUrl);
    const sock = io(socketUrl, {
      reconnectionAttempts: MAX_RETRIES,
      reconnectionDelay: RETRY_DELAY,
      autoConnect: true,
      transports: ["websocket"],
    });

    setSocket(sock);

    sock.on("connect", () => {
      console.log("Socket connected initially");
      setIsConnected(true);
      subscribeToLogs(sock);
    });

    return () => {
      console.log("Cleaning up socket");
      sock.off("connect");
      sock.off("disconnect");
      sock.off("log");
      sock.off("error");
      sock.disconnect();
    };
  }, [socketUrl, subscribeToLogs]);

  useEffect(() => {
    if (socket && server?._id) {
      subscribeToLogs(socket);
    }
  }, [server?._id, socket, subscribeToLogs]);

  const combinedLogs = useCallback(() => {
    const past = pastLogs || [];
    const uniqueLiveLogs = liveLogs.filter(
      (log) => !past.some((pastLog: string) => pastLog.includes(log))
    );
    return [...past, ...uniqueLiveLogs];
  }, [pastLogs, liveLogs]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  return {
    logs: combinedLogs(),
    isLoading: !pastLogs && !isConnected,
    isConnected,
    reconnect,
    socket,
  };
};
