"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-fetch";
import { ApprovalBadge } from "@/components/admin/approval-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Trash2,
  ExternalLink,
  Edit3,
  Eye,
  SlidersHorizontal,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { ProductApprovalStatus } from "@prisma/client";

export interface ProductVariantData {
  id: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  barcode?: string | null;
  colorName: string;
  colorHex?: string | null;
  colorSlug: string;
  sizeLabel: string;
  sizeValue: string;
  inventory?: { quantity: number } | null;
}

export interface ProductData {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  brand?: string | null;
  materials?: string | null;
  shippingInfo?: string | null;
  returnPolicy?: string | null;
  vendor?: { id?: string; shopName: string } | null;
  category?: { id?: string; name: string } | null;
  approvalStatus: string;
  isActive: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  variants: ProductVariantData[];
  images: Array<{ id: string; url: string; alt?: string | null }>;
  _count?: { variants: number; reviews?: number };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ProductTableProps {
  products: ProductData[];
  categories?: Array<{ id: string; name: string }>;
  vendors?: Array<{ id: string; shopName: string }>;
  onRefresh?: () => void;
}

export function ProductTable({
  products: initialProducts,
  categories = [],
  onRefresh,
}: ProductTableProps) {
  const router = useRouter();

  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<ProductData | null>(null);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("ALL");
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("updated_desc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Quick Preview Modal
  const [previewProduct, setPreviewProduct] = useState<ProductData | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Derived metrics
  const totalProducts = initialProducts.length;
  const activeProducts = initialProducts.filter((p) => p.isActive).length;
  const pendingProducts = initialProducts.filter(
    (p) => p.approvalStatus === "PENDING_REVIEW"
  ).length;
  const lowStockProducts = initialProducts.filter((p) => {
    const totalQty = p.variants.reduce(
      (sum, v) => sum + (v.inventory?.quantity || 0),
      0
    );
    return totalQty <= 5;
  }).length;

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesHandle = product.handle.toLowerCase().includes(q);
        const matchesBrand = product.brand?.toLowerCase().includes(q);
        const matchesCategory = product.category?.name?.toLowerCase().includes(q);
        const matchesVendor = product.vendor?.shopName?.toLowerCase().includes(q);
        const matchesSku = product.variants.some((v) =>
          v.sku.toLowerCase().includes(q)
        );
        if (
          !matchesTitle &&
          !matchesHandle &&
          !matchesBrand &&
          !matchesCategory &&
          !matchesVendor &&
          !matchesSku
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "ALL") {
        if (product.category?.name !== selectedCategory) return false;
      }

      // Approval Status filter
      if (selectedStatus !== "ALL") {
        if (product.approvalStatus !== selectedStatus) return false;
      }

      // Active status filter
      if (selectedActiveStatus !== "ALL") {
        const isActiveExpected = selectedActiveStatus === "ACTIVE";
        if (product.isActive !== isActiveExpected) return false;
      }

      // Stock status filter
      if (selectedStockStatus !== "ALL") {
        const totalQty = product.variants.reduce(
          (sum, v) => sum + (v.inventory?.quantity || 0),
          0
        );
        if (selectedStockStatus === "OUT_OF_STOCK" && totalQty > 0) return false;
        if (selectedStockStatus === "LOW_STOCK" && (totalQty > 5 || totalQty === 0))
          return false;
        if (selectedStockStatus === "IN_STOCK" && totalQty <= 0) return false;
      }

      return true;
    });
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedActiveStatus,
    selectedStockStatus,
  ]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      const priceA = a.variants[0]?.price ? Number(a.variants[0].price) : 0;
      const priceB = b.variants[0]?.price ? Number(b.variants[0].price) : 0;
      const stockA = a.variants.reduce(
        (sum, v) => sum + (v.inventory?.quantity || 0),
        0
      );
      const stockB = b.variants.reduce(
        (sum, v) => sum + (v.inventory?.quantity || 0),
        0
      );

      switch (sortBy) {
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "price_asc":
          return priceA - priceB;
        case "price_desc":
          return priceB - priceA;
        case "stock_asc":
          return stockA - stockB;
        case "stock_desc":
          return stockB - stockA;
        case "updated_desc":
        default:
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
      }
    });
    return list;
  }, [filteredProducts, sortBy]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // Selection handlers
  const isAllCurrentPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.has(p.id));

  const toggleSelectAllCurrentPage = () => {
    const newSet = new Set(selectedIds);
    if (isAllCurrentPageSelected) {
      paginatedProducts.forEach((p) => newSet.delete(p.id));
    } else {
      paginatedProducts.forEach((p) => newSet.add(p.id));
    }
    setSelectedIds(newSet);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setDeleting(true);
    try {
      const result = await adminFetch<{ deletedCount: number }>(
        "/api/admin/products/bulk",
        {
          method: "DELETE",
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        }
      );

      toast.success(
        `Successfully deleted ${result.deletedCount || selectedIds.size} products`
      );
      setSelectedIds(new Set());
      setBulkDeleteModalOpen(false);
      if (onRefresh) onRefresh();
      router.refresh();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete selected products"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Single Delete
  const handleSingleDelete = async () => {
    if (!singleDeleteTarget) return;

    setDeleting(true);
    try {
      await adminFetch<{ ok: boolean }>(
        `/api/admin/products/${singleDeleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      toast.success(`Product "${singleDeleteTarget.title}" deleted`);
      const newSet = new Set(selectedIds);
      newSet.delete(singleDeleteTarget.id);
      setSelectedIds(newSet);
      setSingleDeleteTarget(null);
      if (onRefresh) onRefresh();
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Export Selected
  const handleExportSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const url = `/api/admin/products/export?ids=${Array.from(selectedIds).join(
        ","
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `products-selected-${selectedIds.size}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Exported ${selectedIds.size} selected products to CSV`);
    } catch {
      toast.error("Failed to export selected products");
    }
  };

  // Unique categories list for filtering
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    categories.forEach((c) => cats.add(c.name));
    return Array.from(cats);
  }, [initialProducts, categories]);

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card/60 p-4 backdrop-blur-xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Catalog
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-foreground">
            {totalProducts}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {activeProducts} live on storefront
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4 backdrop-blur-xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live & Active
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-emerald-700">
            {activeProducts}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalProducts > 0
              ? `${Math.round((activeProducts / totalProducts) * 100)}% available`
              : "0%"}
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4 backdrop-blur-xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pending Review
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-amber-700">
            {pendingProducts}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {pendingProducts > 0 ? "Awaiting admin approval" : "All approved"}
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4 backdrop-blur-xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-rose-700">
            {lowStockProducts}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            ≤ 5 items remaining
          </p>
        </div>
      </div>

      {/* 2. Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/95 px-4 py-3 text-primary-foreground shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {selectedIds.size}
            </div>
            <span className="text-sm font-medium">
              {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSelected}
              className="h-8 gap-1.5 text-xs bg-white/15 hover:bg-white/25 text-white border-0"
            >
              <Download className="h-3.5 w-3.5" />
              Export ({selectedIds.size})
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="h-8 gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedIds.size})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Deselect
            </Button>
          </div>
        </div>
      )}

      {/* 3. Search, Filter & Controls Header */}
      <div className="rounded-xl border bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by title, SKU, handle, category, vendor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-9 h-10 bg-background"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Toggles & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center rounded-lg border bg-background p-0.5">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5"
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5"
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {(selectedCategory !== "ALL" ||
              selectedStatus !== "ALL" ||
              selectedStockStatus !== "ALL" ||
              selectedActiveStatus !== "ALL" ||
              searchQuery !== "") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setSelectedStatus("ALL");
                  setSelectedStockStatus("ALL");
                  setSelectedActiveStatus("ALL");
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 pt-1 text-xs">
          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Approval Status */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Approval Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Approvals</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Stock Status */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Inventory Stock
            </label>
            <select
              value={selectedStockStatus}
              onChange={(e) => {
                setSelectedStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt; 0)</option>
              <option value="LOW_STOCK">Low Stock (≤ 5)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>

          {/* Active / Visibility */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Store Visibility
            </label>
            <select
              value={selectedActiveStatus}
              onChange={(e) => {
                setSelectedActiveStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Visibility</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="INACTIVE">Hidden / Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="updated_desc">Recently Updated</option>
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Products View (Table or Grid) */}
      {paginatedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-card">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-medium">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            {searchQuery ||
            selectedCategory !== "ALL" ||
            selectedStatus !== "ALL" ||
            selectedStockStatus !== "ALL"
              ? "Try adjusting your search query or filters to find what you are looking for."
              : "Your catalog is empty. Create your first product or import a CSV file."}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="luxury" asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Add New Product
              </Link>
            </Button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b select-none">
                <tr>
                  <th className="w-12 p-3.5 text-center">
                    <Checkbox
                      checked={isAllCurrentPageSelected}
                      onCheckedChange={toggleSelectAllCurrentPage}
                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="p-3.5 min-w-[280px]">Product</th>
                  <th className="p-3.5 min-w-[130px]">Category / Vendor</th>
                  <th className="p-3.5 min-w-[120px]">Price</th>
                  <th className="p-3.5 min-w-[130px]">Inventory</th>
                  <th className="p-3.5 min-w-[100px]">Approval</th>
                  <th className="p-3.5 min-w-[90px]">Status</th>
                  <th className="p-3.5 text-right min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProducts.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  const primaryVariant = p.variants[0];
                  const totalStock = p.variants.reduce(
                    (sum, v) => sum + (v.inventory?.quantity || 0),
                    0
                  );
                  const price = primaryVariant?.price ? Number(primaryVariant.price) : 0;
                  const comparePrice = primaryVariant?.compareAtPrice
                    ? Number(primaryVariant.compareAtPrice)
                    : null;
                  const thumbnail = p.images[0]?.url;

                  return (
                    <tr
                      key={p.id}
                      className={`group transition-colors hover:bg-muted/30 ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(p.id)}
                          aria-label={`Select ${p.title}`}
                        />
                      </td>

                      {/* Product details with thumbnail */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-muted/30">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt={p.title}
                                fill
                                sizes="48px"
                                className="object-cover transition-transform group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/admin/products/${p.id}`}
                                className="font-medium text-foreground hover:underline truncate block"
                                title={p.title}
                              >
                                {p.title}
                              </Link>
                              {p.isFeatured && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 px-1 text-[9px] bg-amber-100 text-amber-900 border-amber-200"
                                >
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="font-mono text-[11px]">
                                {primaryVariant?.sku || p.handle}
                              </span>
                              <span>•</span>
                              <span>
                                {p._count?.variants || p.variants.length} variant
                                {(p._count?.variants || p.variants.length) > 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Vendor */}
                      <td className="p-3.5 text-xs">
                        <div className="space-y-1">
                          <span className="inline-block rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                            {p.category?.name || "Uncategorized"}
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            {p.vendor?.shopName || "Platform / In-house"}
                          </p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 text-xs">
                        <div className="font-medium text-foreground">
                          {price > 0 ? formatPrice(price) : "—"}
                        </div>
                        {comparePrice && comparePrice > price && (
                          <div className="text-[11px] text-muted-foreground line-through">
                            {formatPrice(comparePrice)}
                          </div>
                        )}
                      </td>

                      {/* Inventory Stock */}
                      <td className="p-3.5 text-xs">
                        <div className="space-y-1.5 max-w-[120px]">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold ${
                                totalStock === 0
                                  ? "text-rose-600"
                                  : totalStock <= 5
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {totalStock} in stock
                            </span>
                          </div>
                          {/* Mini visual stock bar */}
                          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                totalStock === 0
                                  ? "bg-rose-500 w-0"
                                  : totalStock <= 5
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (totalStock / 20) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="p-3.5">
                        <ApprovalBadge
                          status={p.approvalStatus as ProductApprovalStatus}
                        />
                      </td>

                      {/* Active Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-muted text-muted-foreground border"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.isActive ? "bg-emerald-500" : "bg-muted-foreground"
                            }`}
                          />
                          {p.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Preview */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setPreviewProduct(p)}
                            title="Quick Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            asChild
                            title="Edit Product"
                          >
                            <Link href={`/admin/products/${p.id}`}>
                              <Edit3 className="h-4 w-4" />
                            </Link>
                          </Button>

                          {/* Live Storefront Link */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            asChild
                            title="View on Storefront"
                          >
                            <Link
                              href={`/products/${p.handle}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>

                          {/* Single Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setSingleDeleteTarget(p)}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProducts.map((p) => {
            const isSelected = selectedIds.has(p.id);
            const primaryVariant = p.variants[0];
            const totalStock = p.variants.reduce(
              (sum, v) => sum + (v.inventory?.quantity || 0),
              0
            );
            const price = primaryVariant?.price ? Number(primaryVariant.price) : 0;
            const thumbnail = p.images[0]?.url;

            return (
              <div
                key={p.id}
                className={`group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md ${
                  isSelected ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                {/* Selection Checkbox floating at top left */}
                <div className="absolute left-3 top-3 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(p.id)}
                    className="bg-background/90 backdrop-blur-xs"
                  />
                </div>

                {/* Product Image */}
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border bg-muted/30 mb-3">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <ApprovalBadge
                      status={p.approvalStatus as ProductApprovalStatus}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {p.category?.name || "Uncategorized"}
                    </span>
                    <span
                      className={`font-semibold ${
                        totalStock === 0
                          ? "text-rose-600"
                          : totalStock <= 5
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {totalStock} in stock
                    </span>
                  </div>

                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-serif font-medium text-base hover:underline block truncate"
                  >
                    {p.title}
                  </Link>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-sm">
                      {price > 0 ? formatPrice(price) : "—"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                    onClick={() => setPreviewProduct(p)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Preview
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2.5"
                      asChild
                    >
                      <Link href={`/admin/products/${p.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setSingleDeleteTarget(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination & Page Info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Showing{" "}
            <span className="font-medium text-foreground">
              {sortedProducts.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * pageSize, sortedProducts.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {sortedProducts.length}
            </span>{" "}
            filtered products (Total: {totalProducts})
          </span>

          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2.5"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <div key={page} className="flex items-center">
                    {showEllipsis && <span className="px-1">…</span>}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 text-xs ${
                        currentPage === page ? "pointer-events-none" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2.5"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* 6. Single Delete Confirmation Modal */}
      <Dialog
        open={Boolean(singleDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) setSingleDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Delete Product?</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  This action permanently removes the product and all associated
                  variant stock.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {singleDeleteTarget && (
            <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5 my-2">
              <p className="font-semibold text-foreground">
                {singleDeleteTarget.title}
              </p>
              <p className="text-muted-foreground font-mono text-[11px]">
                Handle: {singleDeleteTarget.handle}
              </p>
              <p className="text-muted-foreground">
                Category: {singleDeleteTarget.category?.name || "Uncategorized"} •{" "}
                {singleDeleteTarget.variants.length} variant(s)
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSingleDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSingleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Bulk Delete Confirmation Modal */}
      <Dialog
        open={bulkDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) setBulkDeleteModalOpen(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  Delete {selectedIds.size} Products?
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Are you sure you want to delete these {selectedIds.size} products?
                  This cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg border bg-rose-50/50 border-rose-200 p-3 text-xs text-rose-900 space-y-1 my-2">
            <p className="font-medium">
              You are about to remove {selectedIds.size} products from your store.
            </p>
            <p className="text-[11px] text-rose-700">
              All associated variants, inventory levels, and images will be
              cleaned up.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : `Delete ${selectedIds.size} Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 8. Quick Preview Modal */}
      <Dialog
        open={Boolean(previewProduct)}
        onOpenChange={(open) => {
          if (!open) setPreviewProduct(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          {previewProduct && (
            <div>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {previewProduct.category?.name || "Uncategorized"}
                    </span>
                    <DialogTitle className="text-2xl font-serif mt-1">
                      {previewProduct.title}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Handle: {previewProduct.handle} • Vendor:{" "}
                      {previewProduct.vendor?.shopName || "Platform"}
                    </p>
                  </div>
                  <ApprovalBadge
                    status={previewProduct.approvalStatus as ProductApprovalStatus}
                  />
                </div>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2 pt-4">
                {/* Images gallery preview */}
                <div className="space-y-3">
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border bg-muted/20">
                    {previewProduct.images[0]?.url ? (
                      <Image
                        src={previewProduct.images[0].url}
                        alt={previewProduct.title}
                        fill
                        sizes="400px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  {previewProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {previewProduct.images.map((img, i) => (
                        <div
                          key={img.id || i}
                          className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border"
                        >
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product details & variants */}
                <div className="space-y-4 text-xs">
                  {/* Price & Stock summary */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">
                        Base Price
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {previewProduct.variants[0]?.price
                          ? formatPrice(Number(previewProduct.variants[0].price))
                          : "—"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Total Stock
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {previewProduct.variants.reduce(
                          (s, v) => s + (v.inventory?.quantity || 0),
                          0
                        )}{" "}
                        units
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {previewProduct.description && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        Description
                      </p>
                      <p className="text-muted-foreground leading-relaxed line-clamp-4">
                        {previewProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Variants List */}
                  <div>
                    <p className="font-semibold text-foreground mb-1.5">
                      Variants & Inventory ({previewProduct.variants.length})
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {previewProduct.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between p-2 rounded-md bg-background border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {v.colorHex && (
                              <span
                                className="h-3.5 w-3.5 rounded-full border shrink-0"
                                style={{ backgroundColor: v.colorHex }}
                              />
                            )}
                            <span>
                              {v.colorName} / {v.sizeLabel}
                            </span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              ({v.sku})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {formatPrice(Number(v.price))}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-sm font-semibold text-[10px] ${
                                (v.inventory?.quantity || 0) <= 5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              Qty: {v.inventory?.quantity ?? 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 flex items-center justify-between sm:justify-between border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1 text-xs"
                >
                  <Link
                    href={`/products/${previewProduct.handle}`}
                    target="_blank"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Live Store Page
                  </Link>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewProduct(null)}
                  >
                    Close
                  </Button>
                  <Button size="sm" variant="luxury" asChild>
                    <Link href={`/admin/products/${previewProduct.id}`}>
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      Full Edit
                    </Link>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
