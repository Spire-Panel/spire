import { Fetch } from "@/lib/api-utils";
import { useQuery } from "@tanstack/react-query";
import { APITypes } from "@/types/api";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      Fetch<APITypes.Roles>("/api/v1/roles").then((res) => res.data),
  });
};
