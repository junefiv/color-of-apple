"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpDown, Bath, BedDouble, Bell, Bus, CalendarDays, Camera, Car, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Clock,
  Coffee, Compass, Dumbbell, Flame, Footprints, Heart, Hotel, House, Landmark, Luggage, Map as MapIcon, MapPin, Minus, PawPrint, Plane,
  Plus, Route, Search, ShieldCheck, Sparkles, Star, Sunset, Tent, Ticket, Trash2, TreePalm, User, Users, Utensils, Waves, Wifi, X,
  type LucideIcon,
} from "lucide-react";
import { IntroPhone, IntroViewport } from "../kinds/shared";
import { useMatchuStore } from "@/lib/store";
import "./travel-preview.css";

/* ------------------------------------------------------------------ data */

type L = readonly [string, string];
type StayType = "hotel" | "pension" | "hanok" | "camping" | "resort";
type TagId = "deal" | "free" | "last";
type Amenity = "wifi" | "parking" | "pool" | "breakfast" | "pet" | "bbq" | "bath" | "gym" | "ocean";
type Sort = "recommended" | "price" | "rating" | "reviews";
type Stay = {
  id: number; name: L; region: L; type: StayType; rating: number; reviews: number; price: number;
  tags: TagId[]; scene: number; amenities: Amenity[]; x: number; y: number; blurb: L;
};
type Room = { id: string; name: L; detail: L; price: number; capacity: number; soldOut: boolean };
type Status = "confirmed" | "pending" | "done" | "cancelled";
type Booking = { code: string; stayId: number; start: string; end: string; nights: number; guests: number; total: number; status: Status; room: L };
type StopKind = "move" | "food" | "cafe" | "sight" | "stay";
type Mode = "flight" | "car" | "walk" | "bus";
type Stop = { id: number; time: string; name: L; kind: StopKind; mode: Mode; minutes: number };
type Day = { day: number; date: number; stops: Stop[] };
type Guests = { adults: number; children: number };
type Range = [number, number];
type WebView = "stays" | "trips" | "saved" | "bookings";
type AppTab = "explore" | "map" | "trips" | "saved" | "my";

const STAYS: Stay[] = [
  { id: 1, name: ["바다결 리조트", "Badagyeol Resort"], region: ["제주 애월", "Aewol, Jeju"], type: "resort", rating: 4.9, reviews: 1284, price: 189000, tags: ["deal", "free"], scene: 0, amenities: ["wifi", "pool", "breakfast", "parking", "ocean"], x: 21, y: 67, blurb: ["창을 열면 애월 바다가 바로 보이는 오션뷰 리조트예요. 인피니티 풀에서 노을을 감상해 보세요.", "An ocean-view resort right on the Aewol coast. Catch the sunset from the infinity pool."] },
  { id: 2, name: ["솔숲 한옥", "Solsup Hanok"], region: ["경주 황남", "Hwangnam, Gyeongju"], type: "hanok", rating: 4.8, reviews: 642, price: 142000, tags: ["last"], scene: 2, amenities: ["wifi", "breakfast", "parking", "bath"], x: 72, y: 40, blurb: ["소나무 숲에 둘러싸인 고즈넉한 한옥이에요. 대릉원까지 걸어서 5분이면 닿아요.", "A quiet hanok wrapped in pine trees, a five-minute walk from Daereungwon."] },
  { id: 3, name: ["윤슬 호텔", "Yunseul Hotel"], region: ["부산 해운대", "Haeundae, Busan"], type: "hotel", rating: 4.7, reviews: 2310, price: 168000, tags: ["deal"], scene: 3, amenities: ["wifi", "pool", "gym", "parking", "breakfast"], x: 80, y: 52, blurb: ["해운대 해변 앞 고층 호텔이에요. 루프톱 수영장과 피트니스를 24시간 이용할 수 있어요.", "A high-rise on Haeundae Beach with a rooftop pool and 24-hour fitness center."] },
  { id: 4, name: ["달빛 캠핑장", "Dalbit Camp"], region: ["가평 설악", "Seorak, Gapyeong"], type: "camping", rating: 4.6, reviews: 388, price: 79000, tags: ["free"], scene: 1, amenities: ["parking", "bbq", "pet"], x: 46, y: 14, blurb: ["계곡 옆 숲속 캠핑장이에요. 장비가 갖춰진 글램핑 텐트도 고를 수 있어요.", "A forest campsite by the stream, with fully equipped glamping tents too."] },
  { id: 5, name: ["오름 펜션", "Oreum Pension"], region: ["제주 구좌", "Gujwa, Jeju"], type: "pension", rating: 4.8, reviews: 517, price: 118000, tags: ["free", "last"], scene: 4, amenities: ["wifi", "parking", "bbq", "pet"], x: 44, y: 68, blurb: ["오름이 내려다보이는 독채 펜션이에요. 마당에서 바비큐를 즐길 수 있어요.", "A private pension overlooking the oreum, with a barbecue yard."] },
  { id: 6, name: ["물안개 리조트", "Mulangae Resort"], region: ["강원 속초", "Sokcho, Gangwon"], type: "resort", rating: 4.5, reviews: 976, price: 214000, tags: [], scene: 5, amenities: ["wifi", "pool", "gym", "breakfast", "parking"], x: 64, y: 12, blurb: ["설악산과 호수 사이에 자리한 리조트예요. 아침마다 물안개가 피어올라요.", "A resort between Seoraksan and the lake, where mist rises every morning."] },
  { id: 7, name: ["담장 한옥", "Damjang Hanok"], region: ["전주 교동", "Gyo-dong, Jeonju"], type: "hanok", rating: 4.9, reviews: 803, price: 156000, tags: ["deal", "free"], scene: 6, amenities: ["wifi", "breakfast", "bath"], x: 40, y: 44, blurb: ["한옥마을 골목 안쪽의 작은 한옥이에요. 아침에는 정갈한 한식 조식이 나와요.", "A small hanok tucked in the village lanes, serving a neat Korean breakfast."] },
  { id: 8, name: ["별바다 캠핑", "Byeolbada Camp"], region: ["태안 안면도", "Anmyeondo, Taean"], type: "camping", rating: 4.4, reviews: 214, price: 68000, tags: ["deal"], scene: 7, amenities: ["parking", "bbq", "pet", "ocean"], x: 20, y: 30, blurb: ["바다 바로 앞 캠핑 사이트예요. 맑은 밤에는 별이 쏟아져요.", "Beachfront camp sites. On clear nights the sky is full of stars."] },
  { id: 9, name: ["도심 숲 호텔", "Urban Grove Hotel"], region: ["서울 성수", "Seongsu, Seoul"], type: "hotel", rating: 4.6, reviews: 1540, price: 132000, tags: ["free"], scene: 1, amenities: ["wifi", "gym", "breakfast"], x: 32, y: 21, blurb: ["서울숲 옆 디자인 호텔이에요. 카페 거리와 공방이 가까워요.", "A design hotel next to Seoul Forest, close to cafés and workshops."] },
  { id: 10, name: ["노을 펜션", "Noeul Pension"], region: ["여수 돌산", "Dolsan, Yeosu"], type: "pension", rating: 4.7, reviews: 455, price: 98000, tags: ["last"], scene: 3, amenities: ["wifi", "parking", "bbq", "ocean"], x: 56, y: 56, blurb: ["돌산 바다 노을이 테라스 가득 들어오는 펜션이에요.", "A pension whose terrace fills with the Dolsan sunset."] },
];

