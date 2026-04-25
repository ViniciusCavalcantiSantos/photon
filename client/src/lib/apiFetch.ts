import ApiResponse, { ApiStatus } from "@/types/ApiResponse";
import i18next from "@/i18n/i18next";
import axios from "axios";
import { ApiError } from "@/lib/ApiError";

export type ApiDriver = "fetch" | "axios";

export interface ApiFetchOptions extends RequestInit {
  driver?: ApiDriver;
  baseURL?: string;
  onProgress?: (progress: number) => void;
  _retry?: boolean;
  throwOnError?: boolean;
}

export type ApiFetchResponse<T = undefined> = ApiResponse &
  (T extends undefined ? {} : T);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

export default async function apiFetch<T = undefined>(
  path: string | URL | Request,
  options: ApiFetchOptions = {}
): Promise<ApiFetchResponse<T>> {
  const lang = i18next.language;
  const isFormData = options.body instanceof FormData;
  const isOnServerSide = typeof window === "undefined"

  const driver = options.driver ?? "fetch";
  const baseURL = typeof options.baseURL === 'string' ? options.baseURL : process.env.NEXT_PUBLIC_API_URL + '/api';

  const method = (options.method || "GET").toUpperCase();
  const authType = process.env.NEXT_PUBLIC_AUTH_TYPE || "session";

  let cookieHeader = "";
  let xsrfHeader: Record<string, string> = {};
  let tokenHeader = "";

  if (isOnServerSide) {
    const {cookies} = await import("next/headers");
    const cookieStore = await cookies();

    cookieHeader = cookieStore.toString();

    if (authType === 'token') {
      const token = cookieStore.get('auth_token')?.value;
      if (token) {
        tokenHeader = `Bearer ${token}`;
      }
    }
  } else {
    const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (authType === 'session') {
      if (isMutatingMethod) {
        const xsrfCookie = getCookie("XSRF-TOKEN");

        if (xsrfCookie) {
          xsrfHeader["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie);
        }
      }
    } else if (authType === 'token') {
      const tokenCookie = getCookie("auth_token");
      if (tokenCookie) {
        tokenHeader = `Bearer ${tokenCookie}`;
      }
    }
  }

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    "Accept": "application/json",
    "Accept-Language": lang,
    ...(options.headers as Record<string, string> || {}),
    ...xsrfHeader
  };

  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
  }

  if (tokenHeader) {
    headers["Authorization"] = tokenHeader;
  }

  const handleCsrfRetry = async () => {
    if (options._retry) {
      return null;
    }

    // CSRF Retry makes no sense in Token auth
    if (authType === 'token') {
      return null;
    }

    await apiFetch('/sanctum/csrf-cookie', {
      method: 'GET',
      baseURL: process.env.NEXT_PUBLIC_API_URL
    });

    return apiFetch<T>(path, { ...options, _retry: true });
  }

  const handleNotAuthenticated = () => {
    if (!isOnServerSide) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
  }

  // ======================================
  // 🚀 DRIVER: AXIOS
  // ======================================
  if (driver === "axios") {
    const url = `${baseURL}${path}`;
    try {
      const res = await axios({
        method,
        url,
        headers,
        data: options.body,
        withCredentials: true,
        onUploadProgress: (event) => {
          if (event.total && options.onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            options.onProgress(percent);
          }
        },
      });

      const data = res.data;
      if (data.status === ApiStatus.NOT_AUTHENTICATED) {
        handleNotAuthenticated()
      }

      return ensureSuccess(data, res.status, options.throwOnError);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error
      }

      const data = error?.response?.data
      const httpStatus = error?.response?.status;

      if (httpStatus === 419 || data?.status === 'csrf_mismatch') {
        const retry = await handleCsrfRetry();
        if (retry) return retry;
      }

      if (options.throwOnError === false) {
        return {
          status: ApiStatus.ERROR,
          message: data?.message ?? error.message ?? "Servidor indisponível"
        } as ApiFetchResponse<T>;
      }

      throw new ApiError({
        status: data?.status ?? ApiStatus.ERROR,
        message: data?.message ?? error.message ?? "Servidor indisponível",
        httpStatus: error.response?.status,
        data
      });
    }
  }

  try {
    const res = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
      cache: options.cache ?? "no-store",
      credentials: 'include'
    });

    let data: any;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.status === 419 || data?.status === 'csrf_mismatch') {
      const retry = await handleCsrfRetry();
      if (retry) return retry;
    }

    if (data?.status === ApiStatus.NOT_AUTHENTICATED) {
      handleNotAuthenticated()
    }

    return ensureSuccess(data, res.status, options.throwOnError);
  } catch (error: any) {
    if (options.throwOnError === false) {
      return {
        status: ApiStatus.ERROR,
        message: error.message ?? "Servidor indisponível",
      } as ApiFetchResponse<T>;
    }

    throw new ApiError({
      status: ApiStatus.ERROR,
      message: error.message ?? "Servidor indisponível",
    });
  }
}

function ensureSuccess<T>(
  data: any,
  httpStatus?: number,
  throwOnError = true
): T {
  if (!data || !("status" in data)) {
    throw new ApiError({
      message: `Erro inesperado da API (HTTP ${httpStatus})`,
      status: ApiStatus.ERROR,
      httpStatus
    });
  }

  if (data.status !== ApiStatus.SUCCESS) {
    if (!throwOnError) {
      return data as T;
    }

    throw new ApiError({
      message: data.message ?? "Erro desconhecido",
      status: data.status,
      httpStatus,
      data
    });
  }

  return data;
}