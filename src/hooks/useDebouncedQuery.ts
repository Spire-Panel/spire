import { useDebounce } from "./useDebounce";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export function useDebouncedQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  queryKey: any[],
  queryFn: () => Promise<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData>,
  debounceDelay = 50
): UseQueryResult<TData, TError> {
  const debouncedKey = useDebounce(queryKey, debounceDelay);

  const isKeyReady = debouncedKey.every(
    (key) => key !== undefined && key !== null && key !== ""
  );

  return useQuery<TQueryFnData, TError, TData>({
    queryKey: debouncedKey,
    queryFn,
    enabled: isKeyReady && (options?.enabled ?? true),
    ...options,
  });
}
