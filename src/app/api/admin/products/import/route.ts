import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { adminProductService } from "@/server/services/admin-product.service";
import { toErrorResponse } from "@/server/errors/app-error";
import type { ProductApprovalStatus } from "@prisma/client";

// Robust CSV parser supporting quotes, commas, and multiline values
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current.trim());
        current = "";
      } else if (char === "\r" && nextChar === "\n") {
        row.push(current.trim());
        current = "";
        result.push(row);
        row = [];
        i++;
      } else if (char === "\n" || char === "\r") {
        row.push(current.trim());
        current = "";
        result.push(row);
        row = [];
      } else {
        current += char;
      }
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    result.push(row);
  }

  return result.filter((r) => r.some((c) => c.length > 0));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    let records: Record<string, any>[] = [];

    if (file.name.endsWith(".json")) {
      try {
        const parsed = JSON.parse(text);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return Response.json({ error: "Invalid JSON format" }, { status: 400 });
      }
    } else {
      const parsedRows = parseCSV(text);
      if (parsedRows.length < 2) {
        return Response.json(
          { error: "CSV file is empty or missing data rows" },
          { status: 400 }
        );
      }

      const headers = parsedRows[0].map((h) =>
        h.replace(/^"|"$/g, "").trim().toLowerCase()
      );

      for (let i = 1; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const record: Record<string, string> = {};
        headers.forEach((h, idx) => {
          record[h] = row[idx] ? row[idx].replace(/^"|"$/g, "").trim() : "";
        });
        records.push(record);
      }
    }

    const results: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;

      try {
        const title = row.title || row.name;
        if (!title) {
          errors.push(`Row ${rowNum}: Product title is required.`);
          continue;
        }

        let handle = (row.handle || title)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        if (!handle) {
          handle = `product-${Date.now()}-${i}`;
        }

        const price = parseFloat(row.price) || 0;
        const compareAtPrice = row.compareatprice || row.compare_at_price
          ? parseFloat(row.compareatprice || row.compare_at_price)
          : undefined;
        const quantity = parseInt(row.quantity || row.stock) || 0;

        let approvalStatus: ProductApprovalStatus = "APPROVED";
        const rawStatus = (row.approvalstatus || row.status || "").toLowerCase();
        if (rawStatus.includes("pend")) approvalStatus = "PENDING_REVIEW";
        else if (rawStatus.includes("reject")) approvalStatus = "REJECTED";
        else if (rawStatus.includes("draft")) approvalStatus = "DRAFT";

        const categoryId = row.category
          ? await getCategoryId(String(row.category))
          : undefined;
        const vendorId = row.vendor
          ? await getVendorId(String(row.vendor))
          : undefined;

        const imageUrlsRaw = row.imageurls || row.images || row.image_urls || row.image;
        let imageUrls: string[] = [];
        if (Array.isArray(imageUrlsRaw)) {
          imageUrls = imageUrlsRaw.filter(Boolean);
        } else if (typeof imageUrlsRaw === "string") {
          imageUrls = imageUrlsRaw.split(/[;,]/).map((u) => u.trim()).filter(Boolean);
        }

        const sku =
          row.sku ||
          `SKU-${handle.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}-${i}`;

        const productData = {
          title: String(title),
          handle,
          description: String(row.description || title),
          brand: String(row.brand || "Veloire"),
          categoryId,
          vendorId,
          imageUrls,
          materials: row.materials ? String(row.materials) : undefined,
          careInstructions: row.careinstructions || row.care_instructions ? String(row.careinstructions || row.care_instructions) : undefined,
          shippingInfo: row.shippinginfo || row.shipping_info ? String(row.shippinginfo || row.shipping_info) : undefined,
          returnPolicy: row.returnpolicy || row.return_policy ? String(row.returnpolicy || row.return_policy) : undefined,
          sizeChart: row.sizechart || row.size_chart ? String(row.sizechart || row.size_chart) : undefined,
          variants: [
            {
              sku,
              barcode: row.barcode ? String(row.barcode) : undefined,
              colorName: String(row.colorname || row.color || "Standard"),
              colorHex: String(row.colorhex || "#000000"),
              colorSlug: String(row.colorslug || "standard"),
              sizeLabel: String(row.sizelabel || row.size || "Regular"),
              sizeValue: String(row.sizevalue || row.size || "Regular"),
              price: price,
              compareAtPrice: compareAtPrice,
              quantity: quantity,
            },
          ],
          approvalStatus,
          isActive: row.isactive === undefined ? true : String(row.isactive).toLowerCase() === "true",
          isFeatured: String(row.isfeatured || "").toLowerCase() === "true",
          isNew: String(row.isnew || "").toLowerCase() === "true",
          isTrending: String(row.istrending || "").toLowerCase() === "true",
          isBestSeller: String(row.isbestseller || "").toLowerCase() === "true",
        };

        const existing = await prisma.product.findUnique({
          where: { handle },
        });

        let product;
        if (existing) {
          product = await adminProductService.updateFull(existing.id, productData);
        } else {
          product = await adminProductService.create(productData);
        }

        results.push(product);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Processing error";
        errors.push(`Row ${rowNum}: ${errorMsg}`);
        console.error(`Import row ${rowNum} error:`, error);
      }
    }

    return Response.json({
      success: true,
      imported: results.length,
      totalRows: records.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Import error:", error);
    return toErrorResponse(error);
  }
}

async function getCategoryId(name: string) {
  if (!name || name === "—") return undefined;
  const category = await prisma.category.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: "insensitive",
      },
    },
  });
  if (category) return category.id;

  // Create category if it doesn't exist
  try {
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newCat = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
      },
    });
    return newCat.id;
  } catch {
    return undefined;
  }
}

async function getVendorId(name: string) {
  if (!name || name === "Platform" || name === "—") return undefined;
  const vendor = await prisma.vendor.findFirst({
    where: {
      shopName: {
        equals: name.trim(),
        mode: "insensitive",
      },
    },
  });
  return vendor?.id;
}