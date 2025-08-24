import { useMutation } from "@tanstack/react-query";
import { ISpireSettings } from "@/lib/models/SpireSettings.model";

export const useSettingsMutation = () => {
  const mutation = useMutation({
    mutationFn: async (data: ISpireSettings) => {
      const response = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      return response.json();
    },
  });

  return mutation;
};
