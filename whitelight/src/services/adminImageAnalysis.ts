import { apiFetch, getAdminToken, isApiMode } from "@/lib/apiClient";

export type ProductImageAnalysis = {
  description: string;
  altText: string;
  suggestedTags: string[];
  suggestedName: string;
  suggestedBrand: string;
  provider?: string;
  model?: string;
};

export type AiStatus = {
  configured: boolean;
  groq?: { configured: boolean; model: string };
  gemini?: { configured: boolean; model: string };
  provider?: string | null;
  fallback?: boolean;
  model?: string;
};

export async function getAiStatus(): Promise<AiStatus | null> {
  if (!isApiMode()) return null;
  try {
    return await apiFetch<AiStatus>("/api/admin/ai/status", {
      token: getAdminToken(),
    });
  } catch {
    return null;
  }
}

export async function analyzeProductImage(params: {
  imageUrl: string;
  name?: string;
  brand?: string;
  category?: string;
  sizes?: Array<number | string>;
}): Promise<ProductImageAnalysis> {
  if (!isApiMode()) {
    throw new Error("AI image analysis requires the Node API (VITE_API_BASE_URL)");
  }
  return apiFetch<ProductImageAnalysis>("/api/admin/analyze-image", {
    method: "POST",
    token: getAdminToken(),
    body: JSON.stringify(params),
  });
}
