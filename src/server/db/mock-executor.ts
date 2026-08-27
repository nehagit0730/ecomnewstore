import { createMockDb, MockDb } from "./mock-db";

const globalForMock = globalThis as unknown as { mockDb?: MockDb };
if (!globalForMock.mockDb) {
  globalForMock.mockDb = createMockDb();
}
export const mockDb = globalForMock.mockDb;

function matchesWhere(item: any, where?: Record<string, any>, db: MockDb = mockDb): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(val)) {
      const orMatch = val.some((subWhere) => matchesWhere(item, subWhere, db));
      if (!orMatch) return false;
      continue;
    }
    if (key === "AND" && Array.isArray(val)) {
      const andMatch = val.every((subWhere) => matchesWhere(item, subWhere, db));
      if (!andMatch) return false;
      continue;
    }
    if (key === "NOT") {
      if (Array.isArray(val)) {
        const notMatch = val.some((subWhere) => matchesWhere(item, subWhere, db));
        if (notMatch) return false;
      } else if (val && typeof val === "object") {
        if (matchesWhere(item, val, db)) return false;
      }
      continue;
    }

    // Compound unique keys like `collectionId_productId: { collectionId, productId }`
    if (key.includes("_") && val && typeof val === "object" && !Array.isArray(val)) {
      const partsMatch = Object.entries(val).every(([subK, subV]) => item[subK] === subV);
      if (!partsMatch) return false;
      continue;
    }

    const itemVal = item[key];

    if (val === null || val === undefined) {
      if (itemVal !== null && itemVal !== undefined) return false;
      continue;
    }

    if (typeof val === "object" && !(val instanceof Date) && !Array.isArray(val)) {
      // Comparison operators
      if ("equals" in val) {
        if (val.mode === "insensitive" && typeof itemVal === "string" && typeof val.equals === "string") {
          if (itemVal.toLowerCase() !== val.equals.toLowerCase()) return false;
        } else if (itemVal !== val.equals) {
          return false;
        }
      }
      if ("in" in val && Array.isArray(val.in)) {
        if (!val.in.includes(itemVal)) return false;
      }
      if ("notIn" in val && Array.isArray(val.notIn)) {
        if (val.notIn.includes(itemVal)) return false;
      }
      if ("not" in val) {
        if (itemVal === val.not) return false;
      }
      if ("contains" in val && typeof val.contains === "string") {
        const needle = val.mode === "insensitive" ? val.contains.toLowerCase() : val.contains;
        const haystack = val.mode === "insensitive" ? String(itemVal ?? "").toLowerCase() : String(itemVal ?? "");
        if (!haystack.includes(needle)) return false;
      }
      if ("startsWith" in val && typeof val.startsWith === "string") {
        const needle = val.mode === "insensitive" ? val.startsWith.toLowerCase() : val.startsWith;
        const haystack = val.mode === "insensitive" ? String(itemVal ?? "").toLowerCase() : String(itemVal ?? "");
        if (!haystack.startsWith(needle)) return false;
      }
      if ("endsWith" in val && typeof val.endsWith === "string") {
        const needle = val.mode === "insensitive" ? val.endsWith.toLowerCase() : val.endsWith;
        const haystack = val.mode === "insensitive" ? String(itemVal ?? "").toLowerCase() : String(itemVal ?? "");
        if (!haystack.endsWith(needle)) return false;
      }
      if ("gt" in val && !(itemVal > val.gt)) return false;
      if ("gte" in val && !(itemVal >= val.gte)) return false;
      if ("lt" in val && !(itemVal < val.lt)) return false;
      if ("lte" in val && !(itemVal <= val.lte)) return false;

      // Relation filters like `{ vendor: { status: 'ACTIVE' } }`
      if (key === "vendor" && item.vendorId) {
        const v = db.vendor.find((x) => x.id === item.vendorId);
        if (!v || !matchesWhere(v, val, db)) return false;
      }
      if (key === "category" && item.categoryId) {
        const c = db.category.find((x) => x.id === item.categoryId);
        if (!c || !matchesWhere(c, val, db)) return false;
      }
      if (key === "user" && item.userId) {
        const u = db.user.find((x) => x.id === item.userId);
        if (!u || !matchesWhere(u, val, db)) return false;
      }
      if (key === "product" && item.productId) {
        const p = db.product.find((x) => x.id === item.productId);
        if (!p || !matchesWhere(p, val, db)) return false;
      }
      if (key === "variants" && val.some) {
        const prodVariants = db.productVariant.filter((v) => v.productId === item.id);
        const hasSome = prodVariants.some((v) => matchesWhere(v, val.some, db));
        if (!hasSome) return false;
      }
    } else {
      if (itemVal !== val) return false;
    }
  }

  return true;
}

