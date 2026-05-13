import apiFetch from "@/lib/apiFetch";
import {buildUrl} from "@/lib/http/buildUrl";
import type { FetchClientsResponse } from "@/types/api-contracts";

export interface FetchClientsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  eventIds?: number[];
}

export async function fetchClients({
  page = 1,
  pageSize = 15,
  searchTerm,
  sortBy = 'created_at',
  sortOrder = 'desc',
  eventIds = [],
}: FetchClientsParams = {}) {
  // Build base params
  const params: Record<string, any> = {
    page: String(page),
    per_page: String(pageSize),
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  if (searchTerm) params.search = searchTerm;

  // Append event_ids[] as repeated query params
  const query = new URLSearchParams(params);
  eventIds.forEach((id) => query.append('event_ids[]', String(id)));

  return await apiFetch<FetchClientsResponse>(`/clients?${query.toString()}`, {
    method: "GET",
  });
}
