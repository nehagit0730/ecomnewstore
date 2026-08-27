import type { NextConfig } from "next";

const PRODUCT_IMAGE_HOSTS = [
  "*.public.blob.vercel-storage.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "i.picsum.photos",
  "varsityheadwear.com",
  "betterbasics.co.in",
  "ik.imagekit.io",
  "m.media-amazon.com",
  "cdn19.nnnow.com",
  "www.selectedhomme.in",
  "veirdo.in",
  "xcdn.next.co.uk",
  "theholistik.com",
  "www.shopdraftkings.com",
  "assets.myntassets.com",
  "cdn05.nnnow.com",
  "bananaclub.co.in",
  "image.hm.com",
  "pashtush.in",
  "www.veromoda.in",
  "static.cilory.com",
  "redroseindia.in",
  "glamorous.com",
  "cdn.shopify.com",
  "cdn.fynd.com",
  "www.reona.ca",
  "media.houseofbruar.com",
  "lizzys.ca",
  "d1pdzcnm6xgxlz.cloudfront.net",
  "www.koai.in",
] as const;

const isVercel = Boolean(process.env.VERCEL); 

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "standalone" }),
  env: {
    AUTH_SECRET:
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "veloire-store-secret-token-jwt-key-production-32chars",
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      process.env.AUTH_SECRET ||
      "veloire-store-secret-token-jwt-key-production-32chars",
    AUTH_TRUST_HOST: "true",
  },
  images: {
    remotePatterns: PRODUCT_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
