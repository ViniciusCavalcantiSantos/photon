import apiFetch from "@/lib/apiFetch";
import type { CreateContractResponse } from "@/types/api-contracts";

export async function createContract(data: any) {
  return apiFetch<CreateContractResponse>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
