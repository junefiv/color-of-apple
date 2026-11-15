"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft, Backpack, Ban, Bell, Check, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Coffee, CreditCard, Footprints, Glasses, Heart, House,
  Lamp, Landmark, LayoutGrid, MapPin, Minus, Package, PackageCheck, Plus, Receipt, RotateCcw, Search, Shirt, ShoppingBag, Smartphone,
  Star, Tag, Ticket, Trash2, Truck, Umbrella, User, Watch, X, type LucideIcon,
} from "lucide-react";
import { IntroPhone, IntroViewport } from "../kinds/shared";
import { useMatchuStore } from "@/lib/store";
import "./shop-preview.css";

/* ───────────────────────── data ───────────────────────── */

type Cat = "apparel" | "shoes" | "bags" | "acc" | "living";
type Shelf = "all" | "new" | "best" | "sale" | Cat;
type SwatchId = "signature" | "point" | "mist" | "ink" | "shell";
type Size = { label: string; stock: number };
type Product = {
  id: number; ko: string; en: string; cat: Cat; price: number; sale?: number; rating: number; reviews: number;
  tags: Array<"new" | "best">; sizes: Size[]; colors: SwatchId[]; tone: 0 | 1 | 2 | 3; icon: LucideIcon; added: number;
  descKo: string; descEn: string;
};
type CartLine = { key: string; id: number; color: SwatchId; size: string; qty: number };
type Status = "paid" | "shipping" | "delivered" | "cancelled";
type Order = { id: string; dateKo: string; dateEn: string; lines: Array<Omit<CartLine, "key">>; total: number; status: Status };
type Sort = "recommended" | "new" | "low" | "high" | "reviews";
type PriceBand = "all" | "u50" | "m100" | "o100";
type Coupon = "available" | "claimed" | "used";
type WebView = "shop" | "wishlist" | "orders" | "checkout";
type AppTab = "home" | "browse" | "wish" | "cart" | "my";
type Overlay = { kind: "product"; id: number } | { kind: "cart" } | { kind: "checkout" } | null;
type PayMethod = "card" | "easy" | "bank";
type Address = { name: string; phone: string; address: string; detail: string; memo: string };

const FREE_SHIPPING = 50000;
const SHIPPING_FEE = 3000;
const APPAREL = (s: number, m: number, l: number, xl: number): Size[] => [{ label: "S", stock: s }, { label: "M", stock: m }, { label: "L", stock: l }, { label: "XL", stock: xl }];
const ONE = (stock: number): Size[] => [{ label: "FREE", stock }];

const PRODUCTS: Product[] = [
  { id: 1, ko: "울 블렌드 싱글 코트", en: "Wool-blend single coat", cat: "apparel", price: 189000, sale: 151200, rating: 4.8, reviews: 212, tags: ["best"], sizes: APPAREL(5, 3, 2, 0), colors: ["ink", "mist", "signature"], tone: 0, icon: Shirt, added: 6, descKo: "가볍게 걸치기 좋은 울 블렌드 소재의 싱글 코트예요. 어깨선이 자연스럽게 떨어져요.", descEn: "A light wool-blend coat with a soft shoulder that layers over anything." },
  { id: 2, ko: "코튼 오버핏 셔츠", en: "Oversized cotton shirt", cat: "apparel", price: 59000, rating: 4.6, reviews: 48, tags: ["new"], sizes: APPAREL(4, 6, 0, 3), colors: ["shell", "signature", "mist"], tone: 1, icon: Shirt, added: 10, descKo: "탄탄한 코튼으로 만든 넉넉한 핏의 셔츠. 단독으로도, 겉옷으로도 좋아요.", descEn: "A roomy shirt in sturdy cotton that works alone or as a light layer." },
  { id: 3, ko: "램스울 크루넥 니트", en: "Lambswool crew knit", cat: "apparel", price: 79000, sale: 55300, rating: 4.7, reviews: 131, tags: ["best"], sizes: APPAREL(2, 0, 4, 1), colors: ["point", "shell", "ink"], tone: 2, icon: Shirt, added: 4, descKo: "부드러운 램스울 니트. 까슬거림 없이 포근하게 감싸요.", descEn: "A soft lambswool knit that keeps you warm without the itch." },
  { id: 4, ko: "레더 로우 스니커즈", en: "Leather low sneakers", cat: "shoes", price: 129000, rating: 4.9, reviews: 486, tags: ["best"], sizes: [{ label: "230", stock: 3 }, { label: "240", stock: 0 }, { label: "250", stock: 5 }, { label: "260", stock: 2 }, { label: "270", stock: 0 }], colors: ["shell", "ink"], tone: 3, icon: Footprints, added: 3, descKo: "매일 신기 좋은 소가죽 스니커즈. 쿠션 인솔로 오래 걸어도 편해요.", descEn: "Everyday leather sneakers with a cushioned insole for long walks." },
  { id: 5, ko: "캔버스 데일리 토트", en: "Canvas daily tote", cat: "bags", price: 45000, rating: 4.5, reviews: 73, tags: ["new"], sizes: ONE(8), colors: ["shell", "signature", "point"], tone: 1, icon: ShoppingBag, added: 9, descKo: "노트북까지 들어가는 두툼한 캔버스 토트백이에요.", descEn: "A heavy canvas tote with room for a laptop." },
  { id: 6, ko: "나일론 롤탑 백팩", en: "Nylon roll-top backpack", cat: "bags", price: 98000, sale: 83300, rating: 4.6, reviews: 95, tags: [], sizes: ONE(0), colors: ["ink", "mist"], tone: 0, icon: Backpack, added: 5, descKo: "생활 방수 나일론 롤탑 백팩. 짐에 맞춰 높이를 조절해요.", descEn: "A water-resistant roll-top backpack that grows with your load." },
  { id: 7, ko: "미니멀 메탈 워치", en: "Minimal metal watch", cat: "acc", price: 159000, rating: 4.7, reviews: 64, tags: [], sizes: ONE(4), colors: ["ink", "signature"], tone: 2, icon: Watch, added: 2, descKo: "군더더기 없는 다이얼과 가벼운 메탈 밴드의 손목시계.", descEn: "A clean dial on a light metal band." },
  { id: 8, ko: "라운드 틴트 선글라스", en: "Round tinted sunglasses", cat: "acc", price: 69000, sale: 62100, rating: 4.4, reviews: 27, tags: ["new"], sizes: ONE(6), colors: ["point", "ink"], tone: 3, icon: Glasses, added: 8, descKo: "은은한 틴트 렌즈의 동그란 선글라스. 자외선을 99% 막아줘요.", descEn: "Round frames with a gentle tint that block 99% of UV." },
  { id: 9, ko: "스톤웨어 머그 2P", en: "Stoneware mug, set of 2", cat: "living", price: 32000, rating: 4.8, reviews: 318, tags: ["best"], sizes: ONE(12), colors: ["shell", "mist", "point"], tone: 0, icon: Coffee, added: 1, descKo: "손에 감기는 두께의 스톤웨어 머그 두 개 세트예요.", descEn: "Two stoneware mugs with a weight that sits well in the hand." },
  { id: 10, ko: "린넨 셰이드 무드등", en: "Linen-shade mood lamp", cat: "living", price: 89000, sale: 66700, rating: 4.6, reviews: 59, tags: [], sizes: ONE(3), colors: ["shell", "signature"], tone: 1, icon: Lamp, added: 7, descKo: "린넨 갓을 통과한 빛이 방을 부드럽게 채워요. 3단계 밝기 조절.", descEn: "Light through a linen shade, with three brightness levels." },
  { id: 11, ko: "원터치 자동 장우산", en: "Auto-open long umbrella", cat: "acc", price: 28000, rating: 4.3, reviews: 41, tags: ["new"], sizes: ONE(0), colors: ["signature", "ink"], tone: 2, icon: Umbrella, added: 11, descKo: "버튼 한 번에 펼쳐지는 튼튼한 16살 장우산.", descEn: "A sturdy 16-rib umbrella that opens with one press." },
];

