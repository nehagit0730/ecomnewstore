import Link from "next/link";
import { adminInventoryService } from "@/server/services/admin-inventory.service";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";

export default async function AdminInventoryPage() {
  const items = await adminInventoryService.listLowStock();

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Inventory</h1>
      <p className="text-sm text-muted-foreground mb-8">
        SKUs with {siteConfig.lowStockThreshold} or fewer units in stock.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground border rounded-sm p-8 text-center">
          All SKUs are above the low-stock threshold.
        </p>
      ) : (
        <div className="border rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/40 text-left">
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">Variant</th>
                <th className="p-3 font-medium text-right">Available</th>
                <th className="p-3 font-medium text-right">Reserved</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3">
                    <Link
                      href={`/admin/products/${item.product.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.title}
                    </Link>
                    {!item.product.isActive && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{item.sku}</td>
                  <td className="p-3 text-muted-foreground">
                    {item.colorName} / {item.sizeLabel}
                  </td>
                  <td className="p-3 text-right font-medium">{item.quantity}</td>
                  <td className="p-3 text-right text-muted-foreground">
                    {item.reservedQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
