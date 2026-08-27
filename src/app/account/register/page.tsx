import { RegisterForm } from "@/components/account/register-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Create Account",
  path: "/account/register",
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="font-serif text-3xl mb-2">Create Account</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Join Veloire for exclusive benefits
      </p>
      <RegisterForm />
    </div>
  );
}
