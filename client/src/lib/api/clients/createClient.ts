import {UploadFile} from "antd";
import {objectToFormData} from "@/lib/objectToFormData";
import apiFetch from "@/lib/apiFetch";
import type {
  CreateClientResponse,
  CreatePublicClientResponse,
} from "@/types/api-contracts";

export async function createClient(
  values: any,
  profile: UploadFile | File | Blob,
  onProgress?: (progress: number) => void
) {
  const formData = objectToFormData(values, {'profile': profile})

  return apiFetch<CreateClientResponse>("/clients", {
    method: "POST",
    body: formData,
    driver: 'axios',
    onProgress
  });
}

export async function createClientPublic(
  linkId: string,
  values: any,
  profile: UploadFile | File | Blob,
  onProgress?: (progress: number) => void
) {
  const formData = objectToFormData(values, {'profile': profile})

  return apiFetch<CreatePublicClientResponse>(`/public/clients/register/${linkId}`, {
    method: "POST",
    body: formData,
    driver: 'axios',
    onProgress
  });
}
