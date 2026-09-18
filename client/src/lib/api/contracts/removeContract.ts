import apiFetch from "@/lib/apiFetch";
import type { RemoveContractResponse } from "@/types/api-contracts";

export async function removeContract(id: number) {
  return apiFetch<RemoveContractResponse>(`/contracts/${id}`, {
    method: "DELETE",
  });
}
