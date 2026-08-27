import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { accountService } from "@/server/services/account.service";
import { AddressesManager } from "@/components/account/addresses-manager";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?redirect=/account/addresses");
  const [addresses, profile] = await Promise.all([
    accountService.listAddresses(session.user.id),
    accountService.getProfile(session.user.id),
  ]);
  return <AddressesManager initial={addresses} profile={profile} />;
}
