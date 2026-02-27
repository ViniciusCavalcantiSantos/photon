import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import apiFetch from "@/lib/apiFetch";

export async function POST() {
  const cookieStore = await cookies();

  // Invalidate token on the backend (works for both token and session modes)
  await apiFetch('/logout', { method: 'POST' }).catch(() => null);

  cookieStore.delete('auth_token');
  cookieStore.delete('logged_in');

  return NextResponse.json({ status: 'success', message: 'Logout successful' });
}