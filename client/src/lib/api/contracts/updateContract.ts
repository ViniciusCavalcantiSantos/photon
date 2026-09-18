import apiFetch from "@/lib/apiFetch";
import type { UpdateContractResponse } from "@/types/api-contracts";

export async function updateContract(id: number, data: any) {
  return apiFetch<UpdateContractResponse>(`/contracts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