const SWATCHES: Record<SwatchId, { ko: string; en: string; token: string }> = {
  signature: { ko: "시그니처", en: "Signature", token: "--color-primary-default" },
  point: { ko: "포인트", en: "Point", token: "--color-accent-default" },
  mist: { ko: "미스트", en: "Mist", token: "--color-secondary-default" },
  ink: { ko: "잉크", en: "Ink", token: "--color-text-primary" },
  shell: { ko: "셸", en: "Shell", token: "--color-bg-subtle" },
};
const SHELF_LABEL: Record<Shelf, [string, string]> = {
  all: ["전체", "All"], new: ["신상품", "New in"], best: ["베스트", "Best"], sale: ["세일", "Sale"], apparel: ["의류", "Clothing"],
  shoes: ["신발", "Shoes"], bags: ["가방", "Bags"], acc: ["액세서리", "Accessories"], living: ["리빙", "Living"],
};
const SHELVES: Shelf[] = ["all", "new", "best", "sale", "apparel", "shoes", "bags", "acc", "living"];
const QUICK: Array<{ shelf: Shelf; icon: LucideIcon }> = [
  { shelf: "apparel", icon: Shirt }, { shelf: "shoes", icon: Footprints }, { shelf: "bags", icon: Backpack },
  { shelf: "acc", icon: Watch }, { shelf: "living", icon: Lamp }, { shelf: "sale", icon: Tag },
];
const SORTS: Array<[Sort, string, string]> = [
  ["recommended", "추천순", "Recommended"], ["new", "신상품순", "Newest"], ["low", "낮은 가격순", "Price: low to high"],
  ["high", "높은 가격순", "Price: high to low"], ["reviews", "리뷰 많은순", "Most reviewed"],
];
const PRICES: Array<[PriceBand, string, string]> = [
  ["all", "전체 가격", "Any price"], ["u50", "5만원 이하", "Under ₩50,000"], ["m100", "5–10만원", "₩50,000–100,000"], ["o100", "10만원 이상", "₩100,000+"],
];
const STATUS: Record<Status, { ko: string; en: string; tone: "info" | "warning" | "success" | "danger"; icon: LucideIcon }> = {
  paid: { ko: "결제 완료", en: "Paid", tone: "info", icon: Receipt },
  shipping: { ko: "배송 중", en: "Shipping", tone: "warning", icon: Truck },
  delivered: { ko: "배송 완료", en: "Delivered", tone: "success", icon: PackageCheck },
  cancelled: { ko: "취소", en: "Cancelled", tone: "danger", icon: Ban },
};
const STATUSES: Status[] = ["paid", "shipping", "delivered", "cancelled"];
const BANNERS = [
  { tone: "primary", eyebrow: "FALL / WINTER 26", ko: "가을, 가볍게 겹쳐 입기", en: "Layer lightly this fall", subKo: "아우터와 니트 최대 30% 할인", subEn: "Outerwear and knits up to 30% off", ctaKo: "기획전 보기", ctaEn: "Shop the edit", shelf: "sale", art: 1 },
  { tone: "secondary", eyebrow: "NEW IN", ko: "이번 주 새로 들어온 것들", en: "New this week", subKo: "셔츠부터 우산까지, 신상품 4가지", subEn: "Four new arrivals, from shirts to umbrellas", ctaKo: "신상품 보기", ctaEn: "See what's new", shelf: "new", art: 2 },
  { tone: "accent", eyebrow: "HOME & LIVING", ko: "방 안의 작은 계절", en: "A small season at home", subKo: "머그와 무드등으로 채우는 저녁", subEn: "Evenings with a good mug and a soft lamp", ctaKo: "리빙 둘러보기", ctaEn: "Browse living", shelf: "living", art: 10 },
] as const;
const PAY_METHODS: Array<{ id: PayMethod; icon: LucideIcon; ko: string; en: string; subKo: string; subEn: string }> = [
  { id: "card", icon: CreditCard, ko: "신용·체크카드", en: "Credit or debit card", subKo: "모든 카드 · 최대 3개월 무이자", subEn: "All major cards accepted" },
  { id: "easy", icon: Smartphone, ko: "간편결제", en: "Easy pay", subKo: "등록한 간편결제로 빠르게", subEn: "Pay with your saved wallet" },
  { id: "bank", icon: Landmark, ko: "무통장입금", en: "Bank transfer", subKo: "입금이 확인되면 배송을 시작해요", subEn: "Ships once payment clears" },
];
const MEMOS: Array<[string, string]> = [["문 앞에 놓아 주세요", "Leave at the door"], ["경비실에 맡겨 주세요", "Leave with the front desk"], ["배송 전에 연락 주세요", "Call before delivery"]];
const INITIAL_CART: CartLine[] = [{ key: "9-shell-FREE", id: 9, color: "shell", size: "FREE", qty: 1 }];
const INITIAL_ORDERS: Order[] = [
  { id: "LM-2611-0450", dateKo: "11월 14일", dateEn: "Nov 14", lines: [{ id: 3, color: "point", size: "L", qty: 1 }], total: 55300, status: "paid" },
  { id: "LM-2611-0412", dateKo: "11월 12일", dateEn: "Nov 12", lines: [{ id: 4, color: "shell", size: "250", qty: 1 }], total: 129000, status: "shipping" },
  { id: "LM-2611-0388", dateKo: "11월 3일", dateEn: "Nov 3", lines: [{ id: 9, color: "shell", size: "FREE", qty: 2 }, { id: 5, color: "signature", size: "FREE", qty: 1 }], total: 109000, status: "delivered" },
  { id: "LM-2610-0291", dateKo: "10월 21일", dateEn: "Oct 21", lines: [{ id: 8, color: "ink", size: "FREE", qty: 1 }], total: 62100, status: "cancelled" },
];
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

const unitPrice = (p: Product) => p.sale ?? p.price;
const offRate = (p: Product) => (p.sale ? Math.round((1 - p.sale / p.price) * 100) : 0);
const isSoldOut = (p: Product) => p.sizes.every((s) => s.stock === 0);
const productById = (id: number) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
const stockOf = (p: Product, size: string | null) => p.sizes.find((s) => s.label === size)?.stock ?? 0;
const lineMax = (p: Product, size: string | null) => Math.max(1, Math.min(10, stockOf(p, size)));
const swatchStyle = (id: SwatchId) => ({ "--swatch": `var(${SWATCHES[id].token})` }) as CSSProperties;

function totalsOf(cart: CartLine[], coupon: Coupon) {
  const count = cart.reduce((n, line) => n + line.qty, 0);
  const subtotal = cart.reduce((sum, line) => sum + unitPrice(productById(line.id)) * line.qty, 0);
  const discount = coupon === "claimed" && subtotal > 0 ? Math.min(10000, Math.floor((subtotal * 0.1) / 100) * 100) : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  return { count, subtotal, discount, shipping, total: subtotal - discount + shipping, gap: Math.max(0, FREE_SHIPPING - subtotal) };
}
type Totals = ReturnType<typeof totalsOf>;

function matchesShelf(p: Product, shelf: Shelf) {
  if (shelf === "all") return true;
  if (shelf === "new" || shelf === "best") return p.tags.includes(shelf);
  if (shelf === "sale") return Boolean(p.sale);
  return p.cat === shelf;
}
function matchesPrice(p: Product, band: PriceBand) {
  const value = unitPrice(p);
  if (band === "u50") return value <= 50000;
  if (band === "m100") return value > 50000 && value <= 100000;
  if (band === "o100") return value > 100000;
  return true;
}
function sortProducts(list: Product[], sort: Sort) {
  const copy = [...list];
  if (sort === "new") copy.sort((a, b) => b.added - a.added);
  if (sort === "low") copy.sort((a, b) => unitPrice(a) - unitPrice(b));
  if (sort === "high") copy.sort((a, b) => unitPrice(b) - unitPrice(a));
  if (sort === "reviews") copy.sort((a, b) => b.reviews - a.reviews);
  return copy;
}

function useLoc() {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const t = (ko: string, en: string) => (isKo ? ko : en);
  const money = (amount: number) => isKo
    ? `${Math.round(amount).toLocaleString("ko-KR")}원`
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(Math.round(amount));
  const name = (p: Product) => (isKo ? p.ko : p.en);
  const shelfLabel = (s: Shelf) => SHELF_LABEL[s][isKo ? 0 : 1];
  const sizeLabel = (size: string) => (size === "FREE" ? t("FREE", "One size") : size);
  const swatchLabel = (id: SwatchId) => SWATCHES[id][isKo ? "ko" : "en"];
  return { isKo, t, money, name, shelfLabel, sizeLabel, swatchLabel };
}

/* ───────────────────────── small parts ───────────────────────── */

function Photo({ product, swatch, size = 48 }: { product: Product; swatch: SwatchId; size?: number }) {
  const Icon = product.icon;
  return (
    <span className={`shop-photo shop-tone-${product.tone}`} style={swatchStyle(swatch)} aria-hidden="true">
      <i className="shop-photo-sun" />
      <i className="shop-photo-floor" />
      <Icon size={size} strokeWidth={1.35} />
    </span>
  );
}

function Tags({ product }: { product: Product }) {
  const { t } = useLoc();
  const sold = isSoldOut(product);
  if (!sold && product.tags.length === 0) return null;
  return (
    <span className="shop-tags">
      {sold ? <b className="shop-tag shop-tag-sold">{t("품절", "SOLD OUT")}</b> : product.tags.map((tag) => <b key={tag} className={`shop-tag shop-tag-${tag}`}>{tag === "new" ? "NEW" : "BEST"}</b>)}
    </span>
  );
}

function Price({ product, qty = 1, large = false }: { product: Product; qty?: number; large?: boolean }) {
  const { t, money } = useLoc();
  const off = offRate(product);
  return (
    <span className={`shop-price${large ? " is-large" : ""}`}>
      {off > 0 && <b className="shop-off">{off}%</b>}
      <strong>{money(unitPrice(product) * qty)}</strong>
      {off > 0 && <s><span className="shop-sr">{t("정가 ", "Was ")}</span>{money(product.price * qty)}</s>}
    </span>
  );
}

