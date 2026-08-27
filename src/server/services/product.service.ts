import { AppError } from "@/server/errors/app-error";
import {
  mapDbProductToCard,
  mapDbProductToProduct,
} from "@/server/mappers/product.mapper";
import {
  productRepository,
  type ProductListQuery,
} from "@/server/repositories/product.repository";
import type { Product } from "@/types/product";

function mapListItem(product: Parameters<typeof mapDbProductToCard>[0]): Product {
  return mapDbProductToCard(product);
}

export class ProductService {
  async getFacets(collectionHandle?: string) {
    return productRepository.getFacets(collectionHandle);
  }

  async list(query: ProductListQuery) {
    const result = await productRepository.findMany(query);
    let items = result.items.map(mapListItem);

    if (query.sort === "price-asc") {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (query.sort === "price-desc") {
      items = [...items].sort((a, b) => b.price - a.price);
    }

    return { items, total: result.total, page: result.page, limit: result.limit };
  }

  async getByHandle(handle: string): Promise<Product> {
    const product = await productRepository.findByHandle(handle);
    if (!product?.isActive) throw new AppError("Product not found", 404);
    return mapDbProductToProduct(product);
  }

  async getRelated(handle: string): Promise<Product[]> {
    const product = await productRepository.findByHandle(handle);
    if (!product) throw new AppError("Product not found", 404);
    const related = await productRepository.findRelated(
      product.id,
      product.categoryId
    );
    return related.map((p) =>
      mapDbProductToCard({
        ...p,
        description: "",
        materials: null,
        careInstructions: null,
        shippingInfo: null,
        returnPolicy: null,
        sizeChart: null,
        createdAt: p.createdAt,
        variants: p.variants,
      })
    );
  }
}

export const productService = new ProductService();
