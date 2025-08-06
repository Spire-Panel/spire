import { useDebouncedQuery } from "./useDebouncedQuery";
import { useState } from "react";

export const useTestNodeSecret = (
  nodeConnectionUrl: string,
  nodeSecret: string
) => {
  const [isValid, setIsValid] = useState(false);
  const { isLoading, error } = useDebouncedQuery(
    ["nodeConnAPIKey", nodeConnectionUrl, nodeSecret],
    async () => {
      const response = await fetch(`${nodeConnectionUrl}`, {
        headers: {
          Authorization: `Bearer ${nodeSecret}`,
        },
      });
      if (!response.ok) {
        setIsValid(false);
        throw new Error("Invalid node API key");
      }
      setIsValid(true);
      return response.json();
    }
  );

  return { isLoading, error, isValid };
};
