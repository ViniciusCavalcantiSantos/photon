import apiFetch from "@/lib/apiFetch";
import type { CreateClientLinkResponse } from "@/types/api-contracts";

export async function createLink(
  values: any,
) {

  return apiFetch<CreateClientLinkResponse>("/clients/links", {
    method: "POST",
    body: JSON.stringify(values)
  });
}
