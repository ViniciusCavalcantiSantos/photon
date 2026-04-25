import apiFetch from "@/lib/apiFetch";
import type { FetchAssignmentsResponse } from "@/types/api-contracts";

export async function fetchAssignments(clientId: number | string) {
  return await apiFetch<FetchAssignmentsResponse>(`/clients/${clientId}/assignments`, {
    method: "GET",
  });
}
