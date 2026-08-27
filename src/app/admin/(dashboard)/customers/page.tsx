import { prisma } from "@/server/db/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Customers</h1>
      <div className="border bg-background overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">Email</th>
              <th className="p-4">Name</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-4">{c.email}</td>
                <td className="p-4">
                  {c.firstName} {c.lastName}
                </td>
                <td className="p-4">{c._count.orders}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
