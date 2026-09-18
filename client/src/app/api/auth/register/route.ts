import { cookies } from "next/headers";
import apiFetch from "@/lib/apiFetch";
import { ApiStatus } from "@/types/ApiResponse";
import { NextResponse } from "next/server";
import type { RegisterResponse } from "@/types/api-contracts";

export async function POST(request: Request) {
    const body = await request.json();

    const response = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...body, type: "token" }),
    })
        .catch(err => ({
            status: ApiStatus.ERROR,
            message: err.message ?? "Servidor indisponível",
            token: null,
        }));

    if (response.status === ApiStatus.SUCCESS && response.token) {
        const cookieStore = await cookies();

        cookieStore.set({
            name: "auth_token",
            value: response.token,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 2, // 2 hours by default for new accounts
        });
    }

    return NextResponse.json(response);
}
