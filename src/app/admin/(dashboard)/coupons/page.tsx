import { adminCouponService } from "@/server/services/admin-coupon.service";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function AdminCouponsPage() {
  const coupons = await adminCouponService.list();

  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Coupons</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Manage discount codes used at checkout (synced with server cart validation).
      </p>
      <CouponManager initial={coupons} />
    </div>
  );
}
