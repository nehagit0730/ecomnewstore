import { prisma } from "@/server/db/prisma";
import { VendorStatusSelect } from "@/components/admin/vendor-status-select";
import { CreateVendorForm } from "@/components/admin/create-vendor-form";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl mb-8">Vendors</h1>
        <div className="border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4">Shop</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{v.shopName}</td>
                  <td className="p-4">{v.user.email}</td>
                  <td className="p-4">{v._count.products}</td>
                  <td className="p-4">
                    <VendorStatusSelect vendorId={v.id} current={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="font-serif text-xl mb-4">Create vendor account</h2>
        <CreateVendorForm />
      </div>
    </div>
  );
}
