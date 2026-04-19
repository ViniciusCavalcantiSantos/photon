import apiFetch from "@/lib/apiFetch";
import User from "@/types/User";
import type { FetchCurrentUserResponse } from "@/types/api-contracts";

export async function fetchUser(): Promise<User | null> {
  const data = await apiFetch<FetchCurrentUserResponse>('/me', {
    method: 'GET',
  });

  return data.user ?? null;
}
