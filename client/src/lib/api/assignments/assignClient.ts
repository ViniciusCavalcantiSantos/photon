import apiFetch from "@/lib/apiFetch";
import type { AssignClientResponse } from "@/types/api-contracts";

export async function assignClient(clientId: number | string, assignments: number[]) {
  return await apiFetch<AssignClientResponse>(`/clients/${clientId}/assignments`, {
    method: "POST",
    body: JSON.stringify({assignments}),
  });
}
