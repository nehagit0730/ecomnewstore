import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { adminProductService } from "@/server/services/admin-product.service";
import { toErrorResponse } from "@/server/errors/app-error";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isTemplate = searchParams.get("template") === "true";
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    if (isTemplate) {
      const templateData = [
        {
          title: "Silk Embroidered Sherwani",
          handle: "silk-embroidered-sherwani",
          description: "Handcrafted pure silk sherwani with intricate zardozi hand embroidery.",
          brand: "Veloire Atelier",
          category: "Menswear",
          vendor: "Platform",
          approvalStatus: "APPROVED",
          isActive: "true",
          isFeatured: "true",
          price: 24999,
          compareAtPrice: 29999,
          sku: "VEL-SHER-001",
          barcode: "8901234567890",
          quantity: 25,
          colorName: "Royal Ivory",
          colorHex: "#F5F2EB",
          sizeLabel: "L",
          sizeValue: "42",
          imageUrls: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800",
          materials: "100% Pure Silk, Zardozi Thread",
          careInstructions: "Dry clean only. Store in garment bag.",
          shippingInfo: "Complimentary express delivery in 3-5 business days.",
          returnPolicy: "7 days return policy for unworn items with security tags.",
        },
        {
          title: "Raw Silk Anarkali Gown",
          handle: "raw-silk-anarkali-gown",
          description: "Flowing floor-length Anarkali with heritage gota patti work.",
          brand: "Veloire Couture",
          category: "Womenswear",
          vendor: "Platform",
          approvalStatus: "APPROVED",
          isActive: "true",
          isFeatured: "false",
          price: 18999,
          compareAtPrice: 22999,
          sku: "VEL-ANAR-002",
          barcode: "8901234567891",
          quantity: 15,
          colorName: "Emerald Green",
          colorHex: "#0D5C3A",
          sizeLabel: "M",
          sizeValue: "38",
          imageUrls: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
          materials: "Raw Silk, Net Dupatta",
          careInstructions: "Professional dry clean only.",
          shippingInfo: "Ships within 48 hours.",
          returnPolicy: "Hassle-free 7-day exchanges.",
        },
      ];

      const headers = Object.keys(templateData[0]);
      const csvRows = [
        headers.join(","),
        ...templateData.map((row) =>
          headers
            .map((h) => {
              const val = row[h as keyof typeof row] ?? "";
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ];

      return new Response(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=veloire-products-template.csv`,
        },
      });
    }

    let products;
    if (ids.length > 0) {
      products = await adminProductService.getByIds(ids);
    } else {
      products = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          vendor: { select: { id: true, shopName: true } },
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" } },
          variants: { include: { inventory: true } },
          _count: { select: { variants: true } },
        },
      });
    }

    // Transform to CSV format
    const csvData = products.map((p) => {
      const primaryVariant = p.variants[0];
      const totalInventory = p.variants.reduce(
        (sum, v) => sum + (v.inventory?.quantity || 0),
        0
      );

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        brand: p.brand || "",
        category: p.category?.name || "",
        vendor: p.vendor?.shopName || "Platform",
        approvalStatus: p.approvalStatus,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isTrending: p.isTrending,
        isBestSeller: p.isBestSeller,
        price: primaryVariant?.price ? Number(primaryVariant.price) : "",
        compareAtPrice: primaryVariant?.compareAtPrice ? Number(primaryVariant.compareAtPrice) : "",
        sku: primaryVariant?.sku || "",
        barcode: primaryVariant?.barcode || "",
        quantity: totalInventory,
        colorName: primaryVariant?.colorName || "",
        colorHex: primaryVariant?.colorHex || "",
        sizeLabel: primaryVariant?.sizeLabel || "",
        sizeValue: primaryVariant?.sizeValue || "",
        imageUrls: p.images.map((img) => img.url).join(";"),
        materials: p.materials || "",
        careInstructions: p.careInstructions || "",
        shippingInfo: p.shippingInfo || "",
        returnPolicy: p.returnPolicy || "",
        sizeChart: p.sizeChart || "",
      };
    });

    if (csvData.length === 0) {
      return new Response("id,title,handle,description,price,sku,quantity,category,vendor\n", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=products-empty.csv`,
        },
      });
    }

    // Convert to CSV
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            return `"${String(value ?? "").replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ];

    const csv = csvRows.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=products-export-${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}