/**
 * Catalog image helpers.
 * Listed products use real product photography; others fall back to stable picsum seeds.
 */
const BASE = "https://picsum.photos/seed";

/** Real product photos keyed by catalog handle. */
const PRODUCT_IMAGE_URLS: Record<string, { primary: string; secondary?: string }> = {
  "classic-sneaker-cap": {
    primary:
      "https://varsityheadwear.com/_next/image?url=https%3A%2F%2Fa.storyblok.com%2Ff%2F257342%2F1500x2000%2F9010508b4f%2Flst.png&w=3840&q=75&dpl=dpl_9TnkBn73CQqMxTrfEjej8aCVpgat",
  },
  "fleece-hoodie": {
    primary:
      "https://betterbasics.co.in/cdn/shop/files/BetterBasics3314.jpg?v=1747140765&width=1500",
  },
  "silk-evening-shirt": {
    primary:
      "https://ik.imagekit.io/4sjmoqtje/tr:w-1000,c-at_max/cdn/shop/files/grey-embellished-silk-blend-party-shirt-sg320040-4.jpg?v=1773996132",
  },
  "cargo-utility-pant": {
    primary: "https://m.media-amazon.com/images/I/51sd4W3Vb2L._AC_UY1100_.jpg",
  },
  "cotton-polo-shirt": {
    primary:
      "https://cdn19.nnnow.com/web-images/large/styles/O91HPY9CSUQ/1710936675223/1.jpg",
  },
  "tailored-blazer": {
    primary:
      "https://www.selectedhomme.in/cdn/shop/files/902324201_g0_d8b96802-36f7-41b4-a73d-0231750e7b23.jpg?v=1769081162&width=2048",
  },
  "graphic-street-tee": {
    primary: "https://veirdo.in/cdn/shop/files/Artboard23_53.jpg?v=1770898026",
  },
  "wool-blend-overcoat": {
    primary:
      "https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/G18907s.jpg?im=Resize,width=750",
  },
  "leather-belt-classic": {
    primary:
      "https://theholistik.com/cdn/shop/files/Agile-mens-belt-black-4.webp?v=1721393500",
  },
  "performance-jogger": {
    primary:
      "https://www.shopdraftkings.com/cdn/shop/files/Lusso-DraftKings_08193_17141267-e23b-47f4-bd1c-3f2d76db211a.jpg?v=1747405033&width=1214",
  },
  "denim-trucker-jacket": {
    primary:
      "https://assets.myntassets.com/w_412,q_50,,dpr_3,fl_progressive,f_webp/assets/images/29790532/2024/10/3/087710bf-accd-4d85-b44f-c5c8dc2cd4c61727934608825-Roadster-Men-Jackets-6641727934608194-1.jpg",
  },
  "merino-crew-sweater": {
    primary:
      "https://cdn05.nnnow.com/web-images/large/styles/5Q91O5KJ65T/1722589239245/1.JPG",
  },
  "oxford-button-down": {
    primary:
      "https://bananaclub.co.in/cdn/shop/files/Grey_Plain_Cotton_Oxford_Shirt_5.jpg?v=1760427183",
  },
  "linen-relaxed-shirt": {
    primary:
      "https://image.hm.com/assets/hm/af/c7/afc73c8be8bfafa0738b3dc494e8a8256946d2b3.jpg?imwidth=1260",
  },
  "wool-coat-women": {
    primary:
      "https://assets.myntassets.com/w_412,q_50,,dpr_3,fl_progressive,f_webp/assets/images/productimage/2019/12/9/590d9802-2521-4f55-87c1-25139c55b5b01575845664343-5.jpg",
  },
  "silk-scarf-print": {
    primary:
      "https://pashtush.in/cdn/shop/products/pashtush-pashmina-pashtush-women-s-100-pure-silk-printed-scarf-paisley-romance-29524902314038.jpg?v=1629537544&width=1080",
  },
  "leather-crossbody-bag": {
    primary:
      "https://www.veromoda.in/cdn/shop/files/901397601_g0.jpg?v=1745716366&width=2048",
  },
  "printed-maxi-dress": {
    primary:
      "https://static.cilory.com/799698-thickbox_default/cut-out-printed-maxi-dress-with-shell-detail.jpg",
  },
  "yoga-leggings": {
    primary:
      "https://redroseindia.in/cdn/shop/files/ACTIVE002GRAY_5.jpg?v=1770201686&width=3840",
  },
  "wrap-blouse": {
    primary:
      "https://glamorous.com/cdn/shop/files/CK7315_DM23_01copy_1200x.jpg?v=1699277140",
  },
  "pleated-midi-skirt": {
    primary:
      "https://cdn.shopify.com/s/files/1/0486/0634/7416/products/Pleated_20Flared_20Midi_20Skirt_20-_20White_L1.jpg?v=1747809141",
  },
  "ribbed-tank-top": {
    primary: "https://m.media-amazon.com/images/I/81UGWyoQ7HL._AC_UY1100_.jpg",
    secondary:
      "https://cdn.fynd.com/v2/falling-surf-7c8bb8/fyprod/wrkr/products/pictures/item/free/original/000000410507958005/MyIFYgJyxEo-410507958_200_MODEL2.jpg",
  },
  "oversized-blazer-women": {
    primary:
      "https://www.reona.ca/cdn/shop/products/20_1487bf46-6705-491f-a778-3eaf40ccd55c.jpg?v=1748623358",
  },
  "linen-blend-trouser": {
    primary:
      "https://media.houseofbruar.com/www/images/products/small/TP32161WHITE.jpg?v=5",
  },
  "cropped-knit-cardigan": {
    primary:
      "https://assets.myntassets.com/w_412,q_50,,dpr_3,fl_progressive,f_webp/assets/images/29781694/2024/8/24/5eb54fc3-f1b8-4ef0-9c49-275c690ff2741724472928459-DressBerry-Women-Co-Ords-5201724472926957-1.jpg",
  },
  "satin-slip-dress": {
    primary:
      "https://lizzys.ca/cdn/shop/files/DrapeNeckSatinSlipDress_BD103_Sage_LaDiv.jpg?v=1720199928",
  },
  "high-waist-wide-leg-jean": {
    primary: "https://d1pdzcnm6xgxlz.cloudfront.net/bottoms/8905875017073-9.jpg",
  },
  "floral-midi-dress": {
    primary:
      "https://www.koai.in/cdn/shop/files/1_cf5f13cf-d842-4236-a4a1-3544e6dcad38.jpg?v=1749285896&width=1200",
  },
};