const TYPES: { id: StayType; label: L; one: L; icon: LucideIcon }[] = [
  { id: "hotel", label: ["호텔", "Hotels"], one: ["호텔", "Hotel"], icon: Hotel },
  { id: "pension", label: ["펜션", "Pensions"], one: ["펜션", "Pension"], icon: House },
  { id: "hanok", label: ["한옥", "Hanok"], one: ["한옥", "Hanok"], icon: Landmark },
  { id: "camping", label: ["캠핑", "Camping"], one: ["캠핑", "Camping"], icon: Tent },
  { id: "resort", label: ["리조트", "Resorts"], one: ["리조트", "Resort"], icon: TreePalm },
];
const TAGS: Record<TagId, { label: L; tone: string }> = {
  deal: { label: ["특가", "Deal"], tone: "accent" },
  free: { label: ["무료 취소", "Free cancellation"], tone: "success" },
  last: { label: ["마감 임박", "Almost gone"], tone: "danger" },
};
const AMENITIES: Record<Amenity, { label: L; icon: LucideIcon }> = {
  wifi: { label: ["무료 와이파이", "Free Wi-Fi"], icon: Wifi },
  parking: { label: ["무료 주차", "Free parking"], icon: Car },
  pool: { label: ["수영장", "Pool"], icon: Waves },
  breakfast: { label: ["조식", "Breakfast"], icon: Coffee },
  pet: { label: ["반려동물 동반", "Pet friendly"], icon: PawPrint },
  bbq: { label: ["바비큐", "Barbecue"], icon: Flame },
  bath: { label: ["욕조", "Bathtub"], icon: Bath },
  gym: { label: ["피트니스", "Fitness"], icon: Dumbbell },
  ocean: { label: ["오션뷰", "Ocean view"], icon: Sunset },
};
const FILTER_AMENITIES: Amenity[] = ["wifi", "parking", "pool", "breakfast", "pet", "bbq"];
const SORTS: { id: Sort; label: L }[] = [
  { id: "recommended", label: ["추천순", "Recommended"] },
  { id: "price", label: ["낮은 가격순", "Lowest price"] },
  { id: "rating", label: ["평점 높은순", "Top rated"] },
  { id: "reviews", label: ["후기 많은순", "Most reviewed"] },
];
const ROOM_NAMES: Record<StayType, [L, L, L]> = {
  hotel: [["스탠다드 룸", "Standard room"], ["디럭스 오션", "Deluxe ocean"], ["코너 스위트", "Corner suite"]],
  resort: [["가든 룸", "Garden room"], ["오션 디럭스", "Ocean deluxe"], ["풀 빌라", "Pool villa"]],
  pension: [["커플룸", "Couple room"], ["패밀리룸", "Family room"], ["독채", "Whole house"]],
  hanok: [["사랑채", "Sarangchae room"], ["안채", "Anchae room"], ["한옥 독채", "Private hanok"]],
  camping: [["오토캠핑 사이트", "Auto-camp site"], ["글램핑 텐트", "Glamping tent"], ["카라반", "Caravan"]],
};
const STATUS: Record<Status, { label: L; tone: string }> = {
  confirmed: { label: ["예약 확정", "Confirmed"], tone: "success" },
  pending: { label: ["결제 대기", "Awaiting payment"], tone: "warning" },
  done: { label: ["이용 완료", "Completed"], tone: "info" },
  cancelled: { label: ["취소", "Cancelled"], tone: "danger" },
};
const KINDS: Record<StopKind, { label: L; icon: LucideIcon }> = {
  move: { label: ["이동", "Transit"], icon: Luggage },
  food: { label: ["식사", "Food"], icon: Utensils },
  cafe: { label: ["카페", "Café"], icon: Coffee },
  sight: { label: ["관광", "Sightseeing"], icon: Camera },
  stay: { label: ["숙소", "Stay"], icon: BedDouble },
};
const MODES: Record<Mode, { label: L; icon: LucideIcon }> = {
  flight: { label: ["항공", "Flight"], icon: Plane },
  car: { label: ["차량", "Drive"], icon: Car },
  walk: { label: ["도보", "Walk"], icon: Footprints },
  bus: { label: ["버스", "Bus"], icon: Bus },
};
const INITIAL_BOOKINGS: Booking[] = [
  { code: "ND-2603", stayId: 2, start: "2026-10-09", end: "2026-10-11", nights: 2, guests: 2, total: 334400, status: "confirmed", room: ROOM_NAMES.hanok[0] },
  { code: "ND-2588", stayId: 6, start: "2026-11-21", end: "2026-11-23", nights: 2, guests: 3, total: 658200, status: "pending", room: ROOM_NAMES.resort[1] },
  { code: "ND-2417", stayId: 4, start: "2026-08-14", end: "2026-08-16", nights: 2, guests: 4, total: 251900, status: "done", room: ROOM_NAMES.camping[1] },
  { code: "ND-2350", stayId: 9, start: "2026-07-02", end: "2026-07-03", nights: 1, guests: 2, total: 161700, status: "cancelled", room: ROOM_NAMES.hotel[0] },
];
const INITIAL_DAYS: Day[] = [
  { day: 1, date: 3, stops: [
    { id: 1, time: "09:30", name: ["김포공항 출발", "Depart Gimpo Airport"], kind: "move", mode: "flight", minutes: 70 },
    { id: 2, time: "12:00", name: ["애월 해안 카페", "Aewol seaside café"], kind: "cafe", mode: "walk", minutes: 10 },
    { id: 3, time: "14:30", name: ["한담 해안 산책로", "Handam coastal trail"], kind: "sight", mode: "car", minutes: 15 },
    { id: 4, time: "18:00", name: ["바다결 리조트 체크인", "Check in at Badagyeol"], kind: "stay", mode: "car", minutes: 0 },
  ] },
  { day: 2, date: 4, stops: [
    { id: 5, time: "08:30", name: ["리조트 조식", "Breakfast at the resort"], kind: "food", mode: "car", minutes: 25 },
    { id: 6, time: "10:30", name: ["새별오름 산책", "Saebyeol Oreum hike"], kind: "sight", mode: "car", minutes: 20 },
    { id: 7, time: "13:00", name: ["고기국수 점심", "Pork noodle lunch"], kind: "food", mode: "bus", minutes: 30 },
    { id: 8, time: "16:30", name: ["협재 해변 노을", "Sunset at Hyeopjae Beach"], kind: "sight", mode: "car", minutes: 0 },
  ] },
  { day: 3, date: 5, stops: [
    { id: 9, time: "11:00", name: ["체크아웃", "Check out"], kind: "stay", mode: "car", minutes: 35 },
    { id: 10, time: "12:30", name: ["동문시장 구경", "Dongmun Market"], kind: "food", mode: "car", minutes: 20 },
    { id: 11, time: "15:40", name: ["제주공항 출발", "Depart Jeju Airport"], kind: "move", mode: "flight", minutes: 0 },
  ] },
];

const WD_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WD_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = 2; // sample "today": 2026-10-02, so Oct 1 is in the past
const oct = (day: number) => `2026-10-${String(day).padStart(2, "0")}`;
const weekday = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };

function roomsFor(stay: Stay): Room[] {
  const round = (value: number) => Math.round(value / 1000) * 1000;
  const [a, b, c] = ROOM_NAMES[stay.type];
  return [
    { id: "std", name: a, detail: ["퀸 침대 1개 · 최대 2명", "1 queen bed · up to 2"], price: stay.price, capacity: 2, soldOut: false },
    { id: "dlx", name: b, detail: ["더블 침대 2개 · 최대 4명", "2 double beds · up to 4"], price: round(stay.price * 1.35), capacity: 4, soldOut: stay.tags.includes("last") },
    { id: "ste", name: c, detail: ["침실 2개 · 거실 · 최대 6명", "2 bedrooms · lounge · up to 6"], price: round(stay.price * 1.9), capacity: 6, soldOut: stay.id % 3 === 0 },
  ];
}

function quote(stay: Stay, rate: number, nights: number) {
  const base = rate * nights;
  const cleaning = stay.type === "camping" ? 10000 : 20000;
  const discount = stay.tags.includes("deal") ? Math.round(base * 0.1 / 100) * 100 : 0;
  const tax = Math.round((base - discount + cleaning) * 0.1 / 100) * 100;
  return { base, cleaning, discount, tax, total: base - discount + cleaning + tax };
}

type Filters = { query: string; type: StayType | "all"; maxPrice: number; amenities: Amenity[]; freeOnly: boolean; sort: Sort };

function filterStays({ query, type, maxPrice, amenities, freeOnly, sort }: Filters) {
  const q = query.trim().toLowerCase();
  const list = STAYS.filter((stay) =>
    (type === "all" || stay.type === type) &&
    stay.price <= maxPrice &&
    amenities.every((item) => stay.amenities.includes(item)) &&
    (!freeOnly || stay.tags.includes("free")) &&
    (!q || `${stay.name.join(" ")} ${stay.region.join(" ")}`.toLowerCase().includes(q)));
  if (sort === "price") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  if (sort === "reviews") return [...list].sort((a, b) => b.reviews - a.reviews);
  return list;
}

/* ---------------------------------------------------------------- locale */

function useCopy() {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const t = (ko: string, en: string) => (isKo ? ko : en);
  const l = (pair: L) => (isKo ? pair[0] : pair[1]);
  const money = (amount: number) => isKo ? `${Math.round(amount).toLocaleString("ko-KR")}원` : `₩${Math.round(amount).toLocaleString("en-US")}`;
  const short = (amount: number) => isKo ? `${(amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 1)}만` : `₩${Math.round(amount / 1000)}K`;
  const date = (iso: string) => {
    const [, m, d] = iso.split("-").map(Number);
    const wd = weekday(iso);
    return isKo ? `${m}월 ${d}일 (${WD_KO[wd]})` : `${WD_EN[wd]}, ${MON_EN[m - 1]} ${d}`;
  };
  const nightsLabel = (n: number) => isKo ? `${n}박` : `${n} night${n === 1 ? "" : "s"}`;
  const guestsLabel = ({ adults, children }: Guests) => isKo
    ? `성인 ${adults}명${children ? `, 어린이 ${children}명` : ""}`
    : `${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}`;
  const duration = (minutes: number) => {
    const h = Math.floor(minutes / 60), m = minutes % 60;
    if (isKo) return `${h ? `${h}시간 ` : ""}${m ? `${m}분` : ""}`.trim();
    return `${h ? `${h} h ` : ""}${m ? `${m} min` : ""}`.trim();
  };
  return { isKo, t, l, money, short, date, nightsLabel, guestsLabel, duration };
}

/* ----------------------------------------------------------- primitives */

function Scene({ n, type, className = "", label, children }: { n: number; type?: StayType; className?: string; label?: string; children?: ReactNode }) {
  return <span className={`trip-scene trip-scene-${((n % 8) + 8) % 8} ${className}`} role={label ? "img" : undefined} aria-label={label}>
    <i className="trip-sun" />
    <i className="trip-hill trip-hill-a" />
    <i className="trip-hill trip-hill-b" />
    <i className="trip-sea" />
    {type && <i className={`trip-mark trip-mark-${type}`} />}
    {children}
  </span>;
}

function Dialog({ label, onClose, className, scrimClass = "", inert, children }: { label: string; onClose: () => void; className: string; scrimClass?: string; inert?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const opener = document.activeElement as HTMLElement | null;
    (root.querySelector<HTMLElement>("[data-autofocus]") ?? root.querySelector<HTMLElement>("button:not(:disabled), input"))?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeRef.current(); return; }
      if (event.key !== "Tab" || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    root.addEventListener("keydown", key);
    return () => { root.removeEventListener("keydown", key); requestAnimationFrame(() => opener?.focus?.()); };
  }, []);
  return <div className={`trip-scrim ${scrimClass}`} onClick={onClose} inert={inert}>
    <div className={className} role="dialog" aria-modal="true" aria-label={label} ref={ref} onClick={(event) => event.stopPropagation()}>{children}</div>
  </div>;
}

function SaveButton({ stay, saved, onToggle, className = "" }: { stay: Stay; saved: boolean; onToggle: (id: number) => void; className?: string }) {
  const { t, l } = useCopy();
  return <button type="button" className={`trip-save ${className}`} aria-pressed={saved} aria-label={saved ? t(`${l(stay.name)} 저장 취소`, `Remove ${l(stay.name)} from saved`) : t(`${l(stay.name)} 저장`, `Save ${l(stay.name)}`)} onClick={() => onToggle(stay.id)}>
    <Heart size={16} />
  </button>;
}

function Tags({ stay }: { stay: Stay }) {
  const { l } = useCopy();
  if (!stay.tags.length) return null;
  return <span className="trip-tags">{stay.tags.map((tag) => <span key={tag} className={`trip-tag trip-tag-${TAGS[tag].tone}`}>{l(TAGS[tag].label)}</span>)}</span>;
}

function Rating({ stay }: { stay: Stay }) {
  const { t, isKo } = useCopy();
  return <span className="trip-rating">
    <Star size={12} />
    <span className="trip-sr">{t("평점", "Rating")}</span>{stay.rating.toFixed(1)}
    <small>({stay.reviews.toLocaleString(isKo ? "ko-KR" : "en-US")})</small>
  </span>;
}

function StayCard({ stay, saved, active, variant = "grid", cardId, onOpen, onToggleSave, onHover }: {
  stay: Stay; saved: boolean; active?: boolean; variant?: "grid" | "large" | "row"; cardId?: string;
  onOpen: (id: number) => void; onToggleSave: (id: number) => void; onHover?: (id: number | null) => void;
}) {
  const { t, l, money } = useCopy();
  const type = TYPES.find((item) => item.id === stay.type)!;
  return <article id={cardId} className={`trip-card is-${variant}${active ? " is-active" : ""}`} onMouseEnter={() => onHover?.(stay.id)} onMouseLeave={() => onHover?.(null)}>
    <button type="button" className="trip-card-open" onClick={() => onOpen(stay.id)} onFocus={() => onHover?.(stay.id)} onBlur={() => onHover?.(null)}>
      <Scene n={stay.scene} type={stay.type} className="trip-card-photo">{variant !== "row" && <Tags stay={stay} />}</Scene>
      <span className="trip-card-body">
        <span className="trip-card-line">
          <strong className="trip-card-name">{l(stay.name)}</strong>
          <Rating stay={stay} />
        </span>
        <span className="trip-card-meta">{l(stay.region)} · {l(type.one)}</span>
        {variant === "row" && <Tags stay={stay} />}
        <span className="trip-card-price"><strong>{money(stay.price)}</strong><small> / {t("1박", "night")}</small></span>
      </span>
    </button>
    <SaveButton stay={stay} saved={saved} onToggle={onToggleSave} className="trip-card-save" />
  </article>;
}

function Empty({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return <div className="trip-empty">
    <span className="trip-empty-icon"><Icon size={22} /></span>
    <strong>{title}</strong>
    <p>{body}</p>
    {action}
  </div>;
}

function RangeCalendar({ range, onChange }: { range: Range; onChange: (range: Range) => void }) {
  const { t, isKo, date, nightsLabel } = useCopy();
  const [draft, setDraft] = useState<[number, number | null]>([range[0], range[1]]);
  const offset = weekday(oct(1));
  const heads = isKo ? WD_KO : ["S", "M", "T", "W", "T", "F", "S"];
  function pick(day: number) {
    if (draft[1] !== null || day <= draft[0]) { setDraft([day, null]); return; }
    setDraft([draft[0], day]);
    onChange([draft[0], day]);
  }
  return <div className="trip-cal">
    <div className="trip-cal-head">
      <strong>{t("2026년 10월", "October 2026")}</strong>
      <small aria-live="polite">{draft[1] === null ? t("체크아웃 날짜를 골라 주세요", "Now pick a check-out date") : `${date(oct(draft[0]))} – ${date(oct(draft[1]))} · ${nightsLabel(draft[1] - draft[0])}`}</small>
    </div>
    <div className="trip-cal-grid">
      {heads.map((head, index) => <span key={`h${index}`} className="trip-cal-wd" aria-hidden="true">{head}</span>)}
      {Array.from({ length: offset }, (_, index) => <span key={`b${index}`} aria-hidden="true" />)}
      {Array.from({ length: 31 }, (_, index) => {
        const day = index + 1;
        const end = draft[1];
        const edge = day === draft[0] || day === end;
        const between = end !== null && day > draft[0] && day < end;
        const wd = (offset + index) % 7;
        return <button type="button" key={day} disabled={day < TODAY} aria-pressed={edge}
          aria-label={`${date(oct(day))}${day === draft[0] ? t(" 체크인", " check-in") : day === end ? t(" 체크아웃", " check-out") : ""}`}
          className={`trip-cal-day${edge ? " is-edge" : ""}${between ? " is-between" : ""}${wd === 0 || wd === 6 ? " is-weekend" : ""}`}
          onClick={() => pick(day)}>{day}</button>;
      })}
    </div>
  </div>;
}

function GuestStepper({ guests, onChange }: { guests: Guests; onChange: (guests: Guests) => void }) {
  const { t, l } = useCopy();
  const rows = [
    { key: "adults", label: ["성인", "Adults"], hint: ["만 13세 이상", "Ages 13 or above"], min: 1, max: 8 },
    { key: "children", label: ["어린이", "Children"], hint: ["만 2–12세", "Ages 2–12"], min: 0, max: 6 },
  ] as const;
  return <div className="trip-steppers">{rows.map((row) => {
    const value = guests[row.key];
    return <div className="trip-stepper" key={row.key}>
      <div><strong>{l(row.label)}</strong><small>{l(row.hint)}</small></div>
      <div className="trip-stepper-ctrl">
        <button type="button" className="trip-step-btn" disabled={value <= row.min} aria-label={t(`${row.label[0]} 한 명 줄이기`, `One fewer ${row.key === "adults" ? "adult" : "child"}`)} onClick={() => onChange({ ...guests, [row.key]: value - 1 })}><Minus size={14} /></button>
        <output aria-live="polite" aria-label={`${l(row.label)} ${value}`}>{value}</output>
        <button type="button" className="trip-step-btn" disabled={value >= row.max} aria-label={t(`${row.label[0]} 한 명 늘리기`, `One more ${row.key === "adults" ? "adult" : "child"}`)} onClick={() => onChange({ ...guests, [row.key]: value + 1 })}><Plus size={14} /></button>
      </div>
    </div>;
  })}</div>;
}

/* -------------------------------------------------------------------- map */

function MapPanel({ stays, activeId, compact, onSelect, onHover, onOpen }: {
  stays: Stay[]; activeId: number | null; compact?: boolean;
  onSelect: (id: number) => void; onHover?: (id: number | null) => void; onOpen: (id: number) => void;
}) {
  const { t, l, money, short } = useCopy();
  const [zoom, setZoom] = useState(1);
  const active = stays.find((stay) => stay.id === activeId) ?? null;
  return <div className={`trip-map${compact ? " is-compact" : ""}`} role="region" aria-label={t("숙소 지도", "Stay map")}>
    <div className="trip-map-layer" style={{ "--trip-zoom": zoom } as CSSProperties}>
      <i className="trip-land trip-land-a" />
      <i className="trip-land trip-land-b" />
      <i className="trip-land trip-land-c" />
      <i className="trip-park trip-park-a" />
      <i className="trip-park trip-park-b" />
      <i className="trip-lake" />
      <i className="trip-road trip-road-a" />
      <i className="trip-road trip-road-b" />
      <i className="trip-road trip-road-c" />
      {stays.map((stay) => <button type="button" key={stay.id} className={`trip-pin${stay.id === activeId ? " is-active" : ""}`}
        style={{ left: `${stay.x}%`, top: `${stay.y}%` }} aria-pressed={stay.id === activeId}
        aria-label={`${l(stay.name)}, ${money(stay.price)} ${t("1박", "per night")}`}
        onClick={() => onSelect(stay.id)} onMouseEnter={() => onHover?.(stay.id)} onMouseLeave={() => onHover?.(null)}>
        {short(stay.price)}
      </button>)}
    </div>
    <div className="trip-map-tools">
      <button type="button" aria-label={t("지도 확대", "Zoom in")} disabled={zoom >= 1.6} onClick={() => setZoom((value) => Math.min(1.6, +(value + 0.2).toFixed(1)))}><Plus size={15} /></button>
      <button type="button" aria-label={t("지도 축소", "Zoom out")} disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, +(value - 0.2).toFixed(1)))}><Minus size={15} /></button>
    </div>
    <span className="trip-map-badge"><MapPin size={12} />{t(`지도에 ${stays.length}곳`, `${stays.length} on the map`)}</span>
    {active && <div className="trip-map-card">
      <Scene n={active.scene} type={active.type} className="trip-map-thumb" />
      <div>
        <strong>{l(active.name)}</strong>
        <small>{l(active.region)} · <Rating stay={active} /></small>
        <span>{money(active.price)}<small> / {t("1박", "night")}</small></span>
      </div>
      <button type="button" className="trip-btn trip-primary trip-sm" onClick={() => onOpen(active.id)}>{t("보기", "View")}<ChevronRight size={14} /></button>
    </div>}
  </div>;
}

/* ------------------------------------------------------------ stay detail */

type DetailProps = {
  stay: Stay; mobile: boolean; range: Range; guests: Guests; saved: boolean;
  onToggleSave: (id: number) => void; onClose: () => void; onRange: (range: Range) => void; onGuests: (guests: Guests) => void;
  onEdit: () => void; onBook: (booking: Omit<Booking, "code" | "status">) => string; onViewBookings: () => void;
};

function StayDetail({ stay, mobile, range, guests, saved, onToggleSave, onClose, onRange, onGuests, onEdit, onBook, onViewBookings }: DetailProps) {
  const { t, l, money, date, nightsLabel, guestsLabel } = useCopy();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const rooms = roomsFor(stay);
  const people = guests.adults + guests.children;
  const nights = range[1] - range[0];
  const [roomId, setRoomId] = useState(() => (rooms.find((room) => !room.soldOut && room.capacity >= people) ?? rooms[0]).id);
  const room = rooms.find((item) => item.id === roomId && !item.soldOut && item.capacity >= people) ?? null;
  const price = room ? quote(stay, room.price, nights) : null;
  const [step, setStep] = useState<"detail" | "form" | "done">("detail");
  const [editing, setEditing] = useState<"dates" | "guests" | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "", agree: false });
  const [tried, setTried] = useState(false);
  const [code, setCode] = useState("");
  const type = TYPES.find((item) => item.id === stay.type)!;
  const errors = {
    name: form.name.trim().length < 2 ? t("이름을 2자 이상 입력해 주세요.", "Enter at least 2 characters.") : "",
    phone: /^01\d-?\d{3,4}-?\d{4}$/.test(form.phone.trim()) ? "" : t("휴대폰 번호를 확인해 주세요. 예) 010-1234-5678", "Check the phone number, e.g. 010-1234-5678."),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) ? "" : t("이메일 주소 형식이 올바르지 않아요.", "Enter a valid email address."),
    agree: form.agree ? "" : t("예약 약관에 동의해 주세요.", "Please accept the booking terms."),
  };
  const shown = (key: keyof typeof errors) => (tried ? errors[key] : "");
  const formId = `${uid}-form`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || step === "detail") return;
    root.closest<HTMLElement>(".trip-detail, .trip-panel-scroll")?.scrollTo?.({ top: 0 });
    root.querySelector<HTMLElement>(step === "form" ? "input" : "[data-step-focus]")?.focus();
  }, [step]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (Object.values(errors).some(Boolean) || !room || !price) {
      requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    setCode(onBook({ stayId: stay.id, start: oct(range[0]), end: oct(range[1]), nights, guests: people, total: price.total, room: room.name }));
    setStep("done");
  }

  const field = (key: "name" | "phone" | "email", label: string, input: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) => {
    const id = `${uid}-${key}`;
    const error = shown(key);
    return <div className="trip-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...input} />
      {error && <p className="trip-error" id={`${id}-error`}><CircleAlert size={13} />{error}</p>}
    </div>;
  };

  const header = <header className="trip-detail-head">
    {mobile ? <>
      <button type="button" className="trip-round-btn" onClick={step === "form" ? () => setStep("detail") : onClose} aria-label={step === "form" ? t("숙소 정보로 돌아가기", "Back to stay details") : t("닫기", "Close")}>{step === "done" ? <X size={18} /> : <ChevronLeft size={18} />}</button>
      <span className="trip-detail-title">{step === "form" ? t("예약자 정보", "Guest details") : step === "done" ? t("예약 완료", "Booked") : ""}</span>
      {step === "detail" ? <SaveButton stay={stay} saved={saved} onToggle={onToggleSave} className="trip-round-btn" /> : <span className="trip-round-spacer" />}
    </> : <>
      <div>
        <span className="trip-eyebrow">{l(type.one)} · {l(stay.region)}</span>
        <h2>{l(stay.name)}</h2>
        <p className="trip-detail-meta"><Rating stay={stay} /><span>·</span>{t(`후기 ${stay.reviews.toLocaleString("ko-KR")}개`, `${stay.reviews.toLocaleString("en-US")} reviews`)}<span>·</span><MapPin size={12} />{l(stay.region)}</p>
      </div>
      <div className="trip-inline">
        <SaveButton stay={stay} saved={saved} onToggle={onToggleSave} />
        <button type="button" className="trip-icon-btn" onClick={onClose} aria-label={t("닫기", "Close")}><X size={18} /></button>
      </div>
    </>}
  </header>;

  const editor = (kind: "dates" | "guests") => mobile ? onEdit() : setEditing(editing === kind ? null : kind);
  const summary = <section className="trip-book-card" aria-label={t("예약 요약", "Booking summary")}>
    {!mobile && room && <div className="trip-book-rate"><strong>{money(room.price)}</strong><small> / {t("1박", "night")}</small></div>}
    <div className="trip-book-rows">
      <div className="trip-book-row">
        <CalendarDays size={15} />
        <div><small>{t("체크인 – 체크아웃", "Check-in – Check-out")}</small><strong>{date(oct(range[0]))} – {date(oct(range[1]))}</strong></div>
        <button type="button" className="trip-link" aria-label={t("날짜 변경", "Edit dates")} aria-expanded={mobile ? undefined : editing === "dates"} onClick={() => editor("dates")}>{t("변경", "Edit")}</button>
      </div>
      {editing === "dates" && <RangeCalendar range={range} onChange={onRange} />}
      <div className="trip-book-row">
        <Users size={15} />
        <div><small>{t("인원", "Guests")}</small><strong>{guestsLabel(guests)}</strong></div>
        <button type="button" className="trip-link" aria-label={t("인원 변경", "Edit guests")} aria-expanded={mobile ? undefined : editing === "guests"} onClick={() => editor("guests")}>{t("변경", "Edit")}</button>
      </div>
      {editing === "guests" && <GuestStepper guests={guests} onChange={onGuests} />}
    </div>
    {price && room ? <dl className="trip-breakdown">
      <div><dt>{money(room.price)} × {nightsLabel(nights)}</dt><dd>{money(price.base)}</dd></div>
      <div><dt>{t("청소비", "Cleaning fee")}</dt><dd>{money(price.cleaning)}</dd></div>
      <div><dt>{t("세금 및 수수료", "Taxes & fees")}</dt><dd>{money(price.tax)}</dd></div>
      {price.discount > 0 && <div className="is-discount"><dt>{t("특가 할인 10%", "Deal discount 10%")}</dt><dd>−{money(price.discount)}</dd></div>}
      <div className="is-total"><dt>{t("총 결제 금액", "Total")}</dt><dd>{money(price.total)}</dd></div>
    </dl> : <p className="trip-note trip-warning"><CircleAlert size={14} />{t(`${guestsLabel(guests)}이 머물 수 있는 객실을 골라 주세요.`, `Pick a room that fits ${guestsLabel(guests)}.`)}</p>}
    {!mobile && <button type="button" className="trip-btn trip-primary trip-block" disabled={!room} onClick={() => setStep("form")}>{t("예약하기", "Reserve")}</button>}
    {!mobile && <p className="trip-fine">{t("아직 결제되지 않아요", "You will not be charged yet")}</p>}
  </section>;

  const info = <div className="trip-detail-main">
    {mobile && <div className="trip-detail-intro">
      <span className="trip-eyebrow">{l(type.one)} · {l(stay.region)}</span>
      <h2>{l(stay.name)}</h2>
      <p className="trip-detail-meta"><Rating stay={stay} /><span>·</span>{t(`후기 ${stay.reviews.toLocaleString("ko-KR")}개`, `${stay.reviews.toLocaleString("en-US")} reviews`)}</p>
      <Tags stay={stay} />
    </div>}
    <p className="trip-blurb">{l(stay.blurb)}</p>
    <ul className="trip-perks">
      {stay.tags.includes("free") && <li><ShieldCheck size={16} /><span><strong>{t("무료 취소", "Free cancellation")}</strong><small>{t("10월 1일 (목)까지 전액 환불", "Full refund until Thu, Oct 1")}</small></span></li>}
      <li><Clock size={16} /><span><strong>{t("체크인 15:00 · 체크아웃 11:00", "Check-in 15:00 · Check-out 11:00")}</strong><small>{t("셀프 체크인 가능", "Self check-in available")}</small></span></li>
      {stay.tags.includes("deal") && <li><Ticket size={16} /><span><strong>{t("이번 주 특가", "This week's deal")}</strong><small>{t("숙박 요금 10% 할인 적용", "10% off the room rate")}</small></span></li>}
    </ul>
    <h3 className="trip-h3">{t("편의시설", "Amenities")}</h3>
    <ul className="trip-amenities">{stay.amenities.map((item) => { const Icon = AMENITIES[item].icon; return <li key={item}><Icon size={16} />{l(AMENITIES[item].label)}</li>; })}</ul>
    <fieldset className="trip-rooms">
      <legend className="trip-h3">{t("객실 선택", "Choose a room")}</legend>
      {rooms.map((item) => {
        const tooSmall = item.capacity < people;
        const disabled = item.soldOut || tooSmall;
        return <label key={item.id} className={`trip-room${disabled ? " is-disabled" : ""}${room?.id === item.id ? " is-picked" : ""}`}>
          <input type="radio" name={`${uid}-room`} value={item.id} checked={room?.id === item.id} disabled={disabled} onChange={() => setRoomId(item.id)} />
          <span className="trip-room-copy"><strong>{l(item.name)}</strong><small>{l(item.detail)}</small></span>
          <span className="trip-room-price">{item.soldOut ? <span className="trip-badge trip-danger">{t("매진", "Sold out")}</span>
            : tooSmall ? <span className="trip-badge trip-warning">{t("인원 초과", "Too small")}</span>
              : <><strong>{money(item.price)}</strong><small>/{t("1박", "night")}</small></>}</span>
        </label>;
      })}
    </fieldset>
  </div>;

  const gallery = <div className="trip-gallery">
    {[0, 3, 5, 2, 6].map((shift, index) => <Scene key={shift} n={stay.scene + shift} type={index === 0 ? stay.type : undefined} className={index === 0 ? "is-main" : ""} label={t(`${l(stay.name)} 사진 ${index + 1}`, `${l(stay.name)} photo ${index + 1}`)} />)}
    <span className="trip-gallery-count"><Camera size={12} />{t("사진 24장", "24 photos")}</span>
  </div>;

  const form$ = <form id={formId} className="trip-form" onSubmit={submit} noValidate>
    {!mobile && <button type="button" className="trip-link trip-back" onClick={() => setStep("detail")}><ChevronLeft size={14} />{t("숙소 정보로", "Back to stay")}</button>}
    {!mobile && <h3 className="trip-h3">{t("예약자 정보", "Guest details")}</h3>}
    <p className="trip-muted">{t("체크인 시 확인할 정보예요. 모든 항목을 입력해 주세요.", "We share these with the host for check-in.")}</p>
    {field("name", t("이름", "Full name"), { autoComplete: "name", maxLength: 30, placeholder: t("홍길동", "Alex Kim") })}
    {field("phone", t("휴대폰 번호", "Mobile number"), { type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 13, placeholder: "010-1234-5678" })}
    {field("email", t("이메일", "Email"), { type: "email", autoComplete: "email", maxLength: 60, placeholder: "you@example.com" })}
    <div className="trip-field">
      <label htmlFor={`${uid}-note`}>{t("요청 사항", "Requests")} <span className="trip-muted">{t("선택", "Optional")}</span></label>
      <textarea id={`${uid}-note`} rows={2} maxLength={120} value={form.note} placeholder={t("늦은 체크인, 아기 침대 등", "Late check-in, crib, and so on")} onChange={(event) => setForm({ ...form, note: event.target.value })} />
    </div>
    <label className="trip-check">
      <input type="checkbox" checked={form.agree} aria-invalid={!!shown("agree")} aria-describedby={shown("agree") ? `${uid}-agree-error` : undefined} onChange={(event) => setForm({ ...form, agree: event.target.checked })} />
      <span>{t("예약 약관과 개인정보 수집에 동의합니다", "I agree to the booking terms and privacy policy")}</span>
    </label>
    {shown("agree") && <p className="trip-error" id={`${uid}-agree-error`}><CircleAlert size={13} />{shown("agree")}</p>}
    {tried && Object.values(errors).some(Boolean) && <p className="trip-sr" role="alert">{t("입력 내용을 확인해 주세요.", "Please check the highlighted fields.")}</p>}
    {!mobile && <button type="submit" className="trip-btn trip-primary trip-block">{price ? t(`${money(price.total)} 결제하고 예약`, `Pay ${money(price.total)} and book`) : t("예약하기", "Reserve")}</button>}
  </form>;

  const mini = room && price && <div className="trip-mini-summary">
    <Scene n={stay.scene} type={stay.type} className="trip-mini-thumb" />
    <div>
      <strong>{l(stay.name)}</strong>
      <small>{l(room.name)} · {guestsLabel(guests)}</small>
      <small>{date(oct(range[0]))} – {date(oct(range[1]))} · {nightsLabel(nights)}</small>
    </div>
    <strong className="trip-mini-total">{money(price.total)}</strong>
  </div>;

  const done = <div className="trip-done">
    <span className="trip-done-icon"><Check size={26} /></span>
    <h2 tabIndex={-1} data-step-focus>{t("예약이 확정되었어요", "Your stay is booked")}</h2>
    <p>{t(`예약 번호 ${code} · 안내 메일을 ${form.email.trim()}(으)로 보냈어요.`, `Booking ${code} · We sent the details to ${form.email.trim()}.`)}</p>
    {mini}
    <span className="trip-badge trip-success"><Check size={12} />{t("예약 확정", "Confirmed")}</span>
    <div className="trip-actions">
      <button type="button" className="trip-btn trip-secondary" onClick={onViewBookings}>{t("예약 내역 보기", "View bookings")}</button>
      <button type="button" className="trip-btn trip-primary" onClick={onClose}>{t("확인", "Done")}</button>
    </div>
  </div>;

  if (mobile) return <div className="trip-panel-inner" ref={rootRef}>
    <div className="trip-panel-scroll">
      {header}
      {step === "detail" && <>{gallery}{info}{summary}</>}
      {step === "form" && <div className="trip-panel-pad">{mini}{form$}</div>}
      {step === "done" && <div className="trip-panel-pad">{done}</div>}
    </div>
    {step !== "done" && <div className="trip-sticky">
      <div>
        <strong>{price ? money(price.total) : "—"}</strong>
        <small>{nightsLabel(nights)} · {t("세금 포함", "incl. taxes")}</small>
      </div>
      {step === "detail"
        ? <button type="button" className="trip-btn trip-primary" disabled={!room} onClick={() => setStep("form")}>{t("예약하기", "Reserve")}</button>
        : <button type="submit" form={formId} className="trip-btn trip-primary">{t("결제하고 예약", "Pay and book")}</button>}
    </div>}
  </div>;

  return <div className="trip-detail-inner" ref={rootRef}>
    {header}
    {step === "detail" && <>{gallery}<div className="trip-detail-body">{info}{summary}</div></>}
    {step === "form" && <div className="trip-detail-body">{form$}<aside className="trip-book-card">{mini}{price && <dl className="trip-breakdown">
      <div><dt>{t("숙박", "Stay")}</dt><dd>{money(price.base)}</dd></div>
      <div><dt>{t("청소비 · 세금", "Cleaning · taxes")}</dt><dd>{money(price.cleaning + price.tax)}</dd></div>
      {price.discount > 0 && <div className="is-discount"><dt>{t("특가 할인", "Deal discount")}</dt><dd>−{money(price.discount)}</dd></div>}
      <div className="is-total"><dt>{t("총 결제 금액", "Total")}</dt><dd>{money(price.total)}</dd></div>
    </dl>}</aside></div>}
    {step === "done" && done}
  </div>;
}

/* -------------------------------------------------------------- bookings */

function Bookings({ bookings, compact, onPay, onCancel, onOpenStay, onBrowse }: {
  bookings: Booking[]; compact?: boolean; onPay: (code: string) => void; onCancel: (code: string) => void; onOpenStay: (id: number) => void; onBrowse: () => void;
}) {
  const { t, l, money, date, nightsLabel } = useCopy();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [confirming, setConfirming] = useState<string | null>(null);
  const list = bookings.filter((item) => filter === "all" || (filter === "upcoming") === (item.status === "confirmed" || item.status === "pending"));
  return <section className={`trip-bookings${compact ? " is-compact" : ""}`}>
    <div className="trip-seg" role="group" aria-label={t("예약 필터", "Booking filter")}>
      {([["all", t("전체", "All")], ["upcoming", t("예정", "Upcoming")], ["past", t("지난 여행", "Past")]] as const).map(([id, label]) =>
        <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}
    </div>
    {list.length === 0 ? <Empty icon={Ticket} title={t("해당하는 예약이 없어요", "No bookings here")} body={t("마음에 드는 숙소를 찾아 첫 여행을 계획해 보세요.", "Find a stay you like and plan your next trip.")} action={<button type="button" className="trip-btn trip-secondary" onClick={onBrowse}>{t("숙소 둘러보기", "Browse stays")}</button>} />
      : <ul className="trip-booking-list">{list.map((item) => {
        const stay = STAYS.find((entry) => entry.id === item.stayId)!;
        const status = STATUS[item.status];
        return <li key={item.code} className={`trip-booking${item.status === "cancelled" ? " is-cancelled" : ""}`}>
          <Scene n={stay.scene} type={stay.type} className="trip-booking-thumb" />
          <div className="trip-booking-copy">
            <span className={`trip-badge trip-${status.tone}`}>{l(status.label)}</span>
            <strong>{l(stay.name)}</strong>
            <small>{date(item.start)} – {date(item.end)} · {nightsLabel(item.nights)}</small>
            <small>{l(item.room)} · {t(`${item.guests}명`, `${item.guests} guests`)} · {item.code}</small>
          </div>
          <div className="trip-booking-end">
            <strong>{money(item.total)}</strong>
            <div className="trip-inline">
              {item.status === "pending" && <button type="button" className="trip-btn trip-primary trip-sm" onClick={() => onPay(item.code)}>{t("결제하기", "Pay now")}</button>}
              {item.status === "confirmed" && <button type="button" className="trip-btn trip-neutral trip-sm" aria-expanded={confirming === item.code} onClick={() => setConfirming(confirming === item.code ? null : item.code)}>{t("예약 취소", "Cancel")}</button>}
              {(item.status === "done" || item.status === "cancelled") && <button type="button" className="trip-btn trip-secondary trip-sm" onClick={() => onOpenStay(stay.id)}>{t("다시 예약", "Book again")}</button>}
            </div>
          </div>
          {confirming === item.code && <div className="trip-confirm" role="alert">
            <span><CircleAlert size={14} />{t("정말 취소할까요? 무료 취소 기간이라 전액 환불돼요.", "Cancel this booking? You are still within free cancellation.")}</span>
            <div className="trip-inline">
              <button type="button" className="trip-btn trip-neutral trip-sm" onClick={() => setConfirming(null)}>{t("유지하기", "Keep it")}</button>
              <button type="button" className="trip-btn trip-danger-btn trip-sm" onClick={() => { setConfirming(null); onCancel(item.code); }}>{t("취소 확정", "Confirm cancel")}</button>
            </div>
          </div>}
        </li>;
      })}</ul>}
  </section>;
}

/* ------------------------------------------------------------- itinerary */

function Itinerary({ days, guests, mobile, onAdd, onRemove }: {
  days: Day[]; guests: Guests; mobile?: boolean; onAdd: (dayIndex: number, stop: Omit<Stop, "id">) => void; onRemove: (dayIndex: number, stop: Stop) => void;
}) {
  const { t, l, date, duration, guestsLabel, nightsLabel } = useCopy();
  const uid = useId();
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState<number | null>(null);
  const [draft, setDraft] = useState<{ time: string; name: string; kind: StopKind }>({ time: "15:00", name: "", kind: "sight" });
  const stops = days.reduce((sum, day) => sum + day.stops.length, 0);
  const travel = days.reduce((sum, day) => sum + day.stops.slice(0, -1).reduce((acc, stop) => acc + stop.minutes, 0), 0);
  const visible = days.map((day, index) => ({ day, index })).filter(({ index }) => !mobile || index === active);
  return <section className={`trip-itinerary${mobile ? " is-mobile" : ""}`}>
    <div className="trip-trip-hero">
      <Scene n={4} type="resort" className="trip-trip-scene" />
      <div className="trip-trip-copy">
        <span className="trip-eyebrow">JEJU · {nightsLabel(2).toUpperCase()}</span>
        <h2>{t("제주 가을 여행", "Autumn in Jeju")}</h2>
        <p>{date(oct(3))} – {date(oct(5))} · {guestsLabel(guests)}</p>
      </div>
      <dl className="trip-trip-stats">
        <div><dt>{t("장소", "Stops")}</dt><dd>{stops}</dd></div>
        <div><dt>{t("이동 시간", "Travel")}</dt><dd>{duration(travel) || "0"}</dd></div>
        <div><dt>{t("숙소", "Stay")}</dt><dd>{t("바다결", "Badagyeol")}</dd></div>
      </dl>
    </div>
    {mobile && <div className="trip-seg trip-seg-full" role="group" aria-label={t("일차 선택", "Choose a day")}>
      {days.map((day, index) => <button type="button" key={day.day} aria-pressed={active === index} onClick={() => { setActive(index); setAdding(null); }}>Day {day.day}</button>)}
    </div>}
    <div className="trip-days">{visible.map(({ day, index }) => {
      const KindIcon = KINDS[draft.kind].icon;
      return <article className="trip-day" key={day.day} aria-labelledby={`${uid}-day-${index}`}>
        <header className="trip-day-head">
          <strong id={`${uid}-day-${index}`}>Day {day.day}</strong>
          <span>{date(oct(day.date))}</span>
          <small>{t(`${day.stops.length}곳`, `${day.stops.length} stops`)}</small>
        </header>
        {day.stops.length === 0 ? <p className="trip-day-empty">{t("아직 일정이 없어요. 가고 싶은 곳을 추가해 보세요.", "No stops yet. Add somewhere you want to go.")}</p>
          : <ol className="trip-timeline">{day.stops.map((stop, stopIndex) => {
            const Icon = KINDS[stop.kind].icon;
            const Mode = MODES[stop.mode].icon;
            return <li key={stop.id} className={`trip-stop trip-kind-${stop.kind}`}>
              <span className="trip-stop-dot"><Icon size={13} /></span>
              <div className="trip-stop-body">
                <time>{stop.time}</time>
                <strong>{l(stop.name)}</strong>
                <small>{l(KINDS[stop.kind].label)}</small>
              </div>
              <button type="button" className="trip-icon-btn trip-stop-remove" aria-label={t(`${l(stop.name)} 일정에서 삭제`, `Remove ${l(stop.name)}`)} onClick={() => onRemove(index, stop)}><Trash2 size={14} /></button>
              {stopIndex < day.stops.length - 1 && stop.minutes > 0 && <div className="trip-leg"><Mode size={12} />{l(MODES[stop.mode].label)} · {duration(stop.minutes)}</div>}
            </li>;
          })}</ol>}
        {adding === index ? <form className="trip-add-form" onSubmit={(event) => {
          event.preventDefault();
          if (!draft.name.trim()) return;
          onAdd(index, { time: draft.time || "12:00", name: [draft.name.trim(), draft.name.trim()], kind: draft.kind, mode: "car", minutes: 15 });
          setAdding(null);
        }}>
          <div className="trip-add-row">
            <label className="trip-mini">{t("시간", "Time")}<input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></label>
            <label className="trip-mini">{t("종류", "Type")}<span className="trip-select-wrap"><KindIcon size={13} /><select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as StopKind })}>
              {(Object.keys(KINDS) as StopKind[]).map((kind) => <option key={kind} value={kind}>{l(KINDS[kind].label)}</option>)}
            </select></span></label>
          </div>
          <label className="trip-mini">{t("장소 이름", "Place name")}<input data-autofocus value={draft.name} maxLength={30} placeholder={t("예) 곽지 해수욕장", "e.g. Gwakji Beach")} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <div className="trip-actions">
            <button type="button" className="trip-btn trip-neutral trip-sm" onClick={() => setAdding(null)}>{t("취소", "Cancel")}</button>
            <button type="submit" className="trip-btn trip-primary trip-sm" disabled={!draft.name.trim()}>{t("일정에 추가", "Add stop")}</button>
          </div>
        </form> : <button type="button" className="trip-add-stop" onClick={() => { setAdding(index); setDraft({ time: "15:00", name: "", kind: "sight" }); }}><Plus size={14} />{t("장소 추가", "Add a stop")}</button>}
      </article>;
    })}</div>
  </section>;
}

/* ------------------------------------------------------------------ main */

function TravelPreview({ mobile = false }: { mobile?: boolean }) {
  const { t, l, money, date, nightsLabel, guestsLabel } = useCopy();
  const uid = useId();
  const [view, setView] = useState<WebView>("stays");
  const [tab, setTab] = useState<AppTab>("explore");
  const [destination, setDestination] = useState("");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<Range>([3, 5]);
  const [guests, setGuests] = useState<Guests>({ adults: 2, children: 0 });
  const [popover, setPopover] = useState<"dates" | "guests" | "profile" | null>(null);
  const [type, setType] = useState<StayType | "all">("all");
  const [maxPrice, setMaxPrice] = useState(250000);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [saved, setSaved] = useState<number[]>([2, 7]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(1);
  const [detail, setDetail] = useState<number | null>(null);
  const [sheet, setSheet] = useState<"search" | "dates" | null>(null);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [days, setDays] = useState(INITIAL_DAYS);
  const [notice, setNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // A new view or tab starts at the top, like a real page change.
  useEffect(() => {
    const node = scrollRef.current;
    (node?.classList.contains("trip-scroll") ? node : node?.closest<HTMLElement>(".phone-scroll"))?.scrollTo?.({ top: 0 });
  }, [view, tab]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 3200); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (!popover) return;
    function down(event: PointerEvent) { if (!(event.target as Element | null)?.closest?.("[data-trip-pop]")) setPopover(null); }
    function key(event: KeyboardEvent) { if (event.key === "Escape") setPopover(null); }
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [popover]);

  const filters: Filters = { query, type, maxPrice, amenities, freeOnly, sort };
  const results = filterStays(filters);
  const filtered = results.length > 0;
  const anyFilter = type !== "all" || maxPrice < 250000 || amenities.length > 0 || freeOnly || !!query;
  const activeId = hovered ?? selected;
  const nights = range[1] - range[0];
  const detailStay = STAYS.find((stay) => stay.id === detail) ?? null;
  const overlayOpen = detail !== null || sheet !== null;
  const rangeText = `${date(oct(range[0]))} – ${date(oct(range[1]))}`;

  function resetFilters() { setType("all"); setMaxPrice(250000); setAmenities([]); setFreeOnly(false); setQuery(""); setDestination(""); }
  function toggleSave(id: number) {
    const stay = STAYS.find((item) => item.id === id)!;
    const on = saved.includes(id);
    setSaved(on ? saved.filter((item) => item !== id) : [...saved, id]);
    setNotice(on ? t(`${l(stay.name)}을(를) 저장함에서 뺐어요.`, `Removed ${l(stay.name)} from saved.`) : t(`${l(stay.name)}을(를) 저장함에 담았어요.`, `Saved ${l(stay.name)}.`));
  }
  function runSearch() {
    setQuery(destination);
    setPopover(null);
    const count = filterStays({ ...filters, query: destination }).length;
    setNotice(t(`${count}곳의 숙소를 찾았어요 · ${nightsLabel(nights)}, ${guestsLabel(guests)}`, `Found ${count} stays · ${nightsLabel(nights)}, ${guestsLabel(guests)}`));
  }
  function selectOnMap(id: number) {
    setSelected(id);
    if (!mobile) document.getElementById(`${uid}-card-${id}`)?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }
  function book(entry: Omit<Booking, "code" | "status">) {
    const code = `ND-${2610 + bookings.length * 7}`;
    setBookings((list) => [{ ...entry, code, status: "confirmed" }, ...list]);
    setNotice(t(`예약이 확정되었어요 · ${code}`, `Booking confirmed · ${code}`));
    return code;
  }
  function pay(code: string) {
    setBookings((list) => list.map((item) => item.code === code ? { ...item, status: "confirmed" } : item));
    setNotice(t("결제를 마쳤어요. 예약이 확정되었어요.", "Payment complete. Your booking is confirmed."));
  }
  function cancel(code: string) {
    setBookings((list) => list.map((item) => item.code === code ? { ...item, status: "cancelled" } : item));
    setNotice(t("예약을 취소했어요. 환불은 3–5일 안에 처리돼요.", "Booking cancelled. Refunds take 3–5 days."));
  }
  function addStop(dayIndex: number, stop: Omit<Stop, "id">) {
    const id = Math.max(0, ...days.flatMap((day) => day.stops.map((item) => item.id))) + 1;
    setDays(days.map((day, index) => index === dayIndex ? { ...day, stops: [...day.stops, { ...stop, id }].sort((a, b) => a.time.localeCompare(b.time)) } : day));
    setNotice(t(`Day ${days[dayIndex].day}에 ${stop.name[0]}을(를) 추가했어요.`, `Added ${stop.name[1]} to Day ${days[dayIndex].day}.`));
  }
  function removeStop(dayIndex: number, stop: Stop) {
    setDays(days.map((day, index) => index === dayIndex ? { ...day, stops: day.stops.filter((item) => item.id !== stop.id) } : day));
    setNotice(t(`${l(stop.name)}을(를) 일정에서 뺐어요.`, `Removed ${l(stop.name)} from the trip.`));
  }
  function viewBookings() { setDetail(null); if (mobile) setTab("my"); else setView("bookings"); }

  const typeChips = (scroll?: boolean) => <div className={`trip-chips${scroll ? " is-scroll" : ""}`} role="group" aria-label={t("숙소 유형", "Stay type")}>
    <button type="button" className="trip-chip" aria-pressed={type === "all"} onClick={() => setType("all")}><Compass size={14} />{t("전체", "All")}</button>
    {TYPES.map(({ id, label, icon: Icon }) => <button type="button" key={id} className="trip-chip" aria-pressed={type === id} onClick={() => setType(type === id ? "all" : id)}><Icon size={14} />{l(label)}</button>)}
  </div>;
  const noResults = <Empty icon={Search} title={t("조건에 맞는 숙소가 없어요", "No stays match your filters")} body={t("가격 범위를 넓히거나 편의시설 조건을 줄여 보세요.", "Try a wider price range or fewer amenities.")}
    action={<button type="button" className="trip-btn trip-secondary" onClick={resetFilters}>{t("필터 초기화", "Reset filters")}</button>} />;
  const toast = <div className="trip-toast-region" role="status" aria-live="polite">{notice && <div className="trip-toast"><Check size={16} />{notice}</div>}</div>;
  const detailNode = detailStay && <StayDetail key={detailStay.id} stay={detailStay} mobile={mobile} range={range} guests={guests} saved={saved.includes(detailStay.id)}
    onToggleSave={toggleSave} onClose={() => setDetail(null)} onRange={setRange} onGuests={setGuests} onEdit={() => setSheet("dates")} onBook={book} onViewBookings={viewBookings} />;

  /* ------------------------------------------------------------ mobile */
  if (mobile) {
    const deals = STAYS.filter((stay) => stay.tags.includes("deal"));
    const savedStays = STAYS.filter((stay) => saved.includes(stay.id));
    const tabs: { id: AppTab; label: string; icon: LucideIcon }[] = [
      { id: "explore", label: t("탐색", "Explore"), icon: Compass },
      { id: "map", label: t("지도", "Map"), icon: MapIcon },
      { id: "trips", label: t("여행", "Trips"), icon: Route },
      { id: "saved", label: t("저장", "Saved"), icon: Heart },
      { id: "my", label: t("마이", "Me"), icon: User },
    ];
    const card = (stay: Stay, variant: "large" | "row") => <StayCard key={stay.id} stay={stay} variant={variant} saved={saved.includes(stay.id)} onOpen={setDetail} onToggleSave={toggleSave} />;
    const nav = <nav className="trip-tabbar" aria-label={t("하단 메뉴", "Bottom navigation")} inert={overlayOpen}>
      {tabs.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
        <Icon size={20} /><span>{label}</span>{id === "saved" && saved.length > 0 && <i className="trip-tab-badge">{saved.length}</i>}
      </button>)}
    </nav>;
    const overlay = <>
      {detailNode && <Dialog label={l(detailStay!.name)} onClose={() => setDetail(null)} className="trip-panel" scrimClass="trip-scrim-full" inert={sheet !== null}>{detailNode}</Dialog>}
      {sheet && <Dialog label={sheet === "dates" ? t("날짜와 인원 변경", "Change dates and guests") : t("숙소 검색", "Search stays")} onClose={() => setSheet(null)} className="trip-sheet" scrimClass="trip-scrim-sheet">
        <span className="trip-sheet-handle" aria-hidden="true" />
        <header className="trip-sheet-head">
          <h2>{sheet === "dates" ? t("날짜·인원 변경", "Dates & guests") : t("어디로 떠날까요?", "Where to?")}</h2>
          <button type="button" className="trip-icon-btn" aria-label={t("닫기", "Close")} onClick={() => setSheet(null)}><X size={18} /></button>
        </header>
        {sheet === "search" && <label className="trip-input-icon"><MapPin size={15} /><input aria-label={t("목적지", "Destination")} value={destination} placeholder={t("제주, 경주, 부산…", "Jeju, Gyeongju, Busan…")} onChange={(event) => setDestination(event.target.value)} /></label>}
        <h3 className="trip-h3">{t("체크인 – 체크아웃", "Check-in – Check-out")}</h3>
        <RangeCalendar range={range} onChange={setRange} />
        <h3 className="trip-h3">{t("인원", "Guests")}</h3>
        <GuestStepper guests={guests} onChange={setGuests} />
        <button type="button" className="trip-btn trip-primary trip-block" onClick={() => { if (sheet === "search") runSearch(); else setNotice(t(`${rangeText} · ${guestsLabel(guests)}로 바꿨어요.`, `Updated to ${rangeText} · ${guestsLabel(guests)}.`)); setSheet(null); }}>
          {sheet === "search" ? t("숙소 검색", "Search stays") : t("적용하기", "Apply")}
        </button>
      </Dialog>}
      {toast}
    </>;
    return <div className="trip trip-app">
      <IntroPhone nav={nav} overlay={overlay}>
        <div className="trip-m" inert={overlayOpen} ref={scrollRef}>
          {tab === "explore" && <>
            <header className="trip-m-top">
              <span className="trip-brand"><span className="trip-brand-mark"><Compass size={15} /></span>nadeul<span className="trip-brand-dot">.</span></span>
              <button type="button" className="trip-icon-btn trip-bell" aria-label={t("알림 보기", "View notifications")} onClick={() => setNotice(t("새 알림이 없어요.", "No new notifications."))}><Bell size={18} /><i /></button>
            </header>
            <h1 className="trip-m-title">{t("지우님, 이번엔 어디로 떠날까요?", "Where to next, Jiwoo?")}</h1>
            <button type="button" className="trip-pill" onClick={() => setSheet("search")}>
              <Search size={17} />
              <span><strong>{query || t("목적지 검색", "Search destinations")}</strong><small>{rangeText} · {guestsLabel(guests)}</small></span>
              <span className="trip-pill-icon"><CalendarDays size={15} /></span>
            </button>
            {typeChips(true)}
            <section className="trip-m-section">
              <div className="trip-m-head"><h2>{t("이번 주 특가", "Deals this week")}</h2><span className="trip-tag trip-tag-accent">{t("최대 10%", "Up to 10%")}</span></div>
              <div className="trip-hscroll" role="list">{deals.map((stay) => <div role="listitem" key={stay.id}>{card(stay, "large")}</div>)}</div>
            </section>
            <section className="trip-m-section">
              <div className="trip-m-head">
                <h2>{query ? t(`'${query}' 검색 결과`, `Results for "${query}"`) : t("추천 숙소", "Recommended")}</h2>
                <span className="trip-muted">{t(`${results.length}곳`, `${results.length} stays`)}</span>
              </div>
              {filtered ? <div className="trip-m-list">{results.map((stay) => card(stay, "row"))}</div> : noResults}
            </section>
          </>}
          {tab === "map" && <div className="trip-m-map">
            <div className="trip-m-map-top">{typeChips(true)}</div>
            <MapPanel compact stays={results} activeId={selected} onSelect={setSelected} onOpen={setDetail} />
            {!filtered && noResults}
          </div>}
          {tab === "trips" && <div className="trip-m-pad"><Itinerary mobile days={days} guests={guests} onAdd={addStop} onRemove={removeStop} /></div>}
          {tab === "saved" && <div className="trip-m-pad">
            <h1 className="trip-m-title">{t("저장한 숙소", "Saved stays")}</h1>
            {savedStays.length ? <div className="trip-m-list">{savedStays.map((stay) => card(stay, "row"))}</div>
              : <Empty icon={Heart} title={t("아직 저장한 숙소가 없어요", "Nothing saved yet")} body={t("하트를 눌러 마음에 드는 숙소를 모아 보세요.", "Tap the heart to collect stays you like.")} action={<button type="button" className="trip-btn trip-secondary" onClick={() => setTab("explore")}>{t("숙소 둘러보기", "Browse stays")}</button>} />}
          </div>}
          {tab === "my" && <div className="trip-m-pad">
            <div className="trip-profile-card">
              <span className="trip-avatar trip-avatar-lg">J</span>
              <div><strong>{t("김지우", "Jiwoo Kim")}</strong><small>{t("익스플로러 등급 · 12,400P", "Explorer tier · 12,400 pts")}</small></div>
            </div>
            <dl className="trip-my-stats">
              <div><dt>{t("예약", "Bookings")}</dt><dd>{bookings.filter((item) => item.status !== "cancelled").length}</dd></div>
              <div><dt>{t("저장", "Saved")}</dt><dd>{saved.length}</dd></div>
              <div><dt>{t("후기", "Reviews")}</dt><dd>3</dd></div>
            </dl>
            <h2 className="trip-m-sub">{t("예약 내역", "My bookings")}</h2>
            <Bookings compact bookings={bookings} onPay={pay} onCancel={cancel} onOpenStay={setDetail} onBrowse={() => setTab("explore")} />
          </div>}
        </div>
      </IntroPhone>
    </div>;
  }

  /* --------------------------------------------------------------- web */
  const nav: { id: WebView; label: string; icon: LucideIcon }[] = [
    { id: "stays", label: t("숙소", "Stays"), icon: BedDouble },
    { id: "trips", label: t("여행 일정", "Trips"), icon: Route },
    { id: "saved", label: t("저장함", "Saved"), icon: Heart },
    { id: "bookings", label: t("예약 내역", "Bookings"), icon: Ticket },
  ];
  const savedStays = STAYS.filter((stay) => saved.includes(stay.id));
  const heading = (eyebrow: string, title: string, body: string) => <div className="trip-page-head">
    <span className="trip-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{body}</p>
  </div>;

  return <div className="trip trip-web">
    <IntroViewport>
      <div className="trip-shell">
        <div className="trip-scroll" inert={overlayOpen} ref={scrollRef}>
          <header className="trip-header">
            <button type="button" className="trip-brand" onClick={() => setView("stays")} aria-label={t("nadeul. 홈으로", "nadeul. home")}>
              <span className="trip-brand-mark"><Compass size={17} /></span>nadeul<span className="trip-brand-dot">.</span>
            </button>
            <nav className="trip-nav" aria-label={t("주요 메뉴", "Main menu")}>
              {nav.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-current={view === id ? "page" : undefined} onClick={() => setView(id)}>
                <Icon size={15} /><span>{label}</span>{id === "saved" && saved.length > 0 && <i className="trip-count">{saved.length}</i>}
              </button>)}
            </nav>
            <div className="trip-header-end" data-trip-pop>
              <span className="trip-points"><Sparkles size={13} />12,400P</span>
              <button type="button" className="trip-profile-btn" aria-haspopup="true" aria-expanded={popover === "profile"} onClick={() => setPopover(popover === "profile" ? null : "profile")}>
                <span className="trip-avatar">J</span><span className="trip-profile-name">{t("지우", "Jiwoo")}</span><ChevronDown size={14} />
              </button>
              {popover === "profile" && <div className="trip-popover trip-profile-pop">
                <div className="trip-profile-card"><span className="trip-avatar trip-avatar-lg">J</span><div><strong>{t("김지우", "Jiwoo Kim")}</strong><small>{t("익스플로러 등급", "Explorer tier")}</small></div></div>
                <button type="button" onClick={() => { setView("bookings"); setPopover(null); }}><Ticket size={15} />{t("예약 내역", "Bookings")}</button>
                <button type="button" onClick={() => { setView("saved"); setPopover(null); }}><Heart size={15} />{t("저장함", "Saved")}</button>
                <button type="button" onClick={() => { setView("trips"); setPopover(null); }}><Route size={15} />{t("여행 일정", "Trips")}</button>
              </div>}
            </div>
          </header>

          <main className="trip-main">
            {view === "stays" && <>
              <section className="trip-hero">
                <Scene n={0} type="resort" className="trip-hero-scene" />
                <div className="trip-hero-copy">
                  <span className="trip-eyebrow">AUTUMN ESCAPES · 2026</span>
                  <h1>{t("이번 가을, 머물고 싶은 곳으로", "This autumn, stay somewhere you love")}</h1>
                  <p>{t("한옥부터 바닷가 캠핑까지, 오늘 예약하면 무료 취소까지 챙겨 드려요.", "From hanok to beach camping — book today with free cancellation.")}</p>
                </div>
                <form className="trip-search" role="search" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
                  <label className="trip-search-field">
                    <span className="trip-search-label"><MapPin size={13} />{t("목적지", "Destination")}</span>
                    <input value={destination} placeholder={t("제주, 경주, 부산…", "Jeju, Gyeongju, Busan…")} onChange={(event) => setDestination(event.target.value)} />
                  </label>
                  <div className="trip-search-field" data-trip-pop>
                    <span className="trip-search-label" aria-hidden="true"><CalendarDays size={13} />{t("체크인 – 체크아웃", "Check-in – Check-out")}</span>
                    <button type="button" className="trip-search-value" aria-haspopup="dialog" aria-expanded={popover === "dates"} aria-label={`${t("체크인 – 체크아웃", "Check-in – Check-out")}: ${rangeText}`} onClick={() => setPopover(popover === "dates" ? null : "dates")}>
                      {rangeText}<small>{nightsLabel(nights)}</small>
                    </button>
                    {popover === "dates" && <div className="trip-popover trip-cal-pop" role="dialog" aria-label={t("날짜 선택", "Pick dates")}>
                      <RangeCalendar range={range} onChange={setRange} />
                      <div className="trip-pop-foot"><span className="trip-muted">{t("10월 1일은 지난 날짜예요", "Oct 1 is in the past")}</span><button type="button" className="trip-btn trip-primary trip-sm" onClick={() => setPopover(null)}>{t("완료", "Done")}</button></div>
                    </div>}
                  </div>
                  <div className="trip-search-field" data-trip-pop>
                    <span className="trip-search-label" aria-hidden="true"><Users size={13} />{t("인원", "Guests")}</span>
                    <button type="button" className="trip-search-value" aria-haspopup="dialog" aria-expanded={popover === "guests"} aria-label={`${t("인원", "Guests")}: ${guestsLabel(guests)}`} onClick={() => setPopover(popover === "guests" ? null : "guests")}>
                      {guestsLabel(guests)}
                    </button>
                    {popover === "guests" && <div className="trip-popover trip-guest-pop" role="dialog" aria-label={t("인원 선택", "Choose guests")}>
                      <GuestStepper guests={guests} onChange={setGuests} />
                      <div className="trip-pop-foot"><span className="trip-muted">{t("최대 6명까지 머물 수 있어요", "Rooms fit up to 6 guests")}</span><button type="button" className="trip-btn trip-primary trip-sm" onClick={() => setPopover(null)}>{t("완료", "Done")}</button></div>
                    </div>}
                  </div>
                  <button type="submit" className="trip-btn trip-primary trip-search-go"><Search size={16} />{t("검색", "Search")}</button>
                </form>
              </section>

              <section className="trip-results-wrap" aria-labelledby={`${uid}-results`}>
                {typeChips()}
                <div className="trip-toolbar">
                  <h2 id={`${uid}-results`} className="trip-result-count" aria-live="polite">
                    {query ? t(`'${query}' 숙소 ${results.length}곳`, `${results.length} stays for "${query}"`) : t(`숙소 ${results.length}곳`, `${results.length} stays`)}
                  </h2>
                  <label className="trip-range">
                    <span>{t("1박 최대", "Max per night")} <strong>{money(maxPrice)}</strong></span>
                    <input type="range" min={60000} max={250000} step={10000} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} aria-valuetext={money(maxPrice)} />
                  </label>
                  <button type="button" className="trip-chip" aria-pressed={freeOnly} onClick={() => setFreeOnly(!freeOnly)}><ShieldCheck size={14} />{t("무료 취소만", "Free cancellation")}</button>
                  <label className="trip-select-wrap">
                    <ArrowUpDown size={13} />
                    <span className="trip-sr">{t("정렬", "Sort")}</span>
                    <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>{SORTS.map((item) => <option key={item.id} value={item.id}>{l(item.label)}</option>)}</select>
                  </label>
                </div>
                <div className="trip-amenity-row" role="group" aria-label={t("편의시설 필터", "Amenity filters")}>
                  {FILTER_AMENITIES.map((item) => { const Icon = AMENITIES[item].icon; const on = amenities.includes(item); return <button type="button" key={item} className="trip-chip trip-chip-sm" aria-pressed={on} onClick={() => setAmenities(on ? amenities.filter((value) => value !== item) : [...amenities, item])}><Icon size={13} />{l(AMENITIES[item].label)}</button>; })}
                  {anyFilter && <button type="button" className="trip-link" onClick={resetFilters}>{t("필터 초기화", "Reset filters")}</button>}
                </div>
                <div className="trip-results">
                  {filtered ? <div className="trip-grid">{results.map((stay) => <StayCard key={stay.id} cardId={`${uid}-card-${stay.id}`} stay={stay} saved={saved.includes(stay.id)} active={activeId === stay.id} onOpen={setDetail} onToggleSave={toggleSave} onHover={setHovered} />)}</div> : noResults}
                  <aside className="trip-map-wrap" aria-label={t("지도", "Map")}>
                    <MapPanel stays={results} activeId={activeId} onSelect={selectOnMap} onHover={setHovered} onOpen={setDetail} />
                  </aside>
                </div>
              </section>
            </>}

            {view === "trips" && <>
              {heading("MY TRIPS", t("여행 일정", "Trip itinerary"), t("날짜별 동선을 정리하고, 가고 싶은 곳을 더하거나 빼 보세요.", "Plan each day and add or remove the places you want to visit."))}
              <Itinerary days={days} guests={guests} onAdd={addStop} onRemove={removeStop} />
            </>}

            {view === "saved" && <>
              {heading("SAVED", t("저장함", "Saved stays"), t(`마음에 담아 둔 숙소 ${savedStays.length}곳이에요.`, `${savedStays.length} stays you saved for later.`))}
              {savedStays.length ? <div className="trip-grid trip-grid-wide">{savedStays.map((stay) => <StayCard key={stay.id} stay={stay} saved onOpen={setDetail} onToggleSave={toggleSave} />)}</div>
                : <Empty icon={Heart} title={t("아직 저장한 숙소가 없어요", "Nothing saved yet")} body={t("숙소 카드의 하트를 눌러 이곳에 모아 보세요.", "Tap the heart on any stay to collect it here.")} action={<button type="button" className="trip-btn trip-secondary" onClick={() => setView("stays")}>{t("숙소 둘러보기", "Browse stays")}</button>} />}
            </>}

            {view === "bookings" && <>
              {heading("BOOKINGS", t("예약 내역", "Bookings"), t("예정된 여행과 지난 여행을 한곳에서 확인해요.", "Upcoming and past trips in one place."))}
              <Bookings bookings={bookings} onPay={pay} onCancel={cancel} onOpenStay={setDetail} onBrowse={() => setView("stays")} />
            </>}

            <footer className="trip-footer">
              <span><Check size={12} />{t("예약은 이 프리뷰 안에서만 저장돼요", "Bookings stay inside this preview")}</span>
              <span>{t("nadeul. · 머무는 여행", "nadeul. · travel that stays with you")}</span>
            </footer>
          </main>
        </div>
        {detailNode && <Dialog label={l(detailStay!.name)} onClose={() => setDetail(null)} className="trip-detail">{detailNode}</Dialog>}
        {toast}
      </div>
    </IntroViewport>
  </div>;
}

export function TravelWeb() { return <TravelPreview />; }
export function TravelApp() { return <TravelPreview mobile />; }
