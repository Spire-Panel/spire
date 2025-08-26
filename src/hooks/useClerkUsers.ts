import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/lib/api-utils";
import { APITypes } from "@/types/api";

export const useClerkUsers = () => {
  return useQuery({
    queryKey: ["clerk-users"],
    queryFn: () =>
      Fetch<APITypes.Users>("/api/v1/users").then((res) => res.data),
  });
};
