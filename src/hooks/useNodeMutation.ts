import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APITypes } from "@/types/api";
import { Fetch } from "@/lib/api-utils";

export const useNodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      _id,
      ...node
    }: Pick<
      APITypes.Nodes,
      "portAllocations" | "_id" | "name" | "connectionUrl"
    >) => {
      try {
        const res = await fetch(`/api/v1/nodes/${_id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(node),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update node");
        }

        return data;
      } catch (error) {
        console.error("Error in node mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate both the nodes list and the specific node's query
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      queryClient.invalidateQueries({ queryKey: ["node"] });
    },
  });
};

export const useCreateNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      node: Omit<APITypes.Nodes, "_id" | "createdAt" | "updatedAt">
    ) => {
      const res = await fetch("/api/v1/nodes", {
        method: "POST",
        body: JSON.stringify(node),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
    },
  });
};
