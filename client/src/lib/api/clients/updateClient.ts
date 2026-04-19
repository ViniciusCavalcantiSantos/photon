import {UploadFile} from "antd";
import {objectToFormData} from "@/lib/objectToFormData";
import apiFetch from "@/lib/apiFetch";
import type { UpdateClientResponse } from "@/types/api-contracts";

export async function updateClient(id: number, values: any, profile: UploadFile) {
  const formData = objectToFormData(values)
  if (profile.originFileObj) {
    formData.append("profile", profile.originFileObj);
  }

  formData.append("_method", "PUT");
  return await apiFetch<UpdateClientResponse>(`/clients/${id}`, {
    method: "POST",
    body: formData
  });
}
