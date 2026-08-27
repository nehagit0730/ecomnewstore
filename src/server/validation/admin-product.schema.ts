import { z } from "zod";

const variantSchema = z.object({
  sku: z.string().min(1),
  colorName: z.string().min(1),
  colorHex: z.string().optional(),
  colorSlug: z.string().min(1),
  sizeLabel: z.string().min(1),
  sizeValue: z.string().min(1),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  barcode: z.string().optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(2),
  handle: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  brand: z.string().min(1),
  categoryId: z.string().optional(),
  vendorId: z.string().optional(),
  materials: z.string().optional(),
  careInstructions: z.string().optional(),
  shippingInfo: z.string().optional(),
  returnPolicy: z.string().optional(),
  sizeChart: z.string().optional(),
  imageUrls: z.array(z.string().url()).min(1),
  variants: z.array(variantSchema).min(1),
  approvalStatus: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"]).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema;

export const productFlagsSchema = z.object({
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  approvalStatus: z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"]).optional(),
});

export const rejectProductSchema = z.object({
  reason: z.string().min(3),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
