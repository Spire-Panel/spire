import { ServerValidator } from "@/lib/models/Server.model";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

export const useCreateServerMutation = () => {
  const mutation = useMutation({
    mutationFn: async (data: Omit<z.infer<typeof ServerValidator>, "_id">) => {
      const response = await fetch("/api/v1/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create server");
      }

      const server = await response.json();
      return server;
    },
  });

  return mutation;
};