export function productImage(
  handle: string,
  slot: 1 | 2 = 1,
  width = 800,
  height = 1000
) {
  const custom = PRODUCT_IMAGE_URLS[handle];
  if (custom) {
    if (slot === 2 && custom.secondary) return custom.secondary;
    return custom.primary;
  }
  const seed = slot === 1 ? `veloire-p-${handle}` : `veloire-p2-${handle}`;
  return `${BASE}/${seed}/${width}/${height}`;
}

export function collectionImage(handle: string, width = 1200, height = 800) {
  return `${BASE}/veloire-c-${handle}/${width}/${height}`;
}

export function heroImage(width = 1600, height = 900) {
  return `${BASE}/veloire-hero/${width}/${height}`;
}

export function promoImage(width = 800, height = 600) {
  return `${BASE}/veloire-promo/${width}/${height}`;
}

export function instagramImage(index: number, width = 400, height = 400) {
  return `${BASE}/veloire-ig-${index}/${width}/${height}`;
}

export function navImage(key: string, width = 600, height = 400) {
  return `${BASE}/veloire-nav-${key}/${width}/${height}`;
}

const LEGACY_IMAGE_HOSTS = ["images.unsplash.com", "plus.unsplash.com"];

/** Rewrite broken/legacy Unsplash URLs to stable picsum seeds. */
export function normalizeProductImageUrl(
  url: string | undefined | null,
  handle?: string,
  width = 800,
  height = 1000
): string {
  if (!url) {
    return productImage(handle ?? "placeholder", 1, width, height);
  }
  try {
    const host = new URL(url).hostname;
    if (LEGACY_IMAGE_HOSTS.includes(host)) {
      return productImage(handle ?? "placeholder", 1, width, height);
    }
  } catch {
    return productImage(handle ?? "placeholder", 1, width, height);
  }
  return url;
}

/** Normalize images on stored orders (legacy Unsplash URLs in localStorage). */
export function normalizeOrderItemImage(item: {
  image: string;
  handle?: string;
}) {
  return normalizeProductImageUrl(item.image, item.handle, 160, 192);
}