function Rating({ product }: { product: Product }) {
  const { t } = useLoc();
  return (
    <span className="shop-rating">
      <Star size={11} fill="currentColor" aria-hidden="true" />
      <span className="shop-sr">{t("평점 ", "Rating ")}</span>
      {product.rating.toFixed(1)}
      <small>· {t(`리뷰 ${product.reviews}`, `${product.reviews} reviews`)}</small>
    </span>
  );
}

function WishButton({ product, wished, onToggle }: { product: Product; wished: boolean; onToggle: () => void }) {
  const { t, name } = useLoc();
  return (
    <button type="button" className="shop-wish" aria-pressed={wished} aria-label={t(`${name(product)} 찜하기`, `Save ${name(product)}`)} onClick={onToggle}>
      <Heart size={15} fill={wished ? "currentColor" : "none"} />
    </button>
  );
}

function ProductCard({ product, wished, onOpen, onWish }: { product: Product; wished: boolean; onOpen: () => void; onWish: () => void }) {
  const { name, shelfLabel } = useLoc();
  const sold = isSoldOut(product);
  return (
    <article className={`shop-card${sold ? " is-sold" : ""}`}>
      <button type="button" className="shop-card-hit" onClick={onOpen}>
        <span className="shop-card-media">
          <Photo product={product} swatch={product.colors[0]} size={52} />
          <Tags product={product} />
        </span>
        <span className="shop-card-body">
          <span className="shop-card-cat">{shelfLabel(product.cat)}</span>
          <strong className="shop-card-name">{name(product)}</strong>
          <Price product={product} />
          <span className="shop-card-meta">
            <Rating product={product} />
            <span className="shop-dots" aria-hidden="true">{product.colors.map((c) => <i key={c} style={swatchStyle(c)} />)}</span>
          </span>
        </span>
      </button>
      <WishButton product={product} wished={wished} onToggle={onWish} />
    </article>
  );
}

function Empty({ icon: Icon, title, body, action, onAction }: { icon: LucideIcon; title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div className="shop-empty">
      <span><Icon size={22} /></span>
      <strong>{title}</strong>
      <p>{body}</p>
      <button type="button" className="shop-btn shop-secondary" onClick={onAction}>{action}</button>
    </div>
  );
}

function QtyStepper({ value, max, onChange, label, disabled = false }: { value: number; max: number; onChange: (next: number) => void; label: string; disabled?: boolean }) {
  const { t } = useLoc();
  return (
    <div className="shop-stepper" role="group" aria-label={label}>
      <button type="button" aria-label={t("수량 줄이기", "Decrease quantity")} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}><Minus size={13} /></button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={t("수량 늘리기", "Increase quantity")} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}><Plus size={13} /></button>
    </div>
  );
}