function resolveInclude(model: string, item: any, include?: Record<string, any>, db: MockDb = mockDb): any {
  if (!include || !item) return item;
  const clone = { ...item };

  for (const [rel, opt] of Object.entries(include)) {
    if (!opt) continue;
    const subInclude = typeof opt === "object" ? opt.include : undefined;
    const subWhere = typeof opt === "object" ? opt.where : undefined;
    const subSelect = typeof opt === "object" ? opt.select : undefined;
    const subTake = typeof opt === "object" ? opt.take : undefined;
    const subOrderBy = typeof opt === "object" ? opt.orderBy : undefined;

    if (model === "product") {
      if (rel === "images") {
        let imgs = db.productImage.filter((img) => img.productId === item.id);
        if (subWhere) imgs = imgs.filter((i) => matchesWhere(i, subWhere, db));
        if (subOrderBy?.sortOrder === "asc") imgs.sort((a, b) => a.sortOrder - b.sortOrder);
        if (subTake) imgs = imgs.slice(0, subTake);
        clone.images = imgs;
      }
      if (rel === "variants") {
        let vars = db.productVariant.filter((v) => v.productId === item.id);
        if (subWhere) vars = vars.filter((v) => matchesWhere(v, subWhere, db));
        if (subTake) vars = vars.slice(0, subTake);
        clone.variants = vars.map((v) => resolveInclude("productVariant", v, subInclude, db));
      }
      if (rel === "category") {
        const cat = db.category.find((c) => c.id === item.categoryId) ?? null;
        clone.category = cat && subSelect ? projectSelect(cat, subSelect) : cat;
      }
      if (rel === "vendor") {
        const v = db.vendor.find((vend) => vend.id === item.vendorId) ?? null;
        clone.vendor = v && subSelect ? projectSelect(v, subSelect) : v;
      }
      if (rel === "collections") {
        const colLinks = db.collectionProduct.filter((cp) => cp.productId === item.id);
        clone.collections = colLinks.map((cp) => {
          const col = db.collection.find((c) => c.id === cp.collectionId);
          return {
            ...cp,
            collection: col && subInclude?.collection ? resolveInclude("collection", col, subInclude.collection.include, db) : col,
          };
        });
      }
      if (rel === "reviews") {
        let revs = db.review.filter((r) => r.productId === item.id);
        if (subWhere) revs = revs.filter((r) => matchesWhere(r, subWhere, db));
        clone.reviews = revs.map((r) => resolveInclude("review", r, subInclude, db));
      }
    }

    if (model === "productVariant") {
      if (rel === "inventory") {
        clone.inventory = db.inventory.find((inv) => inv.variantId === item.id) ?? null;
      }
      if (rel === "product") {
        const p = db.product.find((x) => x.id === item.productId) ?? null;
        clone.product = p && subInclude ? resolveInclude("product", p, subInclude, db) : p;
      }
    }

    if (model === "collection") {
      if (rel === "products") {
        let links = db.collectionProduct.filter((cp) => cp.collectionId === item.id);
        if (subOrderBy?.sortOrder === "asc") links.sort((a, b) => a.sortOrder - b.sortOrder);
        clone.products = links.map((cp) => {
          const p = db.product.find((x) => x.id === cp.productId);
          return {
            ...cp,
            product: p ? resolveInclude("product", p, opt.include?.product?.include ?? { images: { take: 1 }, variants: { take: 1 } }, db) : null,
          };
        });
      }
      if (rel === "_count") {
        const count = db.collectionProduct.filter((cp) => cp.collectionId === item.id).length;
        clone._count = { products: count };
      }
    }

    if (model === "category") {
      if (rel === "_count") {
        const count = db.product.filter((p) => p.categoryId === item.id).length;
        clone._count = { products: count };
      }
      if (rel === "products") {
        clone.products = db.product.filter((p) => p.categoryId === item.id);
      }
    }

    if (model === "user") {
      if (rel === "vendor") {
        clone.vendor = db.vendor.find((v) => v.userId === item.id) ?? null;
      }
      if (rel === "cart") {
        clone.cart = db.cart.find((c) => c.userId === item.id) ?? null;
      }
      if (rel === "addresses") {
        clone.addresses = db.address.filter((a) => a.userId === item.id);
      }
      if (rel === "orders") {
        clone.orders = db.order.filter((o) => o.userId === item.id);
      }
    }

    if (model === "vendor") {
      if (rel === "user") {
        clone.user = db.user.find((u) => u.id === item.userId) ?? null;
      }
      if (rel === "products") {
        clone.products = db.product.filter((p) => p.vendorId === item.id);
      }
      if (rel === "_count") {
        const prodCount = db.product.filter((p) => p.vendorId === item.id).length;
        clone._count = { products: prodCount };
      }
    }

    if (model === "review") {
      if (rel === "user") {
        const u = db.user.find((x) => x.id === item.userId) ?? null;
        clone.user = u && subSelect ? projectSelect(u, subSelect) : u;
      }
      if (rel === "product") {
        clone.product = db.product.find((p) => p.id === item.productId) ?? null;
      }
    }

    if (model === "cart") {
      if (rel === "items") {
        clone.items = db.cartItem.filter((ci) => ci.cartId === item.id);
      }
    }

    if (model === "order") {
      if (rel === "items") {
        clone.items = db.orderItem.filter((oi) => oi.orderId === item.id);
      }
      if (rel === "shippingAddress") {
        clone.shippingAddress = db.orderAddress.find((oa) => oa.orderId === item.id && oa.type === "SHIPPING") ?? null;
      }
      if (rel === "billingAddress") {
        clone.billingAddress = db.orderAddress.find((oa) => oa.orderId === item.id && oa.type === "BILLING") ?? null;
      }
      if (rel === "payment") {
        clone.payment = db.payment.find((p) => p.orderId === item.id) ?? null;
      }
      if (rel === "shipments") {
        clone.shipments = db.shipment.filter((s) => s.orderId === item.id);
      }
      if (rel === "user") {
        const u = db.user.find((x) => x.id === item.userId) ?? null;
        clone.user = u && subSelect ? projectSelect(u, subSelect) : u;
      }
    }
  }

  return clone;
}

