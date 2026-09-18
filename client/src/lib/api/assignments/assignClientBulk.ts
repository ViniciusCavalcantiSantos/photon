import apiFetch from "@/lib/apiFetch";
import type { AssignClientBulkResponse } from "@/types/api-contracts";

export async function assignClientBulk(clientIds: number[] | string, assignments: number[]) {
  return await apiFetch<AssignClientBulkResponse>(`/clients/assignments/bulk`, {
    method: "POST",
    body: JSON.stringify({
      client_ids: clientIds,
      assignments
    }),
  });
}
