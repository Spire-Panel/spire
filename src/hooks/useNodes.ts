import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/lib/api-utils";
import { APITypes } from "@/types/api";

export const useNodes = (includeStatus = false) => {
  return useQuery({
    queryKey: ["nodes"],
    queryFn: async () => {
      const res = await Fetch<APITypes.Nodes[]>(
        `/api/v1/nodes${
          includeStatus ? "?includeStatus=true&timeout=1000" : ""
        }`
      );
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    refetchInterval: includeStatus ? 15000 : false,
  });
};

export const useNode = (id: string, includeStatus = false) => {
  return useQuery({
    queryKey: ["node", id],
    queryFn: async () => {
      const res = await Fetch<APITypes.Nodes>(`/api/v1/nodes/${id}`);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    refetchInterval: includeStatus ? 15000 : false,
  });
};
