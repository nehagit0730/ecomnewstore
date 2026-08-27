import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { orderService } from "@/server/services/order.service";
import { AccountOrdersList } from "@/components/account/account-orders-list";

type Props = {
  searchParams: Promise<{ placed?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/account/login?redirect=/account/orders");
  }

  const orders = await orderService.findUserOrders(session.user.id);
  const { placed } = await searchParams;

  return <AccountOrdersList orders={orders} placed={placed} />;
}
