import apiFetch from "@/lib/apiFetch";
import type { FetchContractCategoriesResponse } from "@/types/api-contracts";

export async function fetchContractCategories() {
  return await apiFetch<FetchContractCategoriesResponse>(`/contracts/categories`, {
    method: "GET"
  });
}
