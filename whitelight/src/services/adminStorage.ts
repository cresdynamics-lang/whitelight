import { apiFetch, getAdminToken } from "@/lib/apiClient";

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const data = await apiFetch<{ url: string }>("/api/admin/upload", {
    method: "POST",
    token: getAdminToken(),
    body: form,
  });
  return data.url;
}
