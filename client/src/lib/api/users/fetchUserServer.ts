import {cache} from "react";
import apiFetch from "@/lib/apiFetch";
import type { FetchCurrentUserResponse } from "@/types/api-contracts";

export const fetchUserServer = cache(async () => {
  return await apiFetch<FetchCurrentUserResponse>("/me", {
    method: "GET",
    throwOnError: false
  });
});
