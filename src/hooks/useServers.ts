import { Fetch } from "@/lib/api-utils";
import { useQuery } from "@tanstack/react-query";
import { APITypes } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useServers = () => {
  return useQuery({
    queryKey: ["servers"],
    queryFn: () =>
      Fetch<APITypes.Servers>("/api/v1/servers").then((res) => res.data),
  });
};

export const useServer = (
  id: string,
  {
    refetch,
    refetchInterval,
  }: {
    refetch: boolean;
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: ["server", id],
    queryFn: () =>
      Fetch<APITypes.Server>(`/api/v1/servers/${id}`).then((res) => res.data),
    refetchInterval: refetch ? refetchInterval || 3000 : false,
    refetchOnMount: refetch,
    refetchOnWindowFocus: refetch,
  });
};

export const useSendCommand = (id: string) => {
  return useMutation({
    mutationFn: async (command: string) => {
      const res = await fetch(`/api/v1/servers/${id}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      return data.data as string[]; // Array of lines from the command output
    },
    onSuccess: () => {
      toast.success("Command sent successfully!");
    },
    onError: () => {
      toast.error("Failed to send command");
    },
  });
};
