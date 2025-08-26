import { Fetch } from "@/lib/api-utils";
import { useQuery } from "@tanstack/react-query";
import { APITypes } from "@/types/api";

export const useServers = () => {
  return useQuery({
    queryKey: ["servers"],
    queryFn: () =>
      Fetch<APITypes.Servers>("/api/v1/servers").then((res) => res.data),
  });
};

export const useServer = (id: string) => {
  return useQuery({
    queryKey: ["server", id],
    queryFn: () =>
      Fetch<APITypes.Server>(`/api/v1/servers/${id}`).then((res) => res.data),
  });
};
