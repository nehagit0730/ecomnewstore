import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

/** Blob is available via static token (local) or OIDC + store id (Vercel deployments). */
export function isBlobStorageConfigured() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN) return true;
  // OIDC token is injected at runtime on Vercel when a Blob store is linked.
  if (process.env.VERCEL && process.env.BLOB_STORE_ID) return true;
  return false;
}

export async function uploadToBlobStorage(file: File, folder = "products") {
  if (!isBlobStorageConfigured()) {
    throw new Error("Image upload is not configured");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const pathname = `${folder}/${randomUUID()}.${ext}`;

  const options: Parameters<typeof put>[2] = {
    access: "public",
    contentType: file.type || "image/jpeg",
  };

  // Only pass token when set — otherwise the SDK uses OIDC on Vercel automatically.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    options.token = process.env.BLOB_READ_WRITE_TOKEN;
  }

  const blob = await put(pathname, file, options);
  return blob.url;
}
