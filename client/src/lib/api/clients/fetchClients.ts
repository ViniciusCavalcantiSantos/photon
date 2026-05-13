import apiFetch from "@/lib/apiFetch";
import {buildUrl} from "@/lib/http/buildUrl";
import type { FetchClientsResponse } from "@/types/api-contracts";

export interface FetchClientsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchClients({
  page = 1,
  pageSize = 15,
  searchTerm,
  sortBy = 'created_at',
  sortOrder = 'desc',
}: FetchClientsParams = {}) {
  const url = buildUrl('/clients', {
    page: String(page),
    per_page: String(pageSize),
    search: searchTerm || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  return await apiFetch<FetchClientsResponse>(url, {
    method: "GET",
  });
}
