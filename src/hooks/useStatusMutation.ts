import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIResponse, Errors } from "@/lib/api-utils";

export const useRestartMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      const res = await fetch(`/api/v1/servers/${data.id}/restart`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to restart server");

      return await res.json();
    },
    onSettled(variables) {
      queryClient.invalidateQueries({ queryKey: ["server", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["server", data.id] });
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
  });

  return mutation;
};

export const useStartMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      const res = await fetch(`/api/v1/servers/${data.id}/start`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to start server");

      return await res.json();
    },
    onSettled(variables) {
      queryClient.invalidateQueries({ queryKey: ["server", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["server", data.id] });
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
  });

  return mutation;
};

export const useStopMutation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      const res = await fetch(`/api/v1/servers/${data.id}/stop`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to stop server");

      return await res.json();
    },
    onMutate(variables) {
      queryClient.invalidateQueries({ queryKey: ["server", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["server", data.id] });
      queryClient.invalidateQueries({ queryKey: ["servers"] });
    },
  });

  return mutation;
};
