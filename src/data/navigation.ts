import { navImage } from "@/lib/catalog-images";

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type MegaMenuColumn = {
  title: string;
  links: NavLink[];
};

export type MegaMenuItem = {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  featured?: {
    title: string;
    subtitle: string;
    image: string;
    href: string;
  };
};

export const MEGA_MENU: MegaMenuItem[] = [
  {
    label: "Men",
    href: "/collections/men",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Men", href: "/collections/men" },
          { label: "T-Shirts & Polos", href: "/collections/men?tag=tees" },
          { label: "Shirts", href: "/collections/men?tag=shirts" },
          { label: "Bottoms", href: "/collections/men?tag=bottoms" },
          { label: "Innerwear", href: "/collections/men?tag=innerwear" },
        ],
      },
      {
        title: "Featured",
        links: [
          { label: "New Arrivals", href: "/collections/new-arrivals" },
          { label: "Best Sellers", href: "/collections/best-sellers" },
          { label: "Sale", href: "/collections/sale" },
        ],
      },
    ],
    featured: {
      title: "Summer Essentials",
      subtitle: "Breathable linen & cotton",
      image: navImage("men"),
      href: "/collections/men",
    },
  },
  {
    label: "Women",
    href: "/collections/women",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Women", href: "/collections/women" },
          { label: "Tops & Tees", href: "/collections/women?tag=tops" },
          { label: "Dresses", href: "/collections/women?tag=dresses" },
          { label: "Activewear", href: "/collections/women?tag=active" },
          { label: "Loungewear", href: "/collections/women?tag=lounge" },
        ],
      },
      {
        title: "Featured",
        links: [
          { label: "Trending", href: "/collections/trending" },
          { label: "New Arrivals", href: "/collections/new-arrivals" },
          { label: "Sale", href: "/collections/sale" },
        ],
      },
    ],
    featured: {
      title: "The Edit",
      subtitle: "Curated for you",
      image: navImage("women"),
      href: "/collections/women",
    },
  },
  {
    label: "Kids",
    href: "/collections/kids",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Kids", href: "/collections/kids" },
          { label: "Boys", href: "/collections/kids?tag=boys" },
          { label: "Girls", href: "/collections/kids?tag=girls" },
          { label: "Infants", href: "/collections/kids?tag=infants" },
        ],
      },
    ],
    featured: {
      title: "Play Ready",
      subtitle: "Soft & durable fabrics",
      image: navImage("kids"),
      href: "/collections/kids",
    },
  },
  {
    label: "Accessories",
    href: "/collections/accessories",
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All Accessories", href: "/collections/accessories" },
          { label: "Bags", href: "/collections/accessories?tag=bags" },
          { label: "Caps & Hats", href: "/collections/accessories?tag=caps" },
          { label: "Socks", href: "/collections/accessories?tag=socks" },
        ],
      },
    ],
    featured: {
      title: "Complete the Look",
      subtitle: "Premium finishing touches",
      image: navImage("accessories"),
      href: "/collections/accessories",
    },
  },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "Men", href: "/collections/men" },
    { label: "Women", href: "/collections/women" },
    { label: "Kids", href: "/collections/kids" },
    { label: "Accessories", href: "/collections/accessories" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Sale", href: "/collections/sale" },
  ],
  help: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Track Order", href: "/account/orders" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Press", href: "/press" },
  ],
};
