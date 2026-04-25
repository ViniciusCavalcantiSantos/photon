import { cookies } from "next/headers";
import apiFetch from "@/lib/apiFetch";
import { ApiStatus } from "@/types/ApiResponse";
import { NextResponse } from "next/server";
import type { LoginResponse } from "@/types/api-contracts";

export async function POST(
  request: Request
) {
  const { email, password, remember_me } = await request.json();
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember_me, type: "token" }),
  })
    .catch(err => {
      return {
        status: ApiStatus.ERROR,
        message: err.message ?? "Servidor indisponível",
        token: null
      }
    })

  if (response.status === ApiStatus.SUCCESS && response.token) {
    const cookieStore = await cookies();
    const maxAge = remember_me ? 60 * 60 * 24 * 7 : 60 * 60 * 2;

    cookieStore.set({
      name: "auth_token",
      value: response.token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAge,
    });
  }

  return NextResponse.json(response)
}
