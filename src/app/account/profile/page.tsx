import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { accountService } from "@/server/services/account.service";
import { ProfileForm } from "@/components/account/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?redirect=/account/profile");
  const profile = await accountService.getProfile(session.user.id);
  return <ProfileForm initial={profile} />;
}
