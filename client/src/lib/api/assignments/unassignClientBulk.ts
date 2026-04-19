import apiFetch from "@/lib/apiFetch";
import type { UnassignClientBulkResponse } from "@/types/api-contracts";

export async function unassignClientBulk(clientIds: number[] | string, assignments: number[]) {
  return await apiFetch<UnassignClientBulkResponse>(`/clients/assignments/bulk`, {
    method: "DELETE",
    body: JSON.stringify({
      client_ids: clientIds,
      assignments
    }),
  });
}