function projectSelect(item: any, select?: Record<string, any>): any {
  if (!select || !item) return item;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) {
      out[k] = item[k];
    }
  }
  return out;
}

export function executeMockQuery(model: string, action: string, args: any = {}): any {
  const table = mockDb[model] || [];

  switch (action) {
    case "findMany": {
      let items = table.filter((item) => matchesWhere(item, args.where, mockDb));
      if (args.orderBy) {
        const orderList = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        items.sort((a, b) => {
          for (const ord of orderList) {
            const [field, dir] = Object.entries(ord)[0];
            const valA = a[field];
            const valB = b[field];
            if (valA < valB) return dir === "asc" ? -1 : 1;
            if (valA > valB) return dir === "asc" ? 1 : -1;
          }
          return 0;
        });
      }
      if (args.skip) {
        items = items.slice(args.skip);
      }
      if (args.take) {
        items = items.slice(0, args.take);
      }
      return items.map((item) => {
        let res = resolveInclude(model, item, args.include, mockDb);
        if (args.select) res = projectSelect(res, args.select);
        return res;
      });
    }

    case "findFirst":
    case "findUnique": {
      let items = table.filter((item) => matchesWhere(item, args.where, mockDb));
      if (args.orderBy && action === "findFirst") {
        const orderList = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        items.sort((a, b) => {
          for (const ord of orderList) {
            const [field, dir] = Object.entries(ord)[0];
            const valA = a[field];
            const valB = b[field];
            if (valA < valB) return dir === "asc" ? -1 : 1;
            if (valA > valB) return dir === "asc" ? 1 : -1;
          }
          return 0;
        });
      }
      const item = items[0] ?? null;
      if (!item) return null;
      let res = resolveInclude(model, item, args.include, mockDb);
      if (args.select) res = projectSelect(res, args.select);
      return res;
    }

    case "count": {
      const items = table.filter((item) => matchesWhere(item, args.where, mockDb));
      return items.length;
    }

    case "aggregate": {
      const items = table.filter((item) => matchesWhere(item, args.where, mockDb));
      const res: any = { _count: items.length };
      if (args._avg?.rating) {
        const sum = items.reduce((acc, i) => acc + (i.rating || 0), 0);
        res._avg = { rating: items.length ? sum / items.length : 0 };
      }
      if (args._sum) {
        res._sum = {};
        for (const k of Object.keys(args._sum)) {
          res._sum[k] = items.reduce((acc, i) => acc + (Number(i[k]) || 0), 0);
        }
      }
      return res;
    }

    case "create": {
      const id = args.data.id || `${model}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const newItem: any = {
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      for (const [k, v] of Object.entries(args.data)) {
        if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
          if ("create" in v) {
            // Nested create
            const createData = (v as any).create;
            if (Array.isArray(createData)) {
              createData.forEach((subItem) => {
                if (k === "images") executeMockQuery("productImage", "create", { data: { ...subItem, productId: id } });
                if (k === "variants") executeMockQuery("productVariant", "create", { data: { ...subItem, productId: id } });
              });
            } else if (createData) {
              if (k === "cart") executeMockQuery("cart", "create", { data: { ...createData, userId: id } });
              if (k === "inventory") executeMockQuery("inventory", "create", { data: { ...createData, variantId: id } });
            }
          } else {
            newItem[k] = v;
          }
        } else {
          newItem[k] = v;
        }
      }

      if (!mockDb[model]) mockDb[model] = [];
      mockDb[model].push(newItem);

      let res = resolveInclude(model, newItem, args.include, mockDb);
      if (args.select) res = projectSelect(res, args.select);
      return res;
    }

    case "update": {
      const idx = table.findIndex((item) => matchesWhere(item, args.where, mockDb));
      if (idx === -1) {
        throw new Error(`Record to update not found on model ${model}`);
      }
      const existing = table[idx];
      const updated = { ...existing, updatedAt: new Date() };

      for (const [k, v] of Object.entries(args.data)) {
        if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
          if ("increment" in v) {
            updated[k] = (Number(updated[k]) || 0) + (v as any).increment;
          } else if ("decrement" in v) {
            updated[k] = (Number(updated[k]) || 0) - (v as any).decrement;
          } else {
            updated[k] = v;
          }
        } else {
          updated[k] = v;
        }
      }

      table[idx] = updated;
      let res = resolveInclude(model, updated, args.include, mockDb);
      if (args.select) res = projectSelect(res, args.select);
      return res;
    }

    case "upsert": {
      const existing = table.find((item) => matchesWhere(item, args.where, mockDb));
      if (existing) {
        return executeMockQuery(model, "update", {
          where: args.where,
          data: args.update,
          include: args.include,
          select: args.select,
        });
      } else {
        return executeMockQuery(model, "create", {
          data: args.create,
          include: args.include,
          select: args.select,
        });
      }
    }

    case "delete": {
      const idx = table.findIndex((item) => matchesWhere(item, args.where, mockDb));
      if (idx !== -1) {
        const deleted = table.splice(idx, 1)[0];
        return deleted;
      }
      return {};
    }

    case "deleteMany": {
      let count = 0;
      for (let i = table.length - 1; i >= 0; i--) {
        if (matchesWhere(table[i], args.where, mockDb)) {
          table.splice(i, 1);
          count++;
        }
      }
      return { count };
    }

    case "updateMany": {
      let count = 0;
      for (let i = 0; i < table.length; i++) {
        if (matchesWhere(table[i], args.where, mockDb)) {
          table[i] = { ...table[i], ...args.data, updatedAt: new Date() };
          count++;
        }
      }
      return { count };
    }

    default:
      return null;
  }
}
