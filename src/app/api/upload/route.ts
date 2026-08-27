import { requireSuperAdminOrVendor } from "@/lib/auth-utils";
import { isBlobStorageConfigured, uploadToBlobStorage } from "@/lib/blob-storage";
import { toErrorResponse } from "@/server/errors/app-error";
import { AppError } from "@/server/errors/app-error";

export async function POST(req: Request) {
  try {
    await requireSuperAdminOrVendor();
    if (!isBlobStorageConfigured()) {
      throw new AppError(
        "Image upload is not configured. In Vercel: Storage → connect your Blob store to this project (adds BLOB_STORE_ID). For local dev: run vercel env pull.",
        503
      );
    }
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new AppError("No file provided", 400);
    }
    if (!file.type.startsWith("image/")) {
      throw new AppError("Only image files are allowed", 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError("Image must be under 5 MB", 400);
    }
    const folder = String(formData.get("folder") || "products");
    const url = await uploadToBlobStorage(file, folder);
    return Response.json({ url });
  } catch (error) {
    return toErrorResponse(error);
  }
}
