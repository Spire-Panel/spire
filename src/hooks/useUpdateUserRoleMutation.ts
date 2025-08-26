import { Fetch } from "@/lib/api-utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUserRoleMutation = () => {
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await Fetch(`/api/v1/users/${userId}/roles`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
};
