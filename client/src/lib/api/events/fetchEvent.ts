import apiFetch from "@/lib/apiFetch";
import {buildUrl} from "@/lib/http/buildUrl";
import type { FetchEventResponse } from "@/types/api-contracts";

export async function fetchEvent(eventId: number, withContract: boolean = false) {
  const url = buildUrl(`/events/${eventId}`, {
    with_contract: withContract
  });

  return await apiFetch<FetchEventResponse>(url, {
    method: "GET",
  });
}
