import { useMutation } from "@tanstack/react-query";
import { INode } from "@/lib/models/Node.model";

export const useCreateNodeMutation = () => {
  const mutation = useMutation({
    mutationFn: async (data: INode) => {
      const response = await fetch("/api/v1/nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create node");
      }

      return response.json();
    },
  });

  return mutation;
};