function Dialog({ label, variant, onClose, children }: { label: string; variant: "modal" | "drawer" | "panel"; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    (root.querySelector<HTMLElement>("[data-autofocus]") ?? root.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab" || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    root.addEventListener("keydown", key);
    return () => root.removeEventListener("keydown", key);
  }, []);
  return (
    <div className={`shop-scrim shop-scrim-${variant}`} onClick={onClose}>
      <div className={`shop-${variant}`} role="dialog" aria-modal="true" aria-label={label} ref={ref} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DialogHead({ title, eyebrow, onClose, back = false, children }: { title: string; eyebrow?: string; onClose: () => void; back?: boolean; children?: ReactNode }) {
  const { t } = useLoc();
  return (
    <header className={`shop-dialog-head${back ? " is-back" : ""}`}>
      {back && <button type="button" className="shop-icon-btn" onClick={onClose} aria-label={t("뒤로", "Back")} data-autofocus><ArrowLeft size={18} /></button>}
      <div>
        {eyebrow && <span className="shop-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {children}
      {!back && <button type="button" className="shop-icon-btn" onClick={onClose} aria-label={t("닫기", "Close")} data-autofocus><X size={18} /></button>}
    </header>
  );
}

/* ───────────────────────── product detail ───────────────────────── */

function ProductDetail({ product, wished, restock, mobile, onWish, onAdd, onRestock, onViewCart }: {
  product: Product; wished: boolean; restock: boolean; mobile: boolean; onWish: () => void;
  onAdd: (color: SwatchId, size: string, qty: number) => void; onRestock: () => void; onViewCart: () => void;
}) {
  const { t, isKo, money, name, shelfLabel, sizeLabel, swatchLabel } = useLoc();
  const sold = isSoldOut(product);
  const single = product.sizes.length === 1;
  const [color, setColor] = useState<SwatchId>(product.colors[0]);
  const [size, setSize] = useState<string | null>(single && !sold ? product.sizes[0].label : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const sizeGroup = useRef<HTMLFieldSetElement>(null);
  const headingId = useId();
  const max = lineMax(product, size);
  const left = stockOf(product, size);

  function pickSize(label: string) {
    setSize(label);
    setQty((q) => Math.min(q, lineMax(product, label)));
    setError(false);
    setAdded(false);
  }
  function add() {
    if (!size) {
      setError(true);
      sizeGroup.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      return;
    }
    onAdd(color, size, qty);
    setAdded(true);
  }

  const wishButton = (
    <button type="button" className="shop-btn shop-neutral shop-btn-square" aria-pressed={wished} aria-label={t("찜하기", "Save to wishlist")} onClick={onWish}>
      <Heart size={17} fill={wished ? "currentColor" : "none"} />
    </button>
  );
  const actions = sold ? (
    <>
      {wishButton}
      <button type="button" className="shop-btn shop-primary" disabled>{t("품절", "Sold out")}</button>
      <button type="button" className="shop-btn shop-secondary" aria-pressed={restock} onClick={onRestock}>
        <Bell size={15} />{restock ? t("알림 신청됨", "Alert on") : t("재입고 알림", "Notify me")}
      </button>
    </>
  ) : (
    <>
      {wishButton}
      {added ? (
        <button type="button" className="shop-btn shop-primary is-grow" onClick={onViewCart}><Check size={16} />{t("장바구니 보기", "View cart")}</button>
      ) : (
        <button type="button" className="shop-btn shop-primary is-grow" onClick={add}><ShoppingBag size={16} />{t("장바구니 담기", "Add to cart")}</button>
      )}
    </>
  );

  const info = (
    <div className="shop-detail" aria-labelledby={headingId}>
      <div className="shop-detail-media">
        <Photo product={product} swatch={color} size={mobile ? 110 : 120} />
        <Tags product={product} />
      </div>
      <div className="shop-detail-info">
        <span className="shop-eyebrow">{shelfLabel(product.cat)}</span>
        <h3 id={headingId}>{name(product)}</h3>
        <Rating product={product} />
        <Price product={product} large />
        <p className="shop-detail-desc">{isKo ? product.descKo : product.descEn}</p>
        <fieldset className="shop-option">
          <legend>{t("색상", "Color")} <span>{swatchLabel(color)}</span></legend>
          <div className="shop-swatches">
            {product.colors.map((c) => (
              <button key={c} type="button" className="shop-swatch" style={swatchStyle(c)} aria-pressed={color === c} aria-label={swatchLabel(c)} onClick={() => { setColor(c); setAdded(false); }}>
                <i />
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="shop-option" ref={sizeGroup}>
          <legend>{t("사이즈", "Size")} {size && <span>{sizeLabel(size)}</span>}</legend>
          <div className="shop-sizes">
            {product.sizes.map((s) => (
              <button key={s.label} type="button" aria-pressed={size === s.label} disabled={s.stock === 0} onClick={() => pickSize(s.label)}>
                {sizeLabel(s.label)}
                {s.stock === 0 && <span className="shop-sr">{t(" 품절", " sold out")}</span>}
              </button>
            ))}
          </div>
          {error && <p className="shop-field-error" role="alert">{t("사이즈를 먼저 선택해 주세요.", "Please choose a size first.")}</p>}
          {!sold && size && left > 0 && left <= 3 && <p className="shop-low">{t(`품절 임박 · ${left}개 남았어요`, `Almost gone · only ${left} left`)}</p>}
          {sold && <p className="shop-low">{t("지금은 모든 옵션이 품절이에요. 재입고되면 알려 드릴게요.", "Every option is sold out right now. We can tell you when it's back.")}</p>}
        </fieldset>
        <div className="shop-option-row">
          <span>{t("수량", "Quantity")}</span>
          <QtyStepper value={qty} max={max} onChange={(next) => { setQty(next); setAdded(false); }} label={t("수량", "Quantity")} disabled={sold} />
        </div>
        <div className="shop-detail-total">
          <span>{t("총 상품 금액", "Total")}</span>
          <strong>{money(unitPrice(product) * qty)}</strong>
        </div>
        {!mobile && <div className="shop-detail-actions">{actions}</div>}
        <ul className="shop-detail-notes">
          <li><Truck size={14} />{t("5만원 이상 무료배송 · 오늘 주문하면 11월 18일(수) 도착", "Free shipping over ₩50,000 · Order today, arrives Wed, Nov 18")}</li>
          <li><RotateCcw size={14} />{t("받은 날로부터 7일 안에 무료 교환·반품", "Free exchanges and returns within 7 days")}</li>
        </ul>
      </div>
    </div>
  );
  if (!mobile) return info;
  return (
    <>
      <div className="shop-panel-body">{info}</div>
      <div className="shop-panel-bar">{actions}</div>
    </>
  );
}

/* ───────────────────────── cart ───────────────────────── */

function CartLines({ cart, onQty, onRemove }: { cart: CartLine[]; onQty: (key: string, qty: number) => void; onRemove: (key: string) => void }) {
  const { t, name, sizeLabel, swatchLabel } = useLoc();
  return (
    <ul className="shop-lines">
      {cart.map((line) => {
        const product = productById(line.id);
        return (
          <li key={line.key} className="shop-line">
            <span className="shop-line-photo"><Photo product={product} swatch={line.color} size={26} /></span>
            <div className="shop-line-copy">
              <strong>{name(product)}</strong>
              <small>{swatchLabel(line.color)} · {sizeLabel(line.size)}</small>
              <div className="shop-line-bottom">
                <QtyStepper value={line.qty} max={lineMax(product, line.size)} onChange={(qty) => onQty(line.key, qty)} label={t(`${name(product)} 수량`, `${name(product)} quantity`)} />
                <Price product={product} qty={line.qty} />
              </div>
            </div>
            <button type="button" className="shop-icon-btn shop-line-remove" aria-label={t(`${name(product)} 삭제`, `Remove ${name(product)}`)} onClick={() => onRemove(line.key)}>
              <Trash2 size={15} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function FreeShipBar({ totals }: { totals: Totals }) {
  const { t, money } = useLoc();
  const ratio = Math.min(1, totals.subtotal / FREE_SHIPPING);
  const done = totals.gap === 0;
  return (
    <div className={`shop-ship${done ? " is-done" : ""}`}>
      <p>
        <Truck size={15} />
        {done ? t("무료배송 조건을 채웠어요", "You've unlocked free shipping") : t(`${money(totals.gap)} 더 담으면 무료배송이에요`, `Add ${money(totals.gap)} more for free shipping`)}
      </p>
      <div className="shop-progress" role="progressbar" aria-label={t("무료배송까지 남은 금액", "Progress to free shipping")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

function Summary({ totals, coupon, onClaim }: { totals: Totals; coupon: Coupon; onClaim?: () => void }) {
  const { t, money } = useLoc();
  return (
    <dl className="shop-summary">
      <div><dt>{t("상품 금액", "Subtotal")}</dt><dd>{money(totals.subtotal)}</dd></div>
      {coupon === "claimed" && <div className="is-discount"><dt><Ticket size={13} />{t("첫 구매 쿠폰 10%", "First-order coupon 10%")}</dt><dd>−{money(totals.discount)}</dd></div>}
      {coupon === "available" && onClaim && (
        <div className="is-coupon"><dt><Ticket size={13} />{t("받을 수 있는 쿠폰 1장", "1 coupon available")}</dt><dd><button type="button" className="shop-link" onClick={onClaim}>{t("쿠폰 받기", "Claim")}</button></dd></div>
      )}
      <div><dt>{t("배송비", "Shipping")}</dt><dd>{totals.shipping === 0 ? t("무료", "Free") : money(totals.shipping)}</dd></div>
      <div className="is-total"><dt>{t("결제 예정 금액", "Total")}</dt><dd>{money(totals.total)}</dd></div>
    </dl>
  );
}

/* ───────────────────────── checkout ───────────────────────── */

function Checkout({ cart, totals, coupon, mobile, onPlace, onExit }: {
  cart: CartLine[]; totals: Totals; coupon: Coupon; mobile: boolean;
  onPlace: (address: Address, method: PayMethod) => Order; onExit: (to: "orders" | "shop" | "cart") => void;
}) {
  const { t, isKo, money, name, sizeLabel, swatchLabel } = useLoc();
  const id = useId();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<Address>({ name: "", phone: "", address: "", detail: "", memo: MEMOS[0][0] });
  const [tried, setTried] = useState(false);
  const [method, setMethod] = useState<PayMethod>("card");
  const [agree, setAgree] = useState(false);
  const [triedPay, setTriedPay] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const errors: Partial<Record<keyof Address, string>> = {};
  if (form.name.trim().length < 2) errors.name = t("받는 분 이름을 2자 이상 입력해 주세요.", "Enter the recipient's name (2+ characters).");
  if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(form.phone.trim())) errors.phone = t("휴대폰 번호를 확인해 주세요. 예: 010-1234-5678", "Check the phone number, e.g. 010-1234-5678");
  if (form.address.trim().length < 5) errors.address = t("배송받을 주소를 입력해 주세요.", "Enter a delivery address.");
  const memoLabel = (memo: string) => MEMOS.find((m) => m[0] === memo)?.[isKo ? 0 : 1] ?? memo;

  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTried(true);
    const first = (["name", "phone", "address"] as const).find((key) => errors[key]);
    if (first) { (event.currentTarget.elements.namedItem(first) as HTMLInputElement | null)?.focus(); return; }
    setStep(1);
  }
  function submitPay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTriedPay(true);
    if (!agree) { (event.currentTarget.elements.namedItem("agree") as HTMLInputElement | null)?.focus(); return; }
    setPlaced(onPlace(form, method));
    setStep(2);
  }
  const field = (key: "name" | "phone" | "address" | "detail", label: string, placeholder: string, extra: { optional?: boolean; inputMode?: "tel"; autoComplete: string }) => {
    const error = tried ? errors[key] : undefined;
    return (
      <label className="shop-field" key={key}>
        <span>{label}{extra.optional && <em>{t("선택", "Optional")}</em>}</span>
        <input name={key} value={form[key]} placeholder={placeholder} autoComplete={extra.autoComplete} inputMode={extra.inputMode} maxLength={60}
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-${key}` : undefined}
          onChange={(event) => setForm((f) => ({ ...f, [key]: event.target.value }))} />
        {error && <small id={`${id}-${key}`} className="shop-field-error">{error}</small>}
      </label>
    );
  };

  const steps = (
    <ol className="shop-steps" aria-label={t("주문 단계", "Checkout steps")}>
      {[t("배송지", "Shipping"), t("결제", "Payment"), t("완료", "Done")].map((label, index) => (
        <li key={label} className={index < step ? "is-done" : index === step ? "is-current" : ""} aria-current={index === step ? "step" : undefined}>
          <span>{index < step ? <Check size={12} /> : index + 1}</span>{label}
        </li>
      ))}
    </ol>
  );

  if (step === 2 && placed) {
    return (
      <div className="shop-checkout">
        {steps}
        <div className="shop-done">
          <span className="shop-done-icon"><CircleCheck size={30} /></span>
          <h3>{t("주문이 완료됐어요", "Your order is placed")}</h3>
          <p>{t("주문번호", "Order")} <strong>{placed.id}</strong> · {money(placed.total)}</p>
          <p className="shop-muted">{t(`${form.name.trim()} 님께 11월 18일(수)까지 도착할 예정이에요.`, `Arriving for ${form.name.trim()} by Wed, Nov 18.`)}</p>
          <div className="shop-actions">
            <button type="button" className="shop-btn shop-secondary" onClick={() => onExit("orders")}><Package size={15} />{t("주문 내역 보기", "View orders")}</button>
            <button type="button" className="shop-btn shop-primary" onClick={() => onExit("shop")}>{t("쇼핑 계속하기", "Keep shopping")}</button>
          </div>
        </div>
      </div>
    );
  }
  if (cart.length === 0) {
    return <Empty icon={ShoppingBag} title={t("주문할 상품이 없어요", "Nothing to check out")} body={t("장바구니에 상품을 담은 뒤 주문해 주세요.", "Add something to your cart first.")} action={t("쇼핑하러 가기", "Start shopping")} onAction={() => onExit("shop")} />;
  }
  return (
    <div className="shop-checkout">
      {steps}
      <div className={`shop-checkout-grid${mobile ? " is-mobile" : ""}`}>
        <div className="shop-checkout-main">
          {step === 0 ? (
            <form className="shop-form" noValidate onSubmit={submitAddress} aria-label={t("배송지 입력", "Shipping address")}>
              <h3>{t("어디로 보내 드릴까요?", "Where should we send it?")}</h3>
              {tried && Object.keys(errors).length > 0 && <p className="shop-form-alert" role="alert"><CircleAlert size={14} aria-hidden="true" />{t(`확인이 필요한 항목이 ${Object.keys(errors).length}개 있어요.`, `${Object.keys(errors).length} field(s) need attention.`)}</p>}
              <div className="shop-form-row">
                {field("name", t("받는 분", "Recipient"), t("이름", "Full name"), { autoComplete: "name" })}
                {field("phone", t("휴대폰 번호", "Phone"), "010-1234-5678", { autoComplete: "tel", inputMode: "tel" })}
              </div>
              {field("address", t("주소", "Address"), t("도로명 주소", "Street address"), { autoComplete: "street-address" })}
              {field("detail", t("상세 주소", "Apt, suite, etc."), t("동·호수", "Unit number"), { optional: true, autoComplete: "address-line2" })}
              <label className="shop-field">
                <span>{t("배송 메모", "Delivery note")}</span>
                <select name="memo" value={form.memo} onChange={(event) => setForm((f) => ({ ...f, memo: event.target.value }))}>
                  {MEMOS.map(([ko, en]) => <option key={ko} value={ko}>{isKo ? ko : en}</option>)}
                </select>
              </label>
              <div className="shop-actions">
                <button type="button" className="shop-btn shop-neutral" onClick={() => onExit("cart")}>{t("장바구니로", "Back to cart")}</button>
                <button type="submit" className="shop-btn shop-primary">{t("결제 수단 선택", "Continue to payment")}<ChevronRight size={15} /></button>
              </div>
            </form>
          ) : (
            <form className="shop-form" noValidate onSubmit={submitPay} aria-label={t("결제", "Payment")}>
              <section className="shop-address-card">
                <div>
                  <span className="shop-eyebrow"><MapPin size={12} />{t("배송지", "Ship to")}</span>
                  <strong>{form.name.trim()} · {form.phone.trim()}</strong>
                  <p>{form.address.trim()} {form.detail.trim()}</p>
                  <small>{memoLabel(form.memo)}</small>
                </div>
                <button type="button" className="shop-link" onClick={() => setStep(0)}>{t("변경", "Edit")}</button>
              </section>
              <fieldset className="shop-pay-methods">
                <legend>{t("결제 수단", "Payment method")}</legend>
                {PAY_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <label key={m.id} className={`shop-pay${method === m.id ? " is-on" : ""}`}>
                      <input type="radio" name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                      <span className="shop-pay-icon"><Icon size={17} /></span>
                      <span><strong>{isKo ? m.ko : m.en}</strong><small>{isKo ? m.subKo : m.subEn}</small></span>
                    </label>
                  );
                })}
              </fieldset>
              <label className="shop-check">
                <input type="checkbox" name="agree" checked={agree} onChange={(event) => setAgree(event.target.checked)}
                  aria-invalid={triedPay && !agree ? true : undefined} aria-describedby={triedPay && !agree ? `${id}-agree` : undefined} />
                <span>{t("주문 상품과 결제 금액을 확인했어요", "I've reviewed my items and the total")} <em>{t("(필수)", "(required)")}</em></span>
              </label>
              {triedPay && !agree && <small id={`${id}-agree`} className="shop-field-error" role="alert">{t("결제하려면 주문 내용 확인에 동의해 주세요.", "Please confirm your order to continue.")}</small>}
              <p className="shop-muted shop-demo-note">{t("프리뷰라서 실제 결제는 일어나지 않아요.", "This is a preview, so no real payment happens.")}</p>
              <div className="shop-actions">
                <button type="button" className="shop-btn shop-neutral" onClick={() => setStep(0)}><ChevronLeft size={15} />{t("이전", "Back")}</button>
                <button type="submit" className="shop-btn shop-primary">{t(`${money(totals.total)} 결제하기`, `Pay ${money(totals.total)}`)}</button>
              </div>
            </form>
          )}
        </div>
        <aside className="shop-checkout-aside" aria-label={t("주문 요약", "Order summary")}>
          <h3>{t(`주문 상품 ${totals.count}개`, `${totals.count} item(s)`)}</h3>
          <ul className="shop-mini-lines">
            {cart.map((line) => {
              const product = productById(line.id);
              return (
                <li key={line.key}>
                  <span className="shop-line-photo is-mini"><Photo product={product} swatch={line.color} size={18} /></span>
                  <span><strong>{name(product)}</strong><small>{swatchLabel(line.color)} · {sizeLabel(line.size)} · {t(`${line.qty}개`, `×${line.qty}`)}</small></span>
                  <b>{money(unitPrice(product) * line.qty)}</b>
                </li>
              );
            })}
          </ul>
          <Summary totals={totals} coupon={coupon} />
        </aside>
      </div>
    </div>
  );
}


/* ───────────────────────── orders ───────────────────────── */

function OrdersList({ orders, compact = false, onCancel, onReorder, onTrack }: {
  orders: Order[]; compact?: boolean; onCancel: (id: string) => void; onReorder: (order: Order) => void; onTrack: (order: Order) => void;
}) {
  const { t, isKo, money, name } = useLoc();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [confirm, setConfirm] = useState<string | null>(null);
  const visible = orders.filter((o) => filter === "all" || o.status === filter);
  const count = (s: Status) => orders.filter((o) => o.status === s).length;
  return (
    <div className="shop-orders">
      {!compact && (
        <div className="shop-order-stats">
          {STATUSES.map((s) => {
            const Icon = STATUS[s].icon;
            return (
              <div key={s} className={`shop-order-stat shop-status-${STATUS[s].tone}`}>
                <Icon size={16} />
                <span>{isKo ? STATUS[s].ko : STATUS[s].en}</span>
                <strong>{count(s)}</strong>
              </div>
            );
          })}
        </div>
      )}
      <div className="shop-chips" role="group" aria-label={t("주문 상태 필터", "Filter by status")}>
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {s === "all" ? t("전체", "All") : isKo ? STATUS[s].ko : STATUS[s].en}
            <span>{s === "all" ? orders.length : count(s)}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="shop-orders-empty">{t("이 상태의 주문이 없어요.", "No orders with this status.")}</p>}
      {visible.map((order) => {
        const meta = STATUS[order.status];
        const Icon = meta.icon;
        return (
          <article key={order.id} className="shop-order">
            <header>
              <div>
                <strong>{isKo ? order.dateKo : order.dateEn}</strong>
                <small>{t("주문번호", "Order")} {order.id}</small>
              </div>
              <span className={`shop-badge shop-status-${meta.tone}`}><Icon size={12} />{isKo ? meta.ko : meta.en}</span>
            </header>
            <ul>
              {order.lines.map((line) => {
                const product = productById(line.id);
                return (
                  <li key={`${line.id}-${line.color}-${line.size}`}>
                    <span className="shop-line-photo is-mini"><Photo product={product} swatch={line.color} size={18} /></span>
                    <span><strong>{name(product)}</strong><small>{t(`${line.qty}개`, `×${line.qty}`)} · {money(unitPrice(product) * line.qty)}</small></span>
                  </li>
                );
              })}
            </ul>
            <footer>
              <span>{t("결제 금액", "Total")} <strong>{money(order.total)}</strong></span>
              <div className="shop-actions is-tight">
                {order.status === "paid" && <button type="button" className="shop-btn shop-neutral is-small" aria-expanded={confirm === order.id} onClick={() => setConfirm(confirm === order.id ? null : order.id)}>{t("주문 취소", "Cancel order")}</button>}
                {order.status === "shipping" && <button type="button" className="shop-btn shop-secondary is-small" onClick={() => onTrack(order)}><Truck size={13} />{t("배송 조회", "Track")}</button>}
                {(order.status === "delivered" || order.status === "cancelled") && <button type="button" className="shop-btn shop-secondary is-small" onClick={() => onReorder(order)}><RotateCcw size={13} />{t("다시 담기", "Buy again")}</button>}
              </div>
            </footer>
            {confirm === order.id && (
              <div className="shop-confirm" role="alert">
                <p>{t(`이 주문을 취소할까요? ${money(order.total)}은 3영업일 안에 환불돼요.`, `Cancel this order? ${money(order.total)} will be refunded within 3 business days.`)}</p>
                <div className="shop-actions is-tight">
                  <button type="button" className="shop-btn shop-neutral is-small" onClick={() => setConfirm(null)}>{t("아니요", "Keep it")}</button>
                  <button type="button" className="shop-btn shop-danger is-small" onClick={() => { onCancel(order.id); setConfirm(null); }}>{t("취소 확정", "Confirm cancel")}</button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

/* ───────────────────────── main ───────────────────────── */

function ShopPreview({ mobile = false }: { mobile?: boolean }) {
  const { t, money, name, shelfLabel } = useLoc();
  const [view, setView] = useState<WebView>("shop");
  const [tab, setTab] = useState<AppTab>("home");
  const [shelf, setShelf] = useState<Shelf>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recommended");
  const [price, setPrice] = useState<PriceBand>("all");
  const [inStock, setInStock] = useState(false);
  const [wish, setWish] = useState<number[]>([4, 10]);
  const [cart, setCart] = useState<CartLine[]>(INITIAL_CART);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [coupon, setCoupon] = useState<Coupon>("available");
  const [restock, setRestock] = useState<number[]>([]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [banner, setBanner] = useState(0);
  const [push, setPush] = useState(true);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const totals = totalsOf(cart, coupon);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const say = (text: string) => setNotice((current) => ({ id: (current?.id ?? 0) + 1, text }));
  const q = query.trim().toLowerCase();
  const visible = sortProducts(PRODUCTS.filter((p) => matchesShelf(p, shelf) && matchesPrice(p, price) && (!inStock || !isSoldOut(p)) && (!q || `${p.ko} ${p.en}`.toLowerCase().includes(q))), sort);
  const filtered = shelf !== "all" || price !== "all" || inStock || q !== "";
  const shelfCount = (s: Shelf) => PRODUCTS.filter((p) => matchesShelf(p, s)).length;
  const wished = PRODUCTS.filter((p) => wish.includes(p.id));
  const current = overlay?.kind === "product" ? productById(overlay.id) : null;

  function scrollTop() {
    const node = mobile ? scroller.current?.closest<HTMLElement>(".phone-scroll") : scroller.current;
    node?.scrollTo?.({ top: 0 });
  }
  function go(next: WebView) {
    setView(next);
    scrollTop();
    requestAnimationFrame(() => heading.current?.focus());
  }
  function goTab(next: AppTab) { setTab(next); scrollTop(); }
  function pickShelf(next: Shelf) {
    setShelf(next);
    if (mobile) goTab("browse"); else if (view !== "shop") go("shop");
  }
  function resetFilters() { setShelf("all"); setPrice("all"); setInStock(false); setQuery(""); setSort("recommended"); }
  function open(next: Overlay) { opener.current = document.activeElement as HTMLElement | null; setOverlay(next); }
  function close() { setOverlay(null); requestAnimationFrame(() => opener.current?.focus()); }
  function toggleWish(p: Product) {
    const on = wish.includes(p.id);
    setWish((list) => (on ? list.filter((id) => id !== p.id) : [...list, p.id]));
    say(on ? t(`위시리스트에서 뺐어요 · ${p.ko}`, `Removed from wishlist · ${p.en}`) : t(`위시리스트에 담았어요 · ${p.ko}`, `Saved to wishlist · ${p.en}`));
  }
  function addToCart(p: Product, color: SwatchId, size: string, qty: number) {
    const key = `${p.id}-${color}-${size}`;
    const max = lineMax(p, size);
    setCart((lines) => (lines.some((l) => l.key === key)
      ? lines.map((l) => (l.key === key ? { ...l, qty: Math.min(max, l.qty + qty) } : l))
      : [...lines, { key, id: p.id, color, size, qty }]));
    say(t(`장바구니에 담았어요 · ${p.ko}`, `Added to cart · ${p.en}`));
  }
  function setQty(key: string, qty: number) { setCart((lines) => lines.map((l) => (l.key === key ? { ...l, qty } : l))); }
  function remove(key: string) {
    const line = cart.find((l) => l.key === key);
    setCart((lines) => lines.filter((l) => l.key !== key));
    if (line) say(t(`장바구니에서 뺐어요 · ${productById(line.id).ko}`, `Removed from cart · ${productById(line.id).en}`));
  }
  function claimCoupon() { setCoupon("claimed"); say(t("첫 구매 10% 쿠폰을 받았어요 · 최대 10,000원", "10% first-order coupon claimed · up to ₩10,000")); }
  function toggleRestock(p: Product) {
    const on = restock.includes(p.id);
    setRestock((list) => (on ? list.filter((id) => id !== p.id) : [...list, p.id]));
    say(on ? t("재입고 알림을 껐어요", "Restock alert turned off") : t(`재입고되면 알려 드릴게요 · ${p.ko}`, `We'll tell you when it's back · ${p.en}`));
  }
  function placeOrder(address: Address): Order {
    const order: Order = {
      id: `LM-2611-${String(451 + orders.length).padStart(4, "0")}`, dateKo: "11월 15일", dateEn: "Nov 15",
      lines: cart.map((l) => ({ id: l.id, color: l.color, size: l.size, qty: l.qty })), total: totals.total, status: "paid",
    };
    setOrders((list) => [order, ...list]);
    setCart([]);
    if (coupon === "claimed") setCoupon("used");
    say(t(`주문이 완료됐어요 · ${address.name.trim()} 님`, `Order placed for ${address.name.trim()}`));
    return order;
  }
  function cancelOrder(id: string) {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
    say(t("주문을 취소했어요. 환불은 3영업일 안에 진행돼요.", "Order cancelled. Your refund is on its way."));
  }
  function reorder(order: Order) {
    const ok = order.lines.filter((line) => stockOf(productById(line.id), line.size) > 0);
    if (ok.length === 0) { say(t("모든 상품이 품절이라 담을 수 없어요", "Those items are sold out right now")); return; }
    setCart((lines) => {
      let next = [...lines];
      for (const line of ok) {
        const key = `${line.id}-${line.color}-${line.size}`;
        const max = lineMax(productById(line.id), line.size);
        next = next.some((l) => l.key === key) ? next.map((l) => (l.key === key ? { ...l, qty: Math.min(max, l.qty + line.qty) } : l)) : [...next, { key, ...line, qty: Math.min(max, line.qty) }];
      }
      return next;
    });
    say(t(`${ok.length}개 상품을 장바구니에 다시 담았어요`, `Added ${ok.length} item(s) back to your cart`));
  }
  function track(order: Order) { say(t(`${order.id} · 11월 16일(월) 도착 예정이에요`, `${order.id} · Arriving Mon, Nov 16`)); }
  function exitCheckout(to: "orders" | "shop" | "cart") {
    if (mobile) {
      setOverlay(null);
      if (to === "orders") goTab("my"); else if (to === "shop") goTab("home"); else goTab("cart");
      return;
    }
    if (to === "cart") { go("shop"); open({ kind: "cart" }); return; }
    go(to === "orders" ? "orders" : "shop");
  }
  function startCheckout() {
    if (mobile) { open({ kind: "checkout" }); return; }
    setOverlay(null);
    go("checkout");
  }

  const card = (p: Product) => <ProductCard key={p.id} product={p} wished={wish.includes(p.id)} onOpen={() => open({ kind: "product", id: p.id })} onWish={() => toggleWish(p)} />;
  const slide = BANNERS[banner];
  const bannerEl = (
    <section className={`shop-banner shop-banner-${slide.tone}`} aria-roledescription={t("배너", "carousel")} aria-label={t("기획전", "Featured")}>
      <div className="shop-banner-copy">
        <span className="shop-eyebrow">{slide.eyebrow}</span>
        <h2>{t(slide.ko, slide.en)}</h2>
        <p>{t(slide.subKo, slide.subEn)}</p>
        <button type="button" className="shop-banner-cta" onClick={() => { pickShelf(slide.shelf); }}>{t(slide.ctaKo, slide.ctaEn)}<ChevronRight size={15} /></button>
      </div>
      <div className="shop-banner-art" aria-hidden="true">
        <span className="shop-banner-tile is-back"><Photo product={productById(9)} swatch="mist" size={34} /></span>
        <span className="shop-banner-tile"><Photo product={productById(slide.art)} swatch={productById(slide.art).colors[0]} size={mobile ? 46 : 64} /></span>
      </div>
      <div className="shop-banner-dots">
        {BANNERS.map((b, index) => (
          <button key={b.eyebrow} type="button" aria-label={t(`배너 ${index + 1} / ${BANNERS.length}`, `Slide ${index + 1} of ${BANNERS.length}`)} aria-current={banner === index ? "true" : undefined} onClick={() => setBanner(index)} />
        ))}
      </div>
    </section>
  );
  const chips = (
    <div className={`shop-chips${mobile ? " is-scroll" : ""}`} role="group" aria-label={t("카테고리", "Categories")}>
      {SHELVES.map((s) => (
        <button key={s} type="button" aria-pressed={shelf === s} onClick={() => setShelf(s)}>{shelfLabel(s)}<span>{shelfCount(s)}</span></button>
      ))}
    </div>
  );
  const toolbar = (
    <div className="shop-toolbar">
      <p aria-live="polite"><strong>{shelfLabel(shelf)}</strong> {t(`${visible.length}개`, `${visible.length} items`)}{q && <span className="shop-muted"> · “{query.trim()}”</span>}</p>
      <div className="shop-toolbar-controls">
        <label className="shop-select">
          <span className="shop-sr">{t("가격대", "Price range")}</span>
          <select value={price} onChange={(event) => setPrice(event.target.value as PriceBand)}>
            {PRICES.map(([id, ko, en]) => <option key={id} value={id}>{t(ko, en)}</option>)}
          </select>
        </label>
        <label className="shop-check is-inline">
          <input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} />
          <span>{t("품절 제외", "In stock only")}</span>
        </label>
        <label className="shop-select">
          <span className="shop-sr">{t("정렬", "Sort by")}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            {SORTS.map(([id, ko, en]) => <option key={id} value={id}>{t(ko, en)}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
  const results = visible.length > 0
    ? <div className={`shop-grid${mobile ? " is-two" : ""}`}>{visible.map(card)}</div>
    : <Empty icon={Search} title={t("조건에 맞는 상품이 없어요", "No products match")} body={t("필터를 바꾸거나 다른 검색어를 입력해 보세요.", "Try other filters or a different search.")} action={t("필터 초기화", "Reset filters")} onAction={resetFilters} />;
  const searchBox = (
    <label className="shop-search">
      <Search size={15} aria-hidden="true" />
      <input ref={searchRef} type="search" aria-label={t("상품 검색", "Search products")} placeholder={t("코트, 스니커즈, 머그…", "Coats, sneakers, mugs…")} value={query}
        onChange={(event) => { setQuery(event.target.value); if (!mobile && view !== "shop") setView("shop"); }} />
      {query && <button type="button" aria-label={t("검색어 지우기", "Clear search")} onClick={() => { setQuery(""); searchRef.current?.focus(); }}><X size={13} /></button>}
    </label>
  );
  const couponCard = (
    <div className="shop-promo shop-promo-accent">
      <span className="shop-promo-icon"><Ticket size={17} /></span>
      <div>
        <strong>{t("첫 구매 10% 쿠폰", "10% off your first order")}</strong>
        <p>{coupon === "used" ? t("이미 사용한 쿠폰이에요", "Already used") : t("최대 10,000원 · 장바구니에 바로 적용", "Up to ₩10,000 · applied in your cart")}</p>
      </div>
      <button type="button" className="shop-btn shop-secondary is-small" disabled={coupon !== "available"} onClick={claimCoupon}>
        {coupon === "available" ? t("받기", "Claim") : coupon === "claimed" ? <><Check size={13} />{t("받았어요", "Claimed")}</> : t("사용 완료", "Used")}
      </button>
    </div>
  );
  const toast = (
    <div className={`shop-toast-region${mobile ? " is-app" : ""}`} role="status" aria-live="polite">
      {notice && <div className="shop-toast" key={notice.id}><Check size={15} aria-hidden="true" />{notice.text}</div>}
    </div>
  );
  const productLayer = current && (
    <Dialog label={name(current)} variant={mobile ? "panel" : "modal"} onClose={close}>
      {mobile
        ? <DialogHead title={t("상품 정보", "Product")} onClose={close} back>
          <button type="button" className="shop-icon-btn shop-has-badge" aria-label={t(`장바구니, ${totals.count}개`, `Cart, ${totals.count} items`)} onClick={() => { setOverlay(null); goTab("cart"); }}>
            <ShoppingBag size={18} />{totals.count > 0 && <span className="shop-count-badge" aria-hidden="true">{totals.count}</span>}
          </button>
        </DialogHead>
        : <DialogHead title={name(current)} eyebrow="LOOM" onClose={close} />}
      <ProductDetail key={current.id} product={current} wished={wish.includes(current.id)} restock={restock.includes(current.id)} mobile={mobile}
        onWish={() => toggleWish(current)} onAdd={(color, size, qty) => addToCart(current, color, size, qty)} onRestock={() => toggleRestock(current)}
        onViewCart={() => { if (mobile) { setOverlay(null); goTab("cart"); } else setOverlay({ kind: "cart" }); }} />
    </Dialog>
  );

  /* ───── app ───── */
  if (mobile) {
    const tabs: Array<{ id: AppTab; label: string; icon: LucideIcon; badge?: number }> = [
      { id: "home", label: t("홈", "Home"), icon: House },
      { id: "browse", label: t("카테고리", "Shop"), icon: LayoutGrid },
      { id: "wish", label: t("위시", "Saved"), icon: Heart, badge: wish.length },
      { id: "cart", label: t("장바구니", "Cart"), icon: ShoppingBag, badge: totals.count },
      { id: "my", label: t("마이", "Me"), icon: User },
    ];
    const titles: Record<AppTab, string> = { home: "", browse: t("카테고리", "Shop"), wish: t("위시리스트", "Wishlist"), cart: t("장바구니", "Cart"), my: t("마이페이지", "My page") };
    const content = (
      <div className="shop-app-content" ref={scroller} inert={overlay !== null}>
        <header className="shop-appbar">
          {tab === "home" ? <span className="shop-brand"><span className="shop-brand-mark"><Shirt size={14} /></span>loom<span className="shop-brand-dot">.</span></span> : <h1>{titles[tab]}</h1>}
          {tab !== "browse" && (
            <button type="button" className="shop-icon-btn" aria-label={t("검색", "Search")} onClick={() => { goTab("browse"); requestAnimationFrame(() => searchRef.current?.focus()); }}>
              <Search size={19} />
            </button>
          )}
        </header>
        {tab === "home" && (
          <div className="shop-app-page">
            {bannerEl}
            <nav className="shop-quick" aria-label={t("바로가기", "Shortcuts")}>
              {QUICK.map(({ shelf: s, icon: Icon }, index) => (
                <button key={s} type="button" onClick={() => pickShelf(s)}>
                  <span className={`shop-quick-icon shop-tone-${index % 4}`}><Icon size={19} /></span>{shelfLabel(s)}
                </button>
              ))}
            </nav>
            <section>
              <div className="shop-section-head">
                <h2>{t("지금 많이 찾는", "Trending now")}</h2>
                <button type="button" className="shop-link" onClick={() => { setSort("reviews"); pickShelf("all"); }}>{t("더보기", "See all")}<ChevronRight size={13} /></button>
              </div>
              <div className="shop-grid is-two">{sortProducts(PRODUCTS, "reviews").slice(0, 4).map(card)}</div>
            </section>
            <section>
              <div className="shop-section-head">
                <h2>{t("새로 들어왔어요", "Just in")}</h2>
                <button type="button" className="shop-link" onClick={() => pickShelf("new")}>{t("더보기", "See all")}<ChevronRight size={13} /></button>
              </div>
              <div className="shop-rail">{sortProducts(PRODUCTS, "new").slice(0, 5).map(card)}</div>
            </section>
            {couponCard}
          </div>
        )}
        {tab === "browse" && (
          <div className="shop-app-page is-tight">
            {searchBox}
            {chips}
            {toolbar}
            {results}
            {filtered && visible.length > 0 && <button type="button" className="shop-link shop-reset" onClick={resetFilters}>{t("필터 초기화", "Reset filters")}</button>}
          </div>
        )}
        {tab === "wish" && (
          <div className="shop-app-page">
            {wished.length > 0
              ? <><p className="shop-muted">{t(`찜한 상품 ${wished.length}개`, `${wished.length} saved item(s)`)}</p><div className="shop-grid is-two">{wished.map(card)}</div></>
              : <Empty icon={Heart} title={t("아직 찜한 상품이 없어요", "Nothing saved yet")} body={t("마음에 드는 상품의 하트를 눌러 모아 보세요.", "Tap the heart on anything you like.")} action={t("둘러보기", "Browse")} onAction={() => goTab("browse")} />}
          </div>
        )}
        {tab === "cart" && (
          <div className="shop-app-page">
            {cart.length > 0 ? (
              <>
                <FreeShipBar totals={totals} />
                <CartLines cart={cart} onQty={setQty} onRemove={remove} />
                <Summary totals={totals} coupon={coupon} onClaim={claimCoupon} />
                <div className="shop-sticky-bar">
                  <button type="button" className="shop-btn shop-primary is-block" onClick={startCheckout}>{t(`${money(totals.total)} 주문하기`, `Check out · ${money(totals.total)}`)}</button>
                </div>
              </>
            ) : <Empty icon={ShoppingBag} title={t("장바구니가 비어 있어요", "Your cart is empty")} body={t("마음에 드는 상품을 담아 보세요.", "Add something you love.")} action={t("쇼핑하러 가기", "Start shopping")} onAction={() => goTab("home")} />}
          </div>
        )}
        {tab === "my" && (
          <div className="shop-app-page">
            <section className="shop-profile">
              <span className="shop-avatar">J</span>
              <div>
                <strong>{t("지우 님", "Jiwoo")}</strong>
                <small>{t("LOOM 멤버 · 적립금 3,200원", "LOOM member · ₩3,200 in points")}</small>
              </div>
            </section>
            <div className="shop-my-stats">
              <button type="button" onClick={() => goTab("wish")}><strong>{wish.length}</strong>{t("위시", "Saved")}</button>
              <button type="button" onClick={() => goTab("cart")}><strong>{totals.count}</strong>{t("장바구니", "In cart")}</button>
              <div><strong>{coupon === "available" || coupon === "claimed" ? 1 : 0}</strong>{t("쿠폰", "Coupons")}</div>
            </div>
            {coupon === "available" && couponCard}
            <h2 className="shop-my-title">{t("주문 내역", "Orders")}</h2>
            <OrdersList orders={orders} compact onCancel={cancelOrder} onReorder={reorder} onTrack={track} />
            <div className="shop-settings">
              <button type="button" onClick={() => say(t("기본 배송지를 확인했어요", "Default address checked"))}><MapPin size={16} />{t("배송지 관리", "Addresses")}<ChevronRight size={14} /></button>
              <div className="shop-settings-row">
                <Bell size={16} /><span id="shop-push-label">{t("혜택 알림 받기", "Deal notifications")}</span>
                <button type="button" role="switch" className="shop-switch" aria-checked={push} aria-labelledby="shop-push-label" onClick={() => { setPush(!push); say(!push ? t("혜택 알림을 켰어요", "Deal notifications on") : t("혜택 알림을 껐어요", "Deal notifications off")); }}><i /></button>
              </div>
              <button type="button" onClick={() => say(t("고객센터는 평일 10시–18시에 연결돼요", "Support is open weekdays 10:00–18:00"))}><Receipt size={16} />{t("고객센터", "Help center")}<ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    );
    const nav = (
      <nav className="shop-tabbar" aria-label={t("앱 메뉴", "App menu")} inert={overlay !== null}>
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => goTab(id)} aria-label={badge ? t(`${label}, ${badge}개`, `${label}, ${badge}`) : undefined}>
            <span className="shop-has-badge"><Icon size={20} fill={id === "wish" && tab === id ? "currentColor" : "none"} />{badge ? <span className="shop-count-badge" aria-hidden="true">{badge}</span> : null}</span>
            <span aria-hidden={badge ? true : undefined}>{label}</span>
          </button>
        ))}
      </nav>
    );
    const appOverlay = (
      <>
        {productLayer}
        {overlay?.kind === "checkout" && (
          <Dialog label={t("주문/결제", "Checkout")} variant="panel" onClose={close}>
            <DialogHead title={t("주문/결제", "Checkout")} onClose={close} back />
            <div className="shop-panel-body is-padded">
              <Checkout cart={cart} totals={totals} coupon={coupon} mobile onPlace={placeOrder} onExit={exitCheckout} />
            </div>
          </Dialog>
        )}
        {toast}
      </>
    );
    return <div className="shop shop-app"><IntroPhone nav={nav} overlay={appOverlay}>{content}</IntroPhone></div>;
  }

  /* ───── web ───── */
  const pageHead = (eyebrow: string, title: string, body: string, side?: ReactNode) => (
    <div className="shop-page-head">
      <div>
        <span className="shop-eyebrow">{eyebrow}</span>
        <h1 ref={heading} tabIndex={-1}>{title}</h1>
        <p>{body}</p>
      </div>
      {side}
    </div>
  );
  return (
    <div className="shop shop-web">
      <IntroViewport>
        <div className="shop-shell">
          <div className="shop-scroll" ref={scroller} inert={overlay !== null}>
            <header className="shop-header">
              <div className="shop-header-top">
                <button type="button" className="shop-brand" onClick={() => { resetFilters(); go("shop"); }} aria-label={t("loom. 홈으로", "loom. home")}>
                  <span className="shop-brand-mark"><Shirt size={16} /></span>loom<span className="shop-brand-dot">.</span>
                </button>
                {searchBox}
                <div className="shop-header-actions">
                  <button type="button" className="shop-icon-btn" aria-label={t("주문 내역", "Orders")} aria-current={view === "orders" ? "page" : undefined} onClick={() => go("orders")}><Package size={19} /></button>
                  <button type="button" className="shop-icon-btn shop-has-badge" aria-label={t(`위시리스트, ${wish.length}개`, `Wishlist, ${wish.length} items`)} aria-current={view === "wishlist" ? "page" : undefined} onClick={() => go("wishlist")}>
                    <Heart size={19} />{wish.length > 0 && <span className="shop-count-badge" aria-hidden="true">{wish.length}</span>}
                  </button>
                  <button type="button" className="shop-icon-btn shop-has-badge" aria-label={t(`장바구니, ${totals.count}개`, `Cart, ${totals.count} items`)} onClick={() => open({ kind: "cart" })}>
                    <ShoppingBag size={19} />{totals.count > 0 && <span className="shop-count-badge" aria-hidden="true">{totals.count}</span>}
                  </button>
                  <span className="shop-avatar" aria-hidden="true">J</span>
                </div>
              </div>
              <nav className="shop-nav" aria-label={t("쇼핑 카테고리", "Shop categories")}>
                {SHELVES.filter((s) => s !== "best").map((s) => (
                  <button key={s} type="button" aria-current={view === "shop" && shelf === s ? "page" : undefined} className={s === "sale" ? "is-sale" : undefined} onClick={() => pickShelf(s)}>{shelfLabel(s)}</button>
                ))}
                <span className="shop-nav-note"><Truck size={14} />{t("5만원 이상 무료배송", "Free shipping over ₩50,000")}</span>
              </nav>
            </header>
            <main className="shop-main">
              {view === "shop" && (
                <>
                  {!q && (
                    <div className="shop-hero">
                      {bannerEl}
                      <div className="shop-hero-side">
                        {couponCard}
                        <div className="shop-promo shop-promo-secondary">
                          <span className="shop-promo-icon"><Truck size={17} /></span>
                          <div>
                            <strong>{t("5만원 이상 무료배송", "Free shipping over ₩50,000")}</strong>
                            <p>{t("오후 2시 전 주문은 오늘 출발해요", "Order by 2 p.m. to ship today")}</p>
                          </div>
                        </div>
                        <div className="shop-promo">
                          <span className="shop-promo-icon is-primary"><RotateCcw size={17} /></span>
                          <div>
                            <strong>{t("7일 무료 교환·반품", "Free 7-day returns")}</strong>
                            <p>{t("사이즈가 맞지 않아도 걱정 없어요", "No stress if the size is off")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="shop-section-head">
                    <div>
                      <span className="shop-eyebrow">SHOP ALL</span>
                      <h1 ref={heading} tabIndex={-1}>{q ? t("검색 결과", "Search results") : t("오늘의 셀렉션", "Today's selection")}</h1>
                    </div>
                    {filtered && <button type="button" className="shop-link" onClick={resetFilters}><RotateCcw size={13} />{t("필터 초기화", "Reset filters")}</button>}
                  </div>
                  {chips}
                  {toolbar}
                  {results}
                </>
              )}
              {view === "wishlist" && (
                <>
                  {pageHead("WISHLIST", t("위시리스트", "Wishlist"), t("마음에 담아 둔 상품을 모아 봤어요.", "Everything you've saved, in one place."))}
                  {wished.length > 0
                    ? <div className="shop-grid">{wished.map(card)}</div>
                    : <Empty icon={Heart} title={t("아직 찜한 상품이 없어요", "Nothing saved yet")} body={t("마음에 드는 상품의 하트를 눌러 모아 보세요.", "Click the heart on anything you like.")} action={t("둘러보기", "Browse products")} onAction={() => go("shop")} />}
                </>
              )}
              {view === "orders" && (
                <>
                  {pageHead("ORDERS", t("주문 내역", "Orders"), t("결제부터 배송까지 진행 상황을 확인해요.", "Follow each order from payment to your door."))}
                  <OrdersList orders={orders} onCancel={cancelOrder} onReorder={reorder} onTrack={track} />
                </>
              )}
              {view === "checkout" && (
                <>
                  {pageHead("CHECKOUT", t("주문/결제", "Checkout"), t("배송지와 결제 수단을 확인하면 주문이 끝나요.", "Confirm where it's going and how you'll pay."))}
                  <Checkout cart={cart} totals={totals} coupon={coupon} mobile={false} onPlace={placeOrder} onExit={exitCheckout} />
                </>
              )}
            </main>
            <footer className="shop-footer">
              <div>
                <span className="shop-brand is-small"><span className="shop-brand-mark"><Shirt size={12} /></span>loom<span className="shop-brand-dot">.</span></span>
                <p>{t("오래 입고 오래 쓰는 것들을 골라요.", "Things made to be worn and used for years.")}</p>
              </div>
              <p><Check size={12} />{t("장바구니와 주문은 이 프리뷰 안에서만 저장돼요", "Cart and orders stay inside this preview")}</p>
            </footer>
          </div>
          {productLayer}
          {overlay?.kind === "cart" && (
            <Dialog label={t("장바구니", "Cart")} variant="drawer" onClose={close}>
              <DialogHead title={t(`장바구니 ${totals.count}`, `Cart (${totals.count})`)} eyebrow="LOOM" onClose={close} />
              <div className="shop-drawer-body">
                {cart.length > 0
                  ? <CartLines cart={cart} onQty={setQty} onRemove={remove} />
                  : <Empty icon={ShoppingBag} title={t("장바구니가 비어 있어요", "Your cart is empty")} body={t("마음에 드는 상품을 담아 보세요.", "Add something you love.")} action={t("쇼핑 계속하기", "Keep shopping")} onAction={close} />}
              </div>
              {cart.length > 0 && (
                <footer className="shop-drawer-foot">
                  <FreeShipBar totals={totals} />
                  <Summary totals={totals} coupon={coupon} onClaim={claimCoupon} />
                  <button type="button" className="shop-btn shop-primary is-block" onClick={startCheckout}>{t(`${money(totals.total)} 주문하기`, `Check out · ${money(totals.total)}`)}</button>
                </footer>
              )}
            </Dialog>
          )}
          {toast}
        </div>
      </IntroViewport>
    </div>
  );
}

export function ShopWeb() { return <ShopPreview />; }
export function ShopApp() { return <ShopPreview mobile />; }
