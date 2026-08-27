import { WishlistContent } from "@/components/wishlist/wishlist-content";

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-serif text-3xl mb-8">Wishlist</h1>
      <WishlistContent />
    </div>
  );
}
