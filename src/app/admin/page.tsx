import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  Store,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  ExternalLink,
  DollarSign,
  Tag,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalOrders,
    paidOrders,
    revenue,
    customers,
    liveProducts,
    totalProducts,
    lowStockCount,
    lowStockItems,
    vendors,
    pendingProducts,
    recentOrders,
    categories,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PAID", "FULFILLED"] } } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "FULFILLED"] } },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({
      where: { approvalStatus: "APPROVED", isActive: true },
    }),
    prisma.product.count(),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.inventory.findMany({
      where: { quantity: { lte: 5 } },
      take: 4,
      orderBy: { quantity: "asc" },
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, handle: true } },
          },
        },
      },
    }),
    prisma.vendor.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { approvalStatus: "PENDING_REVIEW" } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        payments: { take: 1 },
        address: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.category.findMany({
      take: 4,
      orderBy: { products: { _count: "desc" } },
      include: {
        _count: { select: { products: true } },
      },
    }),
  ]);

  const totalRev = Number(revenue._sum.total ?? 0);

  const stats = [
    {
      label: "Total Net Revenue",
      value: formatPrice(totalRev),
      subtext: `${paidOrders} paid orders`,
      icon: DollarSign,
      color: "emerald",
      href: "/admin/orders",
    },
    {
      label: "Orders Placed",
      value: String(totalOrders),
      subtext: `${paidOrders} completed / fulfilled`,
      icon: ShoppingBag,
      color: "blue",
      href: "/admin/orders",
    },
    {
      label: "Live Catalog",
      value: String(liveProducts),
      subtext: `${totalProducts} total SKUs listed`,
      icon: Package,
      color: "indigo",
      href: "/admin/products",
    },
    {
      label: "Registered Customers",
      value: String(customers),
      subtext: "Active user accounts",
      icon: Users,
      color: "purple",
      href: "/admin/customers",
    },
    {
      label: "Active Vendors",
      value: String(vendors),
      subtext: "Verified boutique partners",
      icon: Store,
      color: "cyan",
      href: "/admin/vendors",
    },
    {
      label: "Pending Approvals",
      value: String(pendingProducts),
      subtext:
        pendingProducts > 0
          ? "Action required on catalog"
          : "All submissions reviewed",
      icon: Sparkles,
      color: pendingProducts > 0 ? "amber" : "slate",
      highlight: pendingProducts > 0,
      href: "/admin/products/pending",
    },
    {
      label: "Low Stock Alert",
      value: String(lowStockCount),
      subtext: "SKUs with ≤ 5 units left",
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "rose" : "slate",
      highlight: lowStockCount > 0,
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header with live status and quick action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Super Admin Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Platform
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time overview of revenue, multi-vendor operations, and inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" className="shadow-xs gap-1.5" asChild>
            <Link href="/" target="_blank">
              <span>View Store</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <Button variant="outline" className="shadow-xs gap-1.5" asChild>
            <Link href="/admin/products">
              <Package className="h-4 w-4" />
              <span>Products List</span>
            </Link>
          </Button>

          <Button variant="luxury" className="shadow-xs gap-1.5" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Key Performance Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`group relative overflow-hidden rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-foreground/30 ${
                s.highlight ? "border-amber-400/80 ring-1 ring-amber-400/30" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    s.color === "emerald"
                      ? "bg-emerald-50 text-emerald-600"
                      : s.color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : s.color === "purple"
                      ? "bg-purple-50 text-purple-600"
                      : s.color === "amber"
                      ? "bg-amber-100 text-amber-800"
                      : s.color === "rose"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3">
                <p className="font-serif text-2xl font-bold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span>{s.subtext}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary ml-auto" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Main Dashboard Body: Recent Orders & Sidebar Widgets */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Recent Orders Table */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
            <div>
              <h2 className="font-serif font-semibold text-lg text-foreground">
                Recent Orders
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest customer purchases across all vendors
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/admin/orders" className="gap-1">
                <span>View All Orders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => {
                  const paymentProvider = o.payments[0]?.provider;
                  const customerName = o.address
                    ? `${o.address.firstName} ${o.address.lastName}`
                    : o.email.split("@")[0];

                  return (
                    <tr
                      key={o.id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      <td className="p-3.5">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono font-medium text-foreground hover:underline block"
                        >
                          {o.orderNumber}
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                          {o._count.items} item{o._count.items > 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-medium text-xs text-foreground">
                          {customerName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {o.email}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground uppercase tracking-wide">
                          {paymentProvider === "COD"
                            ? "Cash on Delivery"
                            : paymentProvider || "Online"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] capitalize font-medium ${
                            o.status === "PAID" || o.status === "FULFILLED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : o.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {o.status.toLowerCase()}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right font-medium">
                        {formatPrice(Number(o.total))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!recentOrders.length && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No orders placed yet.
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="font-serif font-semibold text-base mb-3">
              Quick Management
            </h2>
            <div className="space-y-2">
              <QuickActionCard
                href="/admin/products"
                icon={Package}
                title="Products List"
                description="Manage, bulk delete, and import/export items"
              />
              <QuickActionCard
                href="/admin/products/new"
                icon={Plus}
                title="Add New Product"
                description="Create a product with variants & images"
              />
              <QuickActionCard
                href="/admin/coupons"
                icon={Tag}
                title="Discount Coupons"
                description="Create promotional codes & discounts"
              />
              <QuickActionCard
                href="/admin/vendors"
                icon={Store}
                title="Vendor Partners"
                description="Manage seller approvals and commissions"
              />
              <QuickActionCard
                href="/admin/pages"
                icon={FileSpreadsheet}
                title="Storefront CMS"
                description="Edit policies, about us, and size charts"
              />
            </div>
          </div>

          {/* Low Stock SKUs Widget */}
          {lowStockItems.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">Low Stock SKUs</h3>
                </div>
                <Link
                  href="/admin/products"
                  className="text-[11px] font-medium text-rose-800 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/products/${item.variant.product.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 border border-rose-100 hover:bg-white text-xs transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-foreground truncate">
                        {item.variant.product.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {item.variant.sku} ({item.variant.sizeLabel})
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                      {item.quantity} left
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Top Categories Card */}
          {categories.length > 0 && (
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <h3 className="font-serif font-semibold text-sm mb-3">
                Top Categories
              </h3>
              <div className="space-y-2.5 text-xs">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between py-1 border-b last:border-0"
                  >
                    <span className="font-medium text-foreground">
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground">
                      {cat._count.products} products
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border bg-background p-3 transition-all hover:border-foreground/30 hover:bg-muted/30"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </p>
          <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>
    </Link>
  );
}
