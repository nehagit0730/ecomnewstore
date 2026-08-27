import { Suspense } from "react";
import { LoginForm } from "@/components/account/login-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign In",
  path: "/account/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-12 md:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground mb-2">
        Account
      </p>
      <h1 className="font-serif text-3xl mb-2">Sign in</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Welcome back — shop your favorites and track orders.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
