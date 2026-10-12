import { useEffect, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/api/adminApi";

/** Returns `value` once it has stopped changing for `delayMs`. */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * One page of an admin list (patients, doctors, appointments, orders) with
 * server-side search, filters and sort. The previous page stays on screen
 * while the next one loads.
 *
 * @param {string} baseKey  React Query key prefix, e.g. "admin-patients".
 * @param {string} url      List endpoint, e.g. "/admin/patients".
 * @param {object} params   { page, limit, search, ...filters } (empty / "ALL" values are omitted).
 */
export function useAdminList(baseKey, url, params) {
  const queryClient = useQueryClient();
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== "ALL" && value !== undefined && value !== null)
  );
  const queryKey = [baseKey, cleanParams];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await adminApi.get(url, { params: cleanParams });
      return { items: data.data || [], pagination: data.pagination || { page: 1, pages: 1, total: 0 }, counts: data.counts || {} };
    },
    placeholderData: keepPreviousData,
  });

  /** Optimistically edits the rows of the page currently shown. */
  const setItems = (updater) => {
    queryClient.setQueryData(queryKey, (prev) =>
      prev ? { ...prev, items: typeof updater === "function" ? updater(prev.items) : updater } : prev
    );
  };

  /** Refetches every page/filter of this list (e.g. after a change that affects counts). */
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [baseKey] });

  return {
    items: query.data?.items || [],
    pagination: query.data?.pagination || { page: 1, pages: 1, total: 0 },
    counts: query.data?.counts || {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    setItems,
    invalidate,
  };
}
