"use client";

import { useState } from "react";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

type Badge = "new" | "sale" | "soldout";

type Product = {
  id: string;
  badge: Badge | null;
  categoryKey: "categoryKids" | "categoryBackpack" | "categoryScarves" | "categoryShoes";
  nameKey: "jacketName" | "backpackName" | "scarfName" | "sneakerName";
  image: string;
  usd: number;
  krw: number;
  discount: number;
};

const PRODUCTS: Product[] = [
  {
    id: "jacket",
    badge: "new",
    categoryKey: "categoryKids",
    nameKey: "jacketName",
    image: "/preview/products/Burberry-Kids-Boys-Beige-Check-Black-Collar-Quilted-Jacket-Shorts.jpg",
    usd: 450,
    krw: 610000,
    discount: 0,
  },
  {
    id: "backpack",
    badge: "soldout",
    categoryKey: "categoryBackpack",
    nameKey: "backpackName",
    image: "/preview/products/F77C04A1-4749-46F2-80CD-A2B781CC0DDD.webp",
    usd: 2106,
    krw: 2860000,
    discount: 0,
  },
  {
    id: "scarf",
    badge: "sale",
    categoryKey: "categoryScarves",
    nameKey: "scarfName",
    image: "/preview/products/4F39FF8F-D2D1-472C-896B-05D8152BFFE2.webp",
    usd: 512.4,
    krw: 696000,
    discount: 0.2,
  },
  {
    id: "sneakers",
    badge: null,
    categoryKey: "categoryShoes",
    nameKey: "sneakerName",
    image: "/preview/products/5C28A349-62E7-40F3-9CBB-7C9CBDBF892E.webp",
    usd: 699.5,
    krw: 950000,
    discount: 0.1,
  },
];

function formatMoney(amount: number, locale: "ko" | "en") {
  if (locale === "ko") {
    return `${new Intl.NumberFormat("ko-KR").format(Math.round(amount))}원`;
  }
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function CatalogProductShowcase() {
  const copy = useCopy().preview.kit.products;
  const locale = useMatchuStore((state) => state.locale);
  const [added, setAdded] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);

  return (
    <>
      {PRODUCTS.map((product) => {
        const name = copy[product.nameKey];
        const category = copy[product.categoryKey];
        const list = locale === "ko" ? product.krw : product.usd;
        const current = product.discount === 0
          ? list
          : locale === "ko"
            ? Math.round(list * (1 - product.discount))
            : Math.round(list * (1 - product.discount) * 100) / 100;
        const soldOut = product.badge === "soldout";
        const inCart = added.includes(product.id);
        const badgeLabel = product.badge === "new"
          ? copy.newBadge
          : product.badge === "sale"
            ? copy.saleBadge
            : product.badge === "soldout"
              ? copy.soldOutBadge
              : null;
        return (
          <article key={product.id} className="kit-product-card kit-span-rows" data-state={soldOut ? "soldout" : undefined}>
            <div className="kit-product-media">
              {missing.includes(product.id) ? (
                <span className="kit-product-fallback">{category}</span>
              ) : (
                <img
                  src={product.image}
                  alt={name}
                  onError={() => setMissing((currentIds) => (
                    currentIds.includes(product.id) ? currentIds : [...currentIds, product.id]
                  ))}
                />
              )}
              {badgeLabel ? (
                <span className="kit-product-badge" data-tone={product.badge === "sale" ? "accent" : product.badge === "new" ? "secondary" : "neutral"}>
                  {badgeLabel}
                </span>
              ) : null}
            </div>
            <div className="kit-product-body">
              <p className="kit-product-category">{category}</p>
              <h3 className="kit-product-name">{name}</h3>
              <p className="kit-product-prices">
                <span className="kit-product-price" data-tone={product.badge === "sale" ? "accent" : product.badge === null ? "primary" : undefined}>
                  {formatMoney(current, locale)}
                </span>
                {product.discount > 0 ? (
                  <s className="kit-product-compare">{formatMoney(list, locale)}</s>
                ) : null}
              </p>
              {soldOut ? (
                <button type="button" className="kit-btn kit-product-action" data-look="outline" data-tone="neutral" disabled>
                  {copy.soldOut}
                </button>
              ) : (
                <div className="kit-product-actions">
                  <button type="button" className="kit-btn kit-product-action" data-look="solid" data-tone="primary">
                    {copy.buyNow}
                  </button>
                  <button
                    type="button"
                    className="kit-btn kit-product-action"
                    data-look="outline"
                    data-tone="secondary"
                    aria-pressed={inCart}
                    onClick={() => setAdded((currentIds) => (
                      currentIds.includes(product.id)
                        ? currentIds.filter((id) => id !== product.id)
                        : [...currentIds, product.id]
                    ))}
                  >
                    {inCart ? copy.added : copy.addToCart}
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </>
  );
}
