import { APIResponse } from "@/lib/api-utils";
import { APITypes } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export default function useNodeAllocations(nodeId: string) {
  return useQuery<number[]>({
    queryKey: ["node-allocations", nodeId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/nodes/${nodeId}`);
      const data = (await response.json()) as APIResponse<APITypes.Nodes>;
      return data.data.portAllocations || [];
    },
    enabled: !!nodeId,
  });
}
