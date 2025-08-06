import { useDebouncedQuery } from "./useDebouncedQuery";
import { useState } from "react";

export const useTestNodeConnection = (nodeConnectionUrl: string) => {
  const [isValid, setIsValid] = useState(false);
  const { isLoading, error } = useDebouncedQuery(
    ["nodeConnection", nodeConnectionUrl],
    async () => {
      const response = await fetch(`${nodeConnectionUrl}/health`);
      if (!response.ok) {
        setIsValid(false);
        throw new Error("Invalid node connection");
      }
      setIsValid(true);
      return response.json();
    }
  );

  return { isLoading, error, isValid };
};
