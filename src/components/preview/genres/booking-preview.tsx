"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Beer,
  Bell,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleUser,
  Clock,
  Coffee,
  CookingPot,
  Croissant,
  EggFried,
  Fish,
  Heart,
  House,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  MessageSquareText,
  Minus,
  Navigation,
  Pizza,
  Plus,
  Search,
  SearchX,
  SlidersHorizontal,
  Soup,
  Star,
  Store,
  Ticket,
  Users,
  Utensils,
  UtensilsCrossed,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { IntroPhone, IntroViewport } from "../kinds/shared";
import { useMatchuStore } from "@/lib/store";
import "./booking-preview.css";

/* ───────────────────────── data ───────────────────────── */

type L = readonly [string, string];
type Cuisine = "korean" | "western" | "japanese" | "cafe" | "brunch" | "wine";
type Mood = "date" | "solo" | "group" | "view";
type Area = "seongsu" | "hannam" | "yeonnam" | "euljiro" | "seochon";
type Avail = "open" | "few" | "waiting";
type Period = "any" | "lunch" | "dinner";
type Sort = "recommended" | "rating" | "distance" | "reviews" | "price";
type SlotState = "open" | "few" | "full" | "past";
type ResStatus = "confirmed" | "pending" | "cancelled" | "visited";
type Tone = 0 | 1 | 2 | 3 | 4 | 5;

type Restaurant = {
  id: number;
  name: L;
  area: Area;
  cuisine: Cuisine;
  moods: Mood[];
  rating: number;
  reviews: number;
  avg: number;
  distance: number;
  status: Avail;
  /** Weekly closed day, 0 = Sunday. */
  closed: number;
  tone: Tone;
  icon: LucideIcon;
  hours: string;
  pin: readonly [number, number];
  blurb: L;
  menu: { name: L; price: number }[];
};

type Reservation = { id: string; rid: number; day: number; time: string; party: number; status: ResStatus; note: string | L; review?: number };

type Filters = { area: Area | "all"; day: number; party: number; period: Period; query: string; cuisine: Cuisine | "all"; moods: Mood[]; onlyAvailable: boolean; sort: Sort };

const RESTAURANTS: Restaurant[] = [
  { id: 1, name: ["온기 한식당", "Ongi Hansik"], area: "seongsu", cuisine: "korean", moods: ["date", "group"], rating: 4.8, reviews: 1284, avg: 28000, distance: 0.6, status: "open", closed: 1, tone: 0, icon: Soup, hours: "11:30 – 21:30", pin: [72, 32],
    blurb: ["제철 재료로 끓인 국과 갓 지은 솥밥을 한상으로 차려요.", "Seasonal soups and freshly cooked pot rice, served as a full table."],
    menu: [{ name: ["들기름 솥밥", "Perilla-oil pot rice"], price: 18000 }, { name: ["한우 맑은 곰탕", "Clear beef bone soup"], price: 16000 }, { name: ["계절 전 모둠", "Seasonal pancake platter"], price: 22000 }] },
  { id: 2, name: ["달빛 비스트로", "Moonlight Bistro"], area: "hannam", cuisine: "western", moods: ["date", "view"], rating: 4.6, reviews: 842, avg: 52000, distance: 2.1, status: "few", closed: 0, tone: 1, icon: Utensils, hours: "17:00 – 23:00", pin: [52, 70],
    blurb: ["한남동 언덕 위, 창 너머 야경과 함께하는 작은 비스트로.", "A small hillside bistro in Hannam with a view of the city lights."],
    menu: [{ name: ["트러플 감자 뇨끼", "Truffle potato gnocchi"], price: 26000 }, { name: ["드라이에이징 스테이크", "Dry-aged steak"], price: 58000 }, { name: ["바스크 치즈케이크", "Basque cheesecake"], price: 12000 }] },
  { id: 3, name: ["스시 하루", "Sushi Haru"], area: "euljiro", cuisine: "japanese", moods: ["solo", "date"], rating: 4.9, reviews: 2031, avg: 95000, distance: 3.4, status: "waiting", closed: 0, tone: 2, icon: Fish, hours: "12:00 – 22:00", pin: [45, 40],
    blurb: ["열 석 남짓한 카운터에서 셰프가 한 점씩 쥐어 드려요.", "Ten counter seats, with the chef serving one piece at a time."],
    menu: [{ name: ["오마카세 디너", "Omakase dinner"], price: 120000 }, { name: ["런치 니기리 세트", "Lunch nigiri set"], price: 65000 }, { name: ["계절 사시미", "Seasonal sashimi"], price: 48000 }] },
  { id: 4, name: ["느린 오후 커피", "Slow Afternoon Coffee"], area: "yeonnam", cuisine: "cafe", moods: ["solo"], rating: 4.5, reviews: 512, avg: 9000, distance: 1.2, status: "open", closed: 3, tone: 3, icon: Coffee, hours: "10:00 – 21:00", pin: [16, 30],
    blurb: ["연남동 골목 2층, 핸드드립과 구움과자가 있는 조용한 카페.", "A quiet second-floor café in Yeonnam with hand drip and baked goods."],
    menu: [{ name: ["오늘의 핸드드립", "Hand drip of the day"], price: 7000 }, { name: ["흑임자 라테", "Black sesame latte"], price: 7500 }, { name: ["레몬 파운드", "Lemon pound cake"], price: 6000 }] },
  { id: 5, name: ["선데이 테이블", "Sunday Table"], area: "seongsu", cuisine: "brunch", moods: ["date", "group"], rating: 4.7, reviews: 967, avg: 24000, distance: 0.9, status: "few", closed: 4, tone: 4, icon: EggFried, hours: "09:30 – 20:30", pin: [81, 44],
    blurb: ["주말 같은 평일을 위한 브런치. 큰 창과 긴 원목 테이블.", "Brunch that makes any weekday feel like Sunday, with big windows."],
    menu: [{ name: ["에그 베네딕트", "Eggs Benedict"], price: 19000 }, { name: ["리코타 팬케이크", "Ricotta pancakes"], price: 17000 }, { name: ["시즌 샐러드 볼", "Seasonal salad bowl"], price: 15000 }] },
  { id: 6, name: ["코르크 앤 바인", "Cork & Vine"], area: "hannam", cuisine: "wine", moods: ["date", "view"], rating: 4.6, reviews: 388, avg: 45000, distance: 2.4, status: "open", closed: 1, tone: 5, icon: Wine, hours: "18:00 – 01:00", pin: [62, 60],
    blurb: ["내추럴 와인 120종과 작은 접시 요리가 있는 루프탑 바.", "A rooftop bar with 120 natural wines and small plates."],
    menu: [{ name: ["소믈리에 추천 글라스", "Sommelier's glass pick"], price: 16000 }, { name: ["샤퀴테리 보드", "Charcuterie board"], price: 32000 }, { name: ["버섯 리소토", "Mushroom risotto"], price: 27000 }] },
  { id: 7, name: ["할머니 국수", "Halmeoni Noodles"], area: "seochon", cuisine: "korean", moods: ["solo", "group"], rating: 4.4, reviews: 1502, avg: 11000, distance: 4.1, status: "open", closed: 0, tone: 1, icon: CookingPot, hours: "11:00 – 20:30", pin: [33, 17],
    blurb: ["삼십 년째 같은 멸치 육수, 서촌 골목의 오래된 국숫집.", "The same anchovy broth for thirty years, in a Seochon side street."],
    menu: [{ name: ["멸치 잔치국수", "Anchovy banquet noodles"], price: 8000 }, { name: ["비빔국수", "Spicy mixed noodles"], price: 9000 }, { name: ["김치 만두", "Kimchi dumplings"], price: 7000 }] },
  { id: 8, name: ["오븐 앤 브레드", "Oven & Bread"], area: "yeonnam", cuisine: "brunch", moods: ["solo", "date"], rating: 4.3, reviews: 276, avg: 16000, distance: 1.5, status: "waiting", closed: 1, tone: 0, icon: Croissant, hours: "08:30 – 21:00", pin: [25, 42],
    blurb: ["매일 아침 굽는 사워도우와 크루아상으로 만드는 샌드위치.", "Sandwiches built on sourdough and croissants baked every morning."],
    menu: [{ name: ["크루아상 샌드위치", "Croissant sandwich"], price: 14000 }, { name: ["사워도우 토스트", "Sourdough toast"], price: 12000 }, { name: ["시나몬 롤", "Cinnamon roll"], price: 5500 }] },
  { id: 9, name: ["이자카야 등불", "Izakaya Deungbul"], area: "euljiro", cuisine: "japanese", moods: ["group", "solo"], rating: 4.5, reviews: 733, avg: 32000, distance: 3.1, status: "few", closed: 0, tone: 3, icon: Beer, hours: "17:00 – 02:00", pin: [53, 47],
    blurb: ["을지로 인쇄 골목의 등불 아래, 꼬치와 하이볼 한잔.", "Skewers and a highball under the lanterns of Euljiro's print alley."],
    menu: [{ name: ["모둠 꼬치", "Assorted skewers"], price: 24000 }, { name: ["가라아게", "Karaage"], price: 16000 }, { name: ["유자 하이볼", "Yuzu highball"], price: 9000 }] },
  { id: 10, name: ["트라토리아 루체", "Trattoria Luce"], area: "seochon", cuisine: "western", moods: ["date", "group", "view"], rating: 4.7, reviews: 654, avg: 38000, distance: 3.8, status: "open", closed: 1, tone: 2, icon: Pizza, hours: "11:30 – 22:00", pin: [41, 26],
    blurb: ["화덕에서 구운 피자와 매일 뽑는 생면 파스타.", "Wood-fired pizza and pasta made fresh every day."],
    menu: [{ name: ["화덕 마르게리타", "Wood-fired margherita"], price: 21000 }, { name: ["생면 라구 파스타", "Fresh ragù pasta"], price: 24000 }, { name: ["티라미수", "Tiramisu"], price: 10000 }] },
];

const CUISINES: Record<Cuisine, { label: L; icon: LucideIcon }> = {
  korean: { label: ["한식", "Korean"], icon: Soup },
  western: { label: ["양식", "Western"], icon: Utensils },
  japanese: { label: ["일식", "Japanese"], icon: Fish },
  cafe: { label: ["카페", "Café"], icon: Coffee },
  brunch: { label: ["브런치", "Brunch"], icon: EggFried },
  wine: { label: ["와인바", "Wine bar"], icon: Wine },
};
const CUISINE_ORDER: Cuisine[] = ["korean", "western", "japanese", "cafe", "brunch", "wine"];
const MOODS: Record<Mood, L> = { date: ["데이트", "Date night"], solo: ["혼밥", "Solo dining"], group: ["단체석", "Groups"], view: ["뷰 맛집", "Great view"] };
const MOOD_ORDER: Mood[] = ["date", "solo", "group", "view"];
const AREAS: Record<Area, L> = { seongsu: ["성수", "Seongsu"], hannam: ["한남", "Hannam"], yeonnam: ["연남", "Yeonnam"], euljiro: ["을지로", "Euljiro"], seochon: ["서촌", "Seochon"] };
const AREA_ORDER: Area[] = ["seongsu", "hannam", "yeonnam", "euljiro", "seochon"];
const AREA_LABEL_POS: Record<Area, readonly [number, number]> = { seongsu: [78, 22], hannam: [58, 82], yeonnam: [12, 54], euljiro: [50, 30], seochon: [26, 8] };
const SORTS: { id: Sort; label: L }[] = [
  { id: "recommended", label: ["추천순", "Recommended"] },
  { id: "rating", label: ["평점 높은순", "Top rated"] },
  { id: "distance", label: ["가까운순", "Nearest"] },
  { id: "reviews", label: ["리뷰 많은순", "Most reviewed"] },
  { id: "price", label: ["가격 낮은순", "Lowest price"] },
];
const REVIEWS: { name: L; rating: number; text: L }[] = [
  { name: ["민지", "Minji"], rating: 5, text: ["직원분들이 친절하고 음식이 정갈했어요. 기념일에 또 올게요.", "Warm staff and beautifully plated food. We'll be back for our anniversary."] },
  { name: ["도윤", "Doyun"], rating: 4, text: ["예약한 시간에 바로 앉을 수 있어서 좋았어요.", "We were seated right on time, which made the evening easy."] },
];
const NOTE_CHIPS: L[] = [["창가 자리", "Window seat"], ["유아 의자", "High chair"], ["기념일이에요", "Celebrating"], ["알레르기 있어요", "Allergy"]];
const REVIEW_TAGS: L[] = [["맛있어요", "Delicious"], ["친절해요", "Friendly staff"], ["분위기 좋아요", "Great mood"], ["재방문 의사", "Would return"]];
const RATING_WORDS: L[] = [["별점을 골라 주세요", "Pick a rating"], ["아쉬웠어요", "Disappointing"], ["그저 그래요", "It was okay"], ["괜찮았어요", "Good"], ["좋았어요", "Great"], ["최고예요", "Outstanding"]];

/** Days are counted from 2026-09-01 (day 0) so every render is deterministic. */
const TODAY = 21; // Tue, Sep 22 2026
const NOW = "14:10";
const CAL_START = 19; // Sun, Sep 20
const CAL_DAYS = 14;
const CAL_END = CAL_START + CAL_DAYS - 1; // Sat, Oct 3
const LUNCH = ["11:30", "12:00", "12:30", "13:00", "13:30"];
const DINNER = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
const SLOTS = [...LUNCH, ...DINNER];
const MAX_PARTY = 8;
const WD_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WD_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_EN_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: "SU-0925-19002", rid: 2, day: 24, time: "19:00", party: 2, status: "confirmed", note: ["창가 자리", "Window seat"] },
  { id: "SU-0928-12303", rid: 3, day: 27, time: "12:30", party: 4, status: "pending", note: "" },
  { id: "SU-0914-18301", rid: 1, day: 13, time: "18:30", party: 2, status: "visited", note: "" },
  { id: "SU-0909-15004", rid: 4, day: 8, time: "15:00", party: 3, status: "cancelled", note: "" },
  { id: "SU-0903-19306", rid: 6, day: 2, time: "19:30", party: 2, status: "visited", note: "", review: 5 },
];
const DEFAULT_FILTERS: Filters = { area: "all", day: TODAY, party: 2, period: "dinner", query: "", cuisine: "all", moods: [], onlyAvailable: false, sort: "recommended" };

/* ───────────────────────── helpers ───────────────────────── */

function dayParts(day: number) {
  const date = new Date(Date.UTC(2026, 8, 1 + day));
  return { m: date.getUTCMonth() + 1, d: date.getUTCDate(), w: date.getUTCDay() };
}
const isClosed = (r: Restaurant, day: number) => dayParts(day).w === r.closed;
const pad = (n: number) => String(n).padStart(2, "0");
const byId = (id: number) => RESTAURANTS.find((r) => r.id === id) ?? RESTAURANTS[0];
const isPickable = (state: SlotState) => state === "open" || state === "few";

function slotInfo(r: Restaurant, day: number, time: string, party: number): { state: SlotState; left: number } {
  if (day < TODAY || (day === TODAY && time <= NOW)) return { state: "past", left: 0 };
  if (isClosed(r, day)) return { state: "full", left: 0 };
  const index = SLOTS.indexOf(time);
  const bias = r.status === "waiting" ? 3 : r.status === "few" ? 2 : 0;
  const hash = ((r.id * 37 + day * 11 + index * 5 + ((r.id * day) % 7)) % 10) - bias;
  const left = hash <= 1 ? 0 : hash <= 3 ? hash - 1 : 4;
  const tablesNeeded = party > 4 ? 2 : 1;
  if (left < tablesNeeded) return { state: "full", left: 0 };
  return { state: left <= 2 ? "few" : "open", left };
}
function periodSlots(period: Period) {
  return period === "lunch" ? LUNCH : period === "dinner" ? DINNER : SLOTS;
}
function availableSlots(r: Restaurant, day: number, period: Period, party: number) {
  if (isClosed(r, day)) return [];
  return periodSlots(period).filter((time) => isPickable(slotInfo(r, day, time, party).state));
}
function startDay(r: Restaurant, wanted: number, party: number) {
  if (wanted >= TODAY && wanted <= CAL_END && !isClosed(r, wanted)) return wanted;
  for (let day = TODAY; day <= CAL_END; day += 1) if (availableSlots(r, day, "any", party).length) return day;
  return TODAY;
}
function filterRestaurants(f: Filters) {
  const q = f.query.trim().toLowerCase();
  const matched = RESTAURANTS.filter((r) =>
    (f.area === "all" || r.area === f.area) &&
    (f.cuisine === "all" || r.cuisine === f.cuisine) &&
    f.moods.every((mood) => r.moods.includes(mood)) &&
    (!q || [...r.name, ...r.menu.flatMap((item) => [...item.name])].some((text) => text.toLowerCase().includes(q))));
  const open = matched.filter((r) => !isClosed(r, f.day));
  const list = f.onlyAvailable ? open.filter((r) => availableSlots(r, f.day, f.period, f.party).length > 0) : open;
  const score = (r: Restaurant) => r.rating * 10 + (r.status === "open" ? 3 : r.status === "few" ? 1.5 : 0) - r.distance * 0.6;
  const sorted = [...list].sort((a, b) => {
    if (f.sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
    if (f.sort === "distance") return a.distance - b.distance;
    if (f.sort === "reviews") return b.reviews - a.reviews;
    if (f.sort === "price") return a.avg - b.avg;
    return score(b) - score(a);
  });
  return { list: sorted, hiddenClosed: matched.length - open.length };
}

function useI18n() {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const t = (ko: string, en: string) => (isKo ? ko : en);
  const l = (pair: L) => (isKo ? pair[0] : pair[1]);
  const money = (amount: number) => (isKo ? `${amount.toLocaleString("ko-KR")}원` : `₩${amount.toLocaleString("en-US")}`);
  const date = (day: number) => {
    const p = dayParts(day);
    return isKo ? `${p.m}월 ${p.d}일 (${WD_KO[p.w]})` : `${WD_EN[p.w]}, ${MON_EN[p.m - 1]} ${p.d}`;
  };
  const relDay = (day: number) => (day === TODAY ? `${t("오늘", "Today")} · ${date(day)}` : day === TODAY + 1 ? `${t("내일", "Tomorrow")} · ${date(day)}` : date(day));
  const party = (n: number) => (isKo ? `${n}명` : `${n} ${n === 1 ? "guest" : "guests"}`);
  const km = (n: number) => (isKo ? `${n}km` : `${n} km`);
  const closedDay = (w: number) => (isKo ? `매주 ${WD_KO[w]}요일` : `${WD_EN_FULL[w]}s`);
  const slotText = (state: SlotState, left: number) =>
    state === "open" ? t("여유", "Open") : state === "few" ? t(`${left}팀 남음`, `${left} left`) : state === "full" ? t("마감", "Full") : t("지남", "Past");
  return { isKo, t, l, money, date, relDay, party, km, closedDay, slotText };
}

function useBookingData() {
  const { t, l } = useI18n();
  const [saved, setSaved] = useState<number[]>([2, 6, 10]);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3400);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const toast = (text: string) => setNotice((prev) => ({ id: (prev?.id ?? 0) + 1, text }));
  const upcoming = reservations.filter((x) => x.status === "confirmed" || x.status === "pending").sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  return {
    saved,
    reservations,
    upcoming,
    notice,
    toast,
    toggleSave(r: Restaurant) {
      const on = saved.includes(r.id);
      setSaved((list) => (on ? list.filter((id) => id !== r.id) : [...list, r.id]));
      toast(on ? t(`저장함에서 뺐어요 · ${l(r.name)}`, `Removed from saved · ${l(r.name)}`) : t(`저장함에 담았어요 · ${l(r.name)}`, `Saved · ${l(r.name)}`));
    },
    book(res: Reservation) {
      setReservations((list) => [res, ...list]);
      toast(res.status === "confirmed" ? t("예약이 확정됐어요.", "Your table is confirmed.") : t("예약을 요청했어요. 매장이 확인하면 알려드릴게요.", "Request sent. We'll let you know once it's confirmed."));
    },
    cancel(id: string) {
      setReservations((list) => list.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
      toast(t("예약을 취소했어요. 지난 예약에서 볼 수 있어요.", "Reservation cancelled. You'll find it under Past."));
    },
    review(id: string, rating: number) {
      setReservations((list) => list.map((x) => (x.id === id ? { ...x, review: rating } : x)));
      toast(t("리뷰를 남겼어요. 고마워요!", "Thanks for sharing your review!"));
    },
  };
}

/* ───────────────────────── shared pieces ───────────────────────── */

const FOCUSABLE = 'button:not(:disabled):not([tabindex="-1"]), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

function Layer({ kind, label, onClose, inert, className = "", children }: { kind: "modal" | "sheet" | "panel"; label: string; onClose: () => void; inert?: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    (root.querySelector<HTMLElement>("[data-autofocus]") ?? root.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      requestAnimationFrame(() => {
        if (previous?.isConnected) previous.focus();
      });
    };
  }, []);
  const dialog = (
    <div ref={ref} className={`book-layer book-layer-${kind} ${className}`} role="dialog" aria-modal="true" aria-label={label} inert={inert} onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  );
  if (kind === "panel") return dialog;
  return (
    <div className={`book-scrim book-scrim-${kind}`} onClick={onClose}>
      {dialog}
    </div>
  );
}

function DialogHead({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="book-dialog-head">
      <div className="book-min">
        <span className="book-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div className="book-inline">
        {children}
        <button type="button" className="book-icon-btn" onClick={onClose} aria-label={t("닫기", "Close")}>
          <X size={18} />
        </button>
      </div>
    </header>
  );
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`book-brand${small ? " is-small" : ""}`}>
      <span className="book-brand-mark" aria-hidden="true">
        <UtensilsCrossed size={small ? 15 : 17} />
      </span>
      supper<span className="book-brand-dot">.</span>
    </span>
  );
}

function Art({ r, size }: { r: Restaurant; size: "card" | "thumb" | "tile" | "hero" }) {
  const Icon = r.icon;
  return (
    <div className={`book-art book-art-${size} book-tone-${r.tone} book-shape-${r.id % 3}`} aria-hidden="true">
      <i className="book-art-table" />
      <span className="book-art-plate">
        <Icon size={size === "thumb" ? 18 : size === "hero" ? 38 : 26} strokeWidth={1.7} />
      </span>
    </div>
  );
}

function StatusTag({ status }: { status: Avail }) {
  const { t } = useI18n();
  const tone = status === "open" ? "success" : status === "few" ? "warning" : "info";
  const label = status === "open" ? t("오늘 예약 가능", "Available today") : status === "few" ? t("마감 임박", "Almost full") : t("웨이팅", "Waitlist");
  return <span className={`book-tag book-${tone}`}>{label}</span>;
}

function ResBadge({ status }: { status: ResStatus }) {
  const { t } = useI18n();
  const map: Record<ResStatus, [string, string]> = {
    confirmed: ["success", t("확정", "Confirmed")],
    pending: ["warning", t("대기", "Pending")],
    cancelled: ["danger", t("취소", "Cancelled")],
    visited: ["info", t("방문 완료", "Visited")],
  };
  return <span className={`book-tag book-${map[status][0]}`}>{map[status][1]}</span>;
}

function Rating({ r }: { r: Restaurant }) {
  const { t } = useI18n();
  return (
    <span className="book-rating" aria-label={t(`평점 ${r.rating}, 리뷰 ${r.reviews.toLocaleString("ko-KR")}개`, `Rated ${r.rating}, ${r.reviews.toLocaleString("en-US")} reviews`)}>
      <Star size={13} fill="currentColor" aria-hidden="true" />
      <strong>{r.rating.toFixed(1)}</strong>
      <small>({r.reviews.toLocaleString("en-US")})</small>
    </span>
  );
}

function SaveButton({ r, saved, onToggle, className = "" }: { r: Restaurant; saved: boolean; onToggle: () => void; className?: string }) {
  const { t, l } = useI18n();
  return (
    <button type="button" className={`book-save ${className}`} aria-pressed={saved} aria-label={saved ? t(`${l(r.name)} 저장 취소`, `Remove ${l(r.name)} from saved`) : t(`${l(r.name)} 저장`, `Save ${l(r.name)}`)} onClick={onToggle}>
      <Heart size={16} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}

function Toast({ notice }: { notice: { id: number; text: string } | null }) {
  return (
    <div className="book-live" role="status" aria-live="polite">
      {notice && (
        <div key={notice.id} className="book-toast">
          <CircleCheck size={16} aria-hidden="true" />
          {notice.text}
        </div>
      )}
    </div>
  );
}

function Empty({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="book-empty">
      <span className="book-empty-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </div>
  );
}

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange: (next: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="book-switch" onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

function PartyStepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const { t, party } = useI18n();
  return (
    <div className="book-stepper" role="group" aria-label={t("인원", "Party size")}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t("인원 줄이기", "Fewer guests")}>
        <Minus size={15} />
      </button>
      <output aria-live="polite">{party(value)}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_PARTY} aria-label={t("인원 늘리기", "More guests")}>
        <Plus size={15} />
      </button>
    </div>
  );
}

function MiniCalendar({ r, value, onChange }: { r: Restaurant; value: number; onChange: (day: number) => void }) {
  const { t, isKo, date } = useI18n();
  const days = Array.from({ length: CAL_DAYS }, (_, index) => CAL_START + index);
  return (
    <fieldset className="book-cal">
      <legend className="book-label">
        <CalendarDays size={14} aria-hidden="true" />
        {t("날짜", "Date")}
        <span className="book-cal-range">{t("2026년 9월 – 10월", "Sep – Oct 2026")}</span>
      </legend>
      <div className="book-cal-week" aria-hidden="true">
        {(isKo ? WD_KO : WD_EN).map((name, index) => (
          <span key={name} className={index === 0 ? "is-sun" : undefined}>{isKo ? name : name.slice(0, 2)}</span>
        ))}
      </div>
      <div className="book-cal-grid">
        {days.map((day) => {
          const past = day < TODAY;
          const closed = !past && isClosed(r, day);
          const p = dayParts(day);
          const state = past ? t("지난 날짜", "past date") : closed ? t("정기 휴무", "closed") : day === TODAY ? t("오늘", "today") : "";
          return (
            <button
              key={day}
              type="button"
              className={`book-cal-day${closed ? " is-closed" : ""}${day === TODAY ? " is-today" : ""}${p.d === 1 ? " is-month" : ""}`}
              disabled={past || closed}
              aria-pressed={value === day}
              aria-label={state ? `${date(day)}, ${state}` : date(day)}
              onClick={() => onChange(day)}
            >
              <span>{p.d === 1 ? (isKo ? `${p.m}/${p.d}` : `${MON_EN[p.m - 1]} 1`) : p.d}</span>
              {closed ? <small>{t("휴무", "Off")}</small> : day === TODAY ? <small>{t("오늘", "Today")}</small> : null}
            </button>
          );
        })}
      </div>
      <p className="book-cal-note">
        <span className="book-dot is-closed" aria-hidden="true" />
        {t(`정기 휴무: 매주 ${WD_KO[r.closed]}요일`, `Closed on ${WD_EN_FULL[r.closed]}s`)}
      </p>
    </fieldset>
  );
}

function SlotPicker({ r, day, party, value, onChange }: { r: Restaurant; day: number; party: number; value: string | null; onChange: (time: string) => void }) {
  const { t, slotText } = useI18n();
  const groups = [
    { id: "lunch", label: t("점심", "Lunch"), times: LUNCH },
    { id: "dinner", label: t("저녁", "Dinner"), times: DINNER },
  ];
  const anyOpen = SLOTS.some((time) => isPickable(slotInfo(r, day, time, party).state));
  return (
    <fieldset className="book-slots">
      <legend className="book-label">
        <Clock size={14} aria-hidden="true" />
        {t("시간", "Time")}
      </legend>
      {groups.map((group) => (
        <div key={group.id} className="book-slot-group">
          <span className="book-slot-group-label">{group.label}</span>
          <div className="book-slot-grid">
            {group.times.map((time) => {
              const info = slotInfo(r, day, time, party);
              const text = slotText(info.state, info.left);
              return (
                <button key={time} type="button" className={`book-slot is-${info.state}`} disabled={!isPickable(info.state)} aria-pressed={value === time} aria-label={`${time}, ${text}`} onClick={() => onChange(time)}>
                  <strong>{time}</strong>
                  <small>{text}</small>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="book-slot-legend" aria-hidden="true">
        <span><i className="book-dot is-open" />{t("여유", "Open")}</span>
        <span><i className="book-dot is-few" />{t("마감 임박", "Few left")}</span>
        <span><i className="book-dot is-full" />{t("마감", "Full")}</span>
      </div>
      {!anyOpen && (
        <p className="book-inline-note book-warning" role="note">
          <CircleAlert size={14} aria-hidden="true" />
          {t("이 날은 남은 자리가 없어요. 다른 날짜를 골라 보세요.", "No tables left on this day. Try another date.")}
        </p>
      )}
    </fieldset>
  );
}

/* ───────────────────────── booking flow ───────────────────────── */

type FlowProps = {
  r: Restaurant;
  initialDay: number;
  initialParty: number;
  initialTime?: string;
  compact?: boolean;
  onBooked: (res: Reservation) => void;
  onFinish: (goTo: "reservations" | "close") => void;
};

function BookingFlow({ r, initialDay, initialParty, initialTime, compact = false, onBooked, onFinish }: FlowProps) {
  const { t, l, isKo, date, party: partyText } = useI18n();
  const [day, setDay] = useState(() => startDay(r, initialDay, initialParty));
  const [party, setParty] = useState(initialParty);
  const [time, setTime] = useState<string | null>(() => {
    const first = startDay(r, initialDay, initialParty);
    return initialTime && isPickable(slotInfo(r, first, initialTime, initialParty).state) ? initialTime : null;
  });
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"pick" | "confirm" | "done">("pick");
  const [name, setName] = useState(() => (isKo ? "김지우" : "Jiwoo Kim"));
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const agreeRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  function changeDay(next: number) {
    setDay(next);
    if (time && !isPickable(slotInfo(r, next, time, party).state)) setTime(null);
  }
  function changeParty(next: number) {
    const value = Math.min(MAX_PARTY, Math.max(1, next));
    setParty(value);
    if (time && !isPickable(slotInfo(r, day, time, value).state)) setTime(null);
  }
  function toggleNote(chip: string) {
    setNote((current) => {
      const parts = current.split(", ").filter(Boolean);
      const next = parts.includes(chip) ? parts.filter((part) => part !== chip) : [...parts, chip];
      return next.join(", ").slice(0, 100);
    });
  }
  const noteParts = note.split(", ");
  const nameError = name.trim().length < 2 ? t("이름을 2자 이상 입력해 주세요.", "Enter a name with at least 2 characters.") : "";
  const phoneError = !/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim()) ? t("휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.", "Enter a mobile number like 010-1234-5678.") : "";
  const agreeError = !agree ? t("예약 정책에 동의해 주세요.", "Please accept the booking policy.") : "";
  const slot = time ? slotInfo(r, day, time, party) : null;
  const willBePending = r.status === "waiting" || slot?.state === "few";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (nameError) return nameRef.current?.focus();
    if (phoneError) return phoneRef.current?.focus();
    if (agreeError) return agreeRef.current?.focus();
    if (!time) return setStep("pick");
    const p = dayParts(day);
    const res: Reservation = { id: `SU-${pad(p.m)}${pad(p.d)}-${time.replace(":", "")}${r.id}`, rid: r.id, day, time, party, status: willBePending ? "pending" : "confirmed", note: note.trim() };
    onBooked(res);
    setResult(res);
    setStep("done");
  }

  const steps = [t("일정 선택", "Pick a time"), t("정보 확인", "Your details"), t("완료", "Done")];
  const stepIndex = step === "pick" ? 0 : step === "confirm" ? 1 : 2;
  const summary = (
    <dl className="book-summary">
      <div><dt>{t("식당", "Restaurant")}</dt><dd>{l(r.name)}</dd></div>
      <div><dt>{t("날짜", "Date")}</dt><dd>{date(day)}</dd></div>
      <div><dt>{t("시간", "Time")}</dt><dd>{time ?? "—"}</dd></div>
      <div><dt>{t("인원", "Party")}</dt><dd>{partyText(party)}</dd></div>
      {note.trim() && <div><dt>{t("요청 사항", "Request")}</dt><dd>{note}</dd></div>}
    </dl>
  );

  return (
    <div className={`book-flow${compact ? " is-compact" : ""}`}>
      <ol className="book-steps" aria-label={t("예약 단계", "Booking steps")}>
        {steps.map((label, index) => (
          <li key={label} className={index < stepIndex ? "is-done" : index === stepIndex ? "is-current" : undefined} aria-current={index === stepIndex ? "step" : undefined}>
            <span aria-hidden="true">{index < stepIndex ? <Check size={11} /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === "pick" && (
        <>
          <MiniCalendar r={r} value={day} onChange={changeDay} />
          <div className="book-flow-row">
            <span className="book-label">
              <Users size={14} aria-hidden="true" />
              {t("인원", "Party size")}
            </span>
            <PartyStepper value={party} onChange={changeParty} />
          </div>
          {party > 4 && <p className="book-hint">{t("5명 이상은 테이블 두 개를 붙여 준비해요.", "Parties of 5+ get two tables joined together.")}</p>}
          <SlotPicker r={r} day={day} party={party} value={time} onChange={setTime} />
          <div className="book-field">
            <label className="book-label" htmlFor={`${fieldId}-note`}>
              <MessageSquareText size={14} aria-hidden="true" />
              {t("요청 사항", "Requests")}
              <span className="book-muted">{t("선택", "Optional")}</span>
            </label>
            <div className="book-note-chips" role="group" aria-label={t("빠른 요청", "Quick requests")}>
              {NOTE_CHIPS.map((chip) => (
                <button key={chip[0]} type="button" className="book-chip is-small" aria-pressed={noteParts.includes(l(chip))} onClick={() => toggleNote(l(chip))}>
                  {l(chip)}
                </button>
              ))}
            </div>
            <textarea id={`${fieldId}-note`} rows={2} maxLength={100} value={note} placeholder={t("매장에 전할 말을 남겨 주세요", "Anything the restaurant should know?")} onChange={(event) => setNote(event.target.value)} />
            <span className="book-counter">{note.length}/100</span>
          </div>
          <div className="book-flow-foot">
            <p className={time ? "book-flow-pick" : "book-hint"}>
              {time ? `${date(day)} · ${time} · ${partyText(party)}` : t("원하는 시간을 골라 주세요.", "Choose a time to continue.")}
            </p>
            <button type="button" className="book-btn book-primary" disabled={!time} onClick={() => { setTried(false); setStep("confirm"); }}>
              {t("다음", "Next")}
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <form className="book-confirm" noValidate onSubmit={submit}>
          {summary}
          {willBePending ? (
            <p className="book-inline-note book-warning">
              <Clock size={14} aria-hidden="true" />
              {t("남은 자리가 적어 매장 확인 후 확정돼요. 보통 30분 안에 알려드려요.", "Few tables left, so the restaurant will confirm. Usually within 30 minutes.")}
            </p>
          ) : (
            <p className="book-inline-note book-success">
              <CircleCheck size={14} aria-hidden="true" />
              {t("바로 확정되는 시간이에요.", "This time is confirmed instantly.")}
            </p>
          )}
          <div className="book-field">
            <label className="book-label" htmlFor={`${fieldId}-name`}>{t("예약자 이름", "Name")}</label>
            <input ref={nameRef} id={`${fieldId}-name`} value={name} maxLength={20} autoComplete="off" onChange={(event) => setName(event.target.value)} aria-invalid={tried && !!nameError} aria-describedby={tried && nameError ? `${fieldId}-name-error` : undefined} />
            {tried && nameError && <p id={`${fieldId}-name-error`} className="book-error">{nameError}</p>}
          </div>
          <div className="book-field">
            <label className="book-label" htmlFor={`${fieldId}-phone`}>{t("휴대폰 번호", "Mobile number")}</label>
            <input ref={phoneRef} id={`${fieldId}-phone`} inputMode="tel" value={phone} maxLength={13} placeholder="010-1234-5678" autoComplete="off" onChange={(event) => setPhone(event.target.value)} aria-invalid={tried && !!phoneError} aria-describedby={tried && phoneError ? `${fieldId}-phone-error` : `${fieldId}-phone-hint`} />
            {tried && phoneError ? <p id={`${fieldId}-phone-error`} className="book-error">{phoneError}</p> : <p id={`${fieldId}-phone-hint`} className="book-hint">{t("예약 확인 문자를 보내 드려요.", "We'll text your confirmation here.")}</p>}
          </div>
          <label className={`book-check${tried && agreeError ? " is-invalid" : ""}`}>
            <input ref={agreeRef} type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} aria-invalid={tried && !!agreeError} aria-describedby={tried && agreeError ? `${fieldId}-agree-error` : undefined} />
            <span>{t("노쇼 시 다음 예약이 제한될 수 있다는 예약 정책에 동의해요.", "I agree that no-shows may limit future bookings.")}</span>
          </label>
          {tried && agreeError && <p id={`${fieldId}-agree-error`} className="book-error">{agreeError}</p>}
          <div className="book-flow-foot">
            <button type="button" className="book-btn book-neutral" onClick={() => setStep("pick")}>
              {t("이전", "Back")}
            </button>
            <button type="submit" className="book-btn book-primary">
              <CalendarCheck size={15} aria-hidden="true" />
              {willBePending ? t("예약 요청하기", "Request booking") : t("예약 확정하기", "Confirm booking")}
            </button>
          </div>
        </form>
      )}

      {step === "done" && result && (
        <div className="book-done">
          <span className={`book-done-icon book-${result.status === "confirmed" ? "success" : "warning"}`} aria-hidden="true">
            {result.status === "confirmed" ? <Check size={26} /> : <Clock size={26} />}
          </span>
          <h3 data-autofocus tabIndex={-1}>{result.status === "confirmed" ? t("예약이 확정됐어요!", "You're booked!") : t("예약을 요청했어요", "Request sent")}</h3>
          <p>{result.status === "confirmed" ? t("방문 하루 전에 알림을 보내 드릴게요.", "We'll remind you the day before.") : t("매장이 확인하면 바로 알려드릴게요.", "We'll tell you as soon as the restaurant confirms.")}</p>
          <div className="book-ticket">
            <span className="book-eyebrow">
              <Ticket size={12} aria-hidden="true" />
              {t("예약 번호", "Booking number")}
            </span>
            <strong>{result.id}</strong>
            {summary}
          </div>
          <div className="book-flow-foot">
            <button type="button" className="book-btn book-neutral" onClick={() => onFinish("close")}>
              {t("닫기", "Close")}
            </button>
            <button type="button" className="book-btn book-primary" onClick={() => onFinish("reservations")}>
              {t("내 예약 보기", "View my bookings")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── restaurant info ───────────────────────── */

function RestaurantHead({ r }: { r: Restaurant }) {
  const { l, km } = useI18n();
  return (
    <div className="book-detail-head">
      <StatusTag status={r.status} />
      <h2>{l(r.name)}</h2>
      <p className="book-meta">
        <MapPin size={12} aria-hidden="true" />
        {l(AREAS[r.area])} · {l(CUISINES[r.cuisine].label)} · {km(r.distance)}
      </p>
      <Rating r={r} />
    </div>
  );
}

function RestaurantInfo({ r }: { r: Restaurant }) {
  const { t, l, money, closedDay, km } = useI18n();
  return (
    <div className="book-info-col">
      <p className="book-blurb">{l(r.blurb)}</p>
      <div className="book-mood-row">
        {r.moods.map((mood) => (
          <span key={mood} className="book-mood">#{l(MOODS[mood])}</span>
        ))}
      </div>
      <dl className="book-facts">
        <div><dt><Clock size={13} aria-hidden="true" />{t("영업시간", "Hours")}</dt><dd>{r.hours}</dd></div>
        <div><dt><CalendarDays size={13} aria-hidden="true" />{t("정기 휴무", "Closed")}</dt><dd>{closedDay(r.closed)}</dd></div>
        <div><dt><Store size={13} aria-hidden="true" />{t("1인 평균", "Avg. per person")}</dt><dd>{money(r.avg)}</dd></div>
        <div><dt><Navigation size={13} aria-hidden="true" />{t("거리", "Distance")}</dt><dd>{l(AREAS[r.area])} · {km(r.distance)}</dd></div>
      </dl>
      <h3 className="book-subhead">{t("대표 메뉴", "Menu highlights")}</h3>
      <ul className="book-menu">
        {r.menu.map((item, index) => (
          <li key={item.name[0]}>
            <span className={`book-menu-mark book-tone-${(r.tone + index) % 6}`} aria-hidden="true" />
            <span>{l(item.name)}</span>
            <strong>{money(item.price)}</strong>
          </li>
        ))}
      </ul>
      <h3 className="book-subhead">{t("최근 리뷰", "Recent reviews")}</h3>
      <ul className="book-reviews">
        {REVIEWS.map((review) => (
          <li key={review.name[0]}>
            <div className="book-between">
              <strong>{l(review.name)}</strong>
              <span className="book-stars-sm" aria-label={t(`별점 ${review.rating}점`, `${review.rating} stars`)}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={11} fill={index < review.rating ? "currentColor" : "none"} aria-hidden="true" />
                ))}
              </span>
            </div>
            <p>{l(review.text)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── reservations ───────────────────────── */

function ReservationList({ reservations, compact = false, onCancel, onReview, onOpen, onExplore }: {
  reservations: Reservation[];
  compact?: boolean;
  onCancel: (res: Reservation) => void;
  onReview: (res: Reservation) => void;
  onOpen: (rid: number) => void;
  onExplore: () => void;
}) {
  const { t, l, date, party } = useI18n();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const id = useId();
  const upcoming = reservations.filter((x) => x.status === "confirmed" || x.status === "pending").sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  const past = reservations.filter((x) => x.status === "visited" || x.status === "cancelled").sort((a, b) => b.day - a.day);
  const list = tab === "upcoming" ? upcoming : past;
  const tabs = [
    { id: "upcoming" as const, label: t("다가오는 예약", "Upcoming"), count: upcoming.length },
    { id: "past" as const, label: t("지난 예약", "Past"), count: past.length },
  ];
  function onTabKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = tab === "upcoming" ? "past" : "upcoming";
    setTab(next);
    event.currentTarget.querySelector<HTMLElement>(`#${CSS.escape(`${id}-${next}`)}`)?.focus();
  }
  return (
    <div className={`book-res-wrap${compact ? " is-compact" : ""}`}>
      <div className="book-tabs" role="tablist" aria-label={t("예약 구분", "Booking filter")} onKeyDown={onTabKey}>
        {tabs.map((item) => (
          <button key={item.id} id={`${id}-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`${id}-panel`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)}>
            {item.label}
            <span className="book-count">{item.count}</span>
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="book-res-list">
        {list.length === 0 ? (
          tab === "upcoming" ? (
            <Empty icon={CalendarDays} title={t("다가오는 예약이 없어요", "No upcoming bookings")} body={t("마음에 드는 식당을 찾아 자리를 잡아 보세요.", "Find a place you like and grab a table.")} action={<button type="button" className="book-btn book-secondary" onClick={onExplore}>{t("식당 둘러보기", "Browse restaurants")}</button>} />
          ) : (
            <Empty icon={Clock} title={t("지난 예약이 없어요", "No past bookings")} body={t("방문을 마치면 이곳에 기록이 남아요.", "Your visits will show up here.")} />
          )
        ) : (
          list.map((res) => {
            const r = byId(res.rid);
            return (
              <article key={res.id} className={`book-res is-${res.status}`}>
                <Art r={r} size="thumb" />
                <div className="book-res-body">
                  <div className="book-between">
                    <h3>{l(r.name)}</h3>
                    <ResBadge status={res.status} />
                  </div>
                  <p className="book-res-when">
                    <CalendarDays size={12} aria-hidden="true" />
                    {date(res.day)} · {res.time} · {party(res.party)}
                  </p>
                  <p className="book-res-code">
                    {t("예약 번호", "Booking no.")} {res.id}
                    {res.note && ` · ${typeof res.note === "string" ? res.note : l(res.note)}`}
                  </p>
                  {res.status === "pending" && (
                    <p className="book-inline-note book-warning">
                      <Clock size={13} aria-hidden="true" />
                      {t("매장에서 자리를 확인하고 있어요.", "The restaurant is checking availability.")}
                    </p>
                  )}
                  <div className="book-res-actions">
                    {(res.status === "confirmed" || res.status === "pending") && (
                      <>
                        <button type="button" className="book-btn is-sm book-neutral" onClick={() => onOpen(r.id)}>{t("매장 정보", "Restaurant info")}</button>
                        <button type="button" className="book-btn is-sm book-danger-ghost" onClick={() => onCancel(res)}>{t("예약 취소", "Cancel")}</button>
                      </>
                    )}
                    {res.status === "visited" && (res.review ? (
                      <span className="book-reviewed">
                        <Star size={12} fill="currentColor" aria-hidden="true" />
                        {t(`${res.review}점 · 리뷰 작성 완료`, `${res.review} stars · Reviewed`)}
                      </span>
                    ) : (
                      <button type="button" className="book-btn is-sm book-secondary" onClick={() => onReview(res)}>
                        <Star size={13} aria-hidden="true" />
                        {t("리뷰 쓰기", "Write a review")}
                      </button>
                    ))}
                    {(res.status === "visited" || res.status === "cancelled") && (
                      <button type="button" className="book-btn is-sm book-neutral" onClick={() => onOpen(r.id)}>{t("다시 예약", "Book again")}</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function CancelDialog({ res, onClose, onConfirm, sheet = false }: { res: Reservation; onClose: () => void; onConfirm: () => void; sheet?: boolean }) {
  const { t, l, date, party } = useI18n();
  const r = byId(res.rid);
  return (
    <Layer kind={sheet ? "sheet" : "modal"} label={t("예약 취소", "Cancel booking")} onClose={onClose} className="is-narrow">
      {sheet && <span className="book-handle" aria-hidden="true" />}
      <DialogHead eyebrow={l(r.name)} title={t("예약을 취소할까요?", "Cancel this booking?")} onClose={onClose} />
      <p className="book-dialog-body">{date(res.day)} · {res.time} · {party(res.party)}</p>
      <p className="book-inline-note book-danger" role="alert">
        <CircleAlert size={14} aria-hidden="true" />
        {res.day === TODAY ? t("당일 취소는 노쇼로 기록될 수 있어요.", "Same-day cancellations may count as a no-show.") : t("취소한 예약은 되돌릴 수 없어요. 같은 시간이 다시 비어 있다는 보장도 없어요.", "This can't be undone, and the same time may not be free again.")}
      </p>
      <div className="book-flow-foot">
        <button type="button" className="book-btn book-neutral" onClick={onClose} data-autofocus>{t("유지하기", "Keep it")}</button>
        <button type="button" className="book-btn book-danger-solid" onClick={onConfirm}>{t("예약 취소", "Cancel booking")}</button>
      </div>
    </Layer>
  );
}

function ReviewDialog({ res, onClose, onSubmit, sheet = false }: { res: Reservation; onClose: () => void; onSubmit: (rating: number) => void; sheet?: boolean }) {
  const { t, l, date } = useI18n();
  const r = byId(res.rid);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const groupRef = useRef<HTMLDivElement>(null);
  const textId = useId();
  function onStarKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = Math.min(5, Math.max(1, (rating || (delta > 0 ? 0 : 6)) + delta));
    setRating(next);
    groupRef.current?.querySelectorAll<HTMLElement>("[role=radio]")[next - 1]?.focus();
  }
  return (
    <Layer kind={sheet ? "sheet" : "modal"} label={t("리뷰 쓰기", "Write a review")} onClose={onClose} className="is-narrow">
      {sheet && <span className="book-handle" aria-hidden="true" />}
      <DialogHead eyebrow={`${l(r.name)} · ${date(res.day)}`} title={t("방문은 어떠셨나요?", "How was your visit?")} onClose={onClose} />
      <form onSubmit={(event) => { event.preventDefault(); if (rating) onSubmit(rating); }}>
        <div className="book-stars" role="radiogroup" aria-label={t("별점", "Star rating")} ref={groupRef} onKeyDown={onStarKey}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={t(`${value}점`, `${value} star${value > 1 ? "s" : ""}`)} tabIndex={(rating || 1) === value ? 0 : -1} className={value <= rating ? "is-on" : undefined} onClick={() => setRating(value)}>
              <Star size={28} fill={value <= rating ? "currentColor" : "none"} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="book-stars-word" aria-live="polite">{l(RATING_WORDS[rating])}</p>
        <div className="book-note-chips" role="group" aria-label={t("키워드", "Keywords")}>
          {REVIEW_TAGS.map((tag) => {
            const on = tags.includes(tag[0]);
            return (
              <button key={tag[0]} type="button" className="book-chip is-small" aria-pressed={on} onClick={() => setTags((list) => (on ? list.filter((x) => x !== tag[0]) : [...list, tag[0]]))}>
                {l(tag)}
              </button>
            );
          })}
        </div>
        <div className="book-field">
          <label className="book-label" htmlFor={textId}>{t("후기", "Your review")} <span className="book-muted">{t("선택", "Optional")}</span></label>
          <textarea id={textId} rows={3} maxLength={300} value={text} placeholder={t("음식, 서비스, 분위기는 어땠나요?", "How were the food, service and atmosphere?")} onChange={(event) => setText(event.target.value)} />
          <span className="book-counter">{text.length}/300</span>
        </div>
        <div className="book-flow-foot">
          <button type="button" className="book-btn book-neutral" onClick={onClose}>{t("나중에", "Later")}</button>
          <button type="submit" className="book-btn book-primary" disabled={!rating}>{t("리뷰 남기기", "Post review")}</button>
        </div>
      </form>
    </Layer>
  );
}

/* ───────────────────────── web ───────────────────────── */

type WebView = "explore" | "reservations" | "saved";

function RestaurantCard({ r, day, party, period, saved, onToggleSave, onOpen }: { r: Restaurant; day: number; party: number; period: Period; saved: boolean; onToggleSave: () => void; onOpen: (time?: string) => void }) {
  const { t, l, money, km, date } = useI18n();
  const slots = availableSlots(r, day, period, party).slice(0, 3);
  return (
    <article className="book-card">
      <div className="book-card-media">
        <Art r={r} size="card" />
        <StatusTag status={r.status} />
        <SaveButton r={r} saved={saved} onToggle={onToggleSave} />
      </div>
      <div className="book-card-body">
        <h3>
          <button type="button" className="book-card-link" onClick={() => onOpen()}>{l(r.name)}</button>
        </h3>
        <p className="book-meta">
          <MapPin size={12} aria-hidden="true" />
          {l(AREAS[r.area])} · {l(CUISINES[r.cuisine].label)} · {km(r.distance)}
        </p>
        <div className="book-between">
          <Rating r={r} />
          <span className="book-price">{money(r.avg)}<small>{t(" / 1인", " / person")}</small></span>
        </div>
        <div className="book-card-slots" role="group" aria-label={t(`${date(day)} 빈 시간`, `Open times on ${date(day)}`)}>
          {slots.length ? slots.map((time) => {
            const info = slotInfo(r, day, time, party);
            return (
              <button key={time} type="button" className={`book-chip-slot is-${info.state}`} onClick={() => onOpen(time)} aria-label={t(`${time} 예약하기`, `Book ${time}`)}>
                {time}
              </button>
            );
          }) : <span className="book-muted">{t("선택한 조건에 빈 시간이 없어요", "No open times for these filters")}</span>}
        </div>
      </div>
    </article>
  );
}

export function BookingWeb() {
  const i18n = useI18n();
  const { t, l, relDay, party: partyText, date } = i18n;
  const data = useBookingData();
  const [view, setView] = useState<WebView>("explore");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [detail, setDetail] = useState<{ rid: number; time?: string; nonce: number } | null>(null);
  const [dialog, setDialog] = useState<{ type: "cancel" | "review"; res: Reservation } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const patch = (next: Partial<Filters>) => setFilters((current) => ({ ...current, ...next }));
  const { list, hiddenClosed } = filterRestaurants(filters);
  const savedList = RESTAURANTS.filter((r) => data.saved.includes(r.id));
  const layerOpen = detail !== null || dialog !== null;
  const nextRes = data.upcoming[0];

  function go(next: WebView) {
    setView(next);
    setMenuOpen(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }
  function open(rid: number, time?: string) {
    setDetail((current) => ({ rid, time, nonce: (current?.nonce ?? 0) + 1 }));
  }

  const nav = [
    { id: "explore" as const, label: t("둘러보기", "Explore"), count: 0 },
    { id: "reservations" as const, label: t("내 예약", "My bookings"), count: data.upcoming.length },
    { id: "saved" as const, label: t("저장함", "Saved"), count: data.saved.length },
  ];

  const cards = (items: Restaurant[]) => (
    <div className="book-grid">
      {items.map((r) => (
        <RestaurantCard key={r.id} r={r} day={filters.day} party={filters.party} period={filters.period} saved={data.saved.includes(r.id)} onToggleSave={() => data.toggleSave(r)} onOpen={(time) => open(r.id, time)} />
      ))}
    </div>
  );

  const explore = (
    <>
      <section className="book-hero">
        <div className="book-hero-copy">
          <span className="book-eyebrow">TABLE FOR TONIGHT</span>
          <h1>{t("오늘 저녁, 어디서 만날까요?", "Where shall we meet tonight?")}</h1>
          <p>{t("동네 식당과 카페의 빈자리를 실시간으로 확인하고 바로 예약하세요.", "See real-time openings at neighborhood restaurants and cafés, then book in a tap.")}</p>
        </div>
        <form className="book-search" role="search" aria-label={t("식당 찾기", "Find a restaurant")} onSubmit={(event) => { event.preventDefault(); data.toast(t(`조건에 맞는 ${list.length}곳을 찾았어요.`, `Found ${list.length} places for you.`)); }}>
          <label className="book-search-field">
            <span><MapPin size={13} aria-hidden="true" />{t("지역", "Area")}</span>
            <select value={filters.area} onChange={(event) => patch({ area: event.target.value as Filters["area"] })}>
              <option value="all">{t("서울 전체", "All of Seoul")}</option>
              {AREA_ORDER.map((area) => <option key={area} value={area}>{l(AREAS[area])}</option>)}
            </select>
          </label>
          <label className="book-search-field">
            <span><CalendarDays size={13} aria-hidden="true" />{t("날짜", "Date")}</span>
            <select value={filters.day} onChange={(event) => patch({ day: Number(event.target.value) })}>
              {Array.from({ length: CAL_END - TODAY + 1 }, (_, index) => TODAY + index).map((day) => <option key={day} value={day}>{relDay(day)}</option>)}
            </select>
          </label>
          <label className="book-search-field">
            <span><Users size={13} aria-hidden="true" />{t("인원", "Guests")}</span>
            <select value={filters.party} onChange={(event) => patch({ party: Number(event.target.value) })}>
              {Array.from({ length: MAX_PARTY }, (_, index) => index + 1).map((n) => <option key={n} value={n}>{partyText(n)}</option>)}
            </select>
          </label>
          <label className="book-search-field">
            <span><Clock size={13} aria-hidden="true" />{t("시간", "Time")}</span>
            <select value={filters.period} onChange={(event) => patch({ period: event.target.value as Period })}>
              <option value="any">{t("상관없음", "Any time")}</option>
              <option value="lunch">{t("점심 11:30–13:30", "Lunch 11:30–13:30")}</option>
              <option value="dinner">{t("저녁 17:30–20:30", "Dinner 17:30–20:30")}</option>
            </select>
          </label>
          <label className="book-search-field is-query">
            <span><Search size={13} aria-hidden="true" />{t("검색어", "Keyword")}</span>
            <input value={filters.query} placeholder={t("식당 이름이나 메뉴", "Restaurant or dish")} onChange={(event) => patch({ query: event.target.value })} />
          </label>
          <button type="submit" className="book-btn book-primary book-search-btn">
            <Search size={15} aria-hidden="true" />
            {t("찾기", "Search")}
          </button>
        </form>
      </section>

      <div className="book-chips" role="group" aria-label={t("음식 종류", "Cuisine")}>
        <button type="button" className="book-chip" aria-pressed={filters.cuisine === "all"} onClick={() => patch({ cuisine: "all" })}>
          <UtensilsCrossed size={14} aria-hidden="true" />
          {t("전체", "All")}
        </button>
        {CUISINE_ORDER.map((cuisine) => {
          const Icon = CUISINES[cuisine].icon;
          return (
            <button key={cuisine} type="button" className="book-chip" aria-pressed={filters.cuisine === cuisine} onClick={() => patch({ cuisine })}>
              <Icon size={14} aria-hidden="true" />
              {l(CUISINES[cuisine].label)}
            </button>
          );
        })}
      </div>

      <div className="book-toolbar">
        <div className="book-moods" role="group" aria-label={t("분위기", "Mood")}>
          <SlidersHorizontal size={14} aria-hidden="true" />
          {MOOD_ORDER.map((mood) => {
            const on = filters.moods.includes(mood);
            return (
              <button key={mood} type="button" className="book-chip is-small" aria-pressed={on} onClick={() => patch({ moods: on ? filters.moods.filter((m) => m !== mood) : [...filters.moods, mood] })}>
                {on && <Check size={12} aria-hidden="true" />}
                {l(MOODS[mood])}
              </button>
            );
          })}
        </div>
        <div className="book-inline">
          <span className="book-toggle">
            <Switch checked={filters.onlyAvailable} label={t("예약 가능한 곳만", "Only places with tables")} onChange={(next) => patch({ onlyAvailable: next })} />
            <span aria-hidden="true">{t("예약 가능만", "Available only")}</span>
          </span>
          <label className="book-sort">
            <span className="book-sr">{t("정렬", "Sort")}</span>
            <select value={filters.sort} onChange={(event) => patch({ sort: event.target.value as Sort })}>
              {SORTS.map((sort) => <option key={sort.id} value={sort.id}>{l(sort.label)}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </div>
      </div>

      <p className="book-result">
        <strong>{t(`${list.length}곳`, `${list.length} places`)}</strong>
        <span>{relDay(filters.day)} · {partyText(filters.party)}</span>
        {hiddenClosed > 0 && <span className="book-muted">{t(`· 휴무인 ${hiddenClosed}곳은 숨겼어요`, `· ${hiddenClosed} closed that day hidden`)}</span>}
      </p>

      {list.length ? cards(list) : (
        <Empty icon={SearchX} title={t("조건에 맞는 식당이 없어요", "No restaurants match")} body={t("필터를 줄이거나 다른 날짜를 골라 보세요.", "Try fewer filters or another date.")} action={<button type="button" className="book-btn book-secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>{t("필터 초기화", "Reset filters")}</button>} />
      )}
    </>
  );

  const reservations = (
    <>
      <div className="book-page-head">
        <span className="book-eyebrow">MY TABLES</span>
        <h1>{t("내 예약", "My bookings")}</h1>
        <p>{t("다가오는 예약을 확인하고, 다녀온 곳에는 리뷰를 남겨 주세요.", "Check upcoming tables and review the places you've been.")}</p>
      </div>
      <div className="book-two">
        <ReservationList reservations={data.reservations} onCancel={(res) => setDialog({ type: "cancel", res })} onReview={(res) => setDialog({ type: "review", res })} onOpen={(rid) => open(rid)} onExplore={() => go("explore")} />
        <aside className="book-aside">
          {nextRes ? (
            <section className="book-next">
              <span className="book-eyebrow">{t("다음 예약", "NEXT UP")}</span>
              <strong>{l(byId(nextRes.rid).name)}</strong>
              <p>{date(nextRes.day)} · {nextRes.time}</p>
              <span className="book-next-count">{t(`${nextRes.day - TODAY}일 남았어요`, `In ${nextRes.day - TODAY} days`)}</span>
            </section>
          ) : null}
          <section className="book-policy">
            <h2>{t("예약 안내", "Good to know")}</h2>
            <ul>
              <li><CircleCheck size={14} aria-hidden="true" />{t("방문 하루 전까지 무료로 취소할 수 있어요.", "Free cancellation up to a day before.")}</li>
              <li><Clock size={14} aria-hidden="true" />{t("대기 예약은 보통 30분 안에 확정돼요.", "Pending bookings usually confirm within 30 min.")}</li>
              <li><CircleAlert size={14} aria-hidden="true" />{t("노쇼가 2회 쌓이면 30일간 예약이 제한돼요.", "Two no-shows pause booking for 30 days.")}</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );

  const saved = (
    <>
      <div className="book-page-head">
        <span className="book-eyebrow">SAVED</span>
        <h1>{t("저장함", "Saved")}</h1>
        <p>{t("가고 싶은 곳을 모아 두고, 빈자리가 나면 바로 예약하세요.", "Keep the places you want to try and book when a table opens.")}</p>
      </div>
      {savedList.length ? cards(savedList) : (
        <Empty icon={Heart} title={t("저장한 식당이 없어요", "Nothing saved yet")} body={t("하트를 눌러 가고 싶은 곳을 모아 보세요.", "Tap the heart on any restaurant to keep it here.")} action={<button type="button" className="book-btn book-secondary" onClick={() => go("explore")}>{t("식당 둘러보기", "Browse restaurants")}</button>} />
      )}
    </>
  );

  const detailR = detail ? byId(detail.rid) : null;

  return (
    <div className="book book-web">
      <IntroViewport>
        <div className="book-shell">
          <header className="book-header" inert={layerOpen}>
            <Brand />
            <nav className="book-nav" aria-label={t("주요 메뉴", "Main menu")}>
              {nav.map((item) => (
                <button key={item.id} type="button" aria-current={view === item.id ? "page" : undefined} onClick={() => go(item.id)}>
                  {item.label}
                  {item.count > 0 && <span className="book-count">{item.count}</span>}
                </button>
              ))}
            </nav>
            <div className="book-header-tools">
              <label className="book-area">
                <MapPin size={14} aria-hidden="true" />
                <span className="book-sr">{t("지역 선택", "Choose area")}</span>
                <select value={filters.area} onChange={(event) => patch({ area: event.target.value as Filters["area"] })}>
                  <option value="all">{t("서울 전체", "All of Seoul")}</option>
                  {AREA_ORDER.map((area) => <option key={area} value={area}>{l(AREAS[area])}</option>)}
                </select>
                <ChevronDown size={13} aria-hidden="true" />
              </label>
              <button type="button" className="book-icon-btn book-bell" aria-label={t("알림", "Notifications")} onClick={() => data.toast(nextRes ? t(`${date(nextRes.day)} ${l(byId(nextRes.rid).name)} 예약이 다가와요.`, `Coming up: ${l(byId(nextRes.rid).name)} on ${date(nextRes.day)}.`) : t("새 알림이 없어요.", "No new notifications."))}>
                <Bell size={18} />
                {nextRes && <i />}
              </button>
              <div className="book-profile">
                <button type="button" className="book-profile-btn" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
                  <span className="book-avatar" aria-hidden="true">J</span>
                  <span>{t("지우", "Jiwoo")}</span>
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
                {menuOpen && (
                  <div className="book-menu-pop" role="menu" aria-label={t("내 계정", "My account")} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }}>
                    <button type="button" role="menuitem" onClick={() => go("reservations")}><CalendarCheck size={14} aria-hidden="true" />{t("내 예약", "My bookings")}</button>
                    <button type="button" role="menuitem" onClick={() => go("saved")}><Heart size={14} aria-hidden="true" />{t("저장함", "Saved")}</button>
                    <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); data.toast(t("알림 설정은 앱에서 바꿀 수 있어요.", "You can change alerts in the app.")); }}><Bell size={14} aria-hidden="true" />{t("알림 설정", "Alert settings")}</button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="book-scroll" ref={scrollRef} inert={layerOpen}>
            <main className="book-main">
              {view === "explore" && explore}
              {view === "reservations" && reservations}
              {view === "saved" && saved}
              <footer className="book-footer">
                <span><Check size={12} aria-hidden="true" />{t("예약 정보는 이 프리뷰 안에서만 저장돼요", "Bookings stay inside this preview")}</span>
                <span>{t("© supper. 좋은 한 끼를 위한 자리", "© supper. A seat for a good meal")}</span>
              </footer>
            </main>
          </div>

          {detail && detailR && (
            <Layer kind="modal" label={l(detailR.name)} onClose={() => setDetail(null)} className="is-wide" inert={dialog !== null}>
              <DialogHead eyebrow="SUPPER." title={l(detailR.name)} onClose={() => setDetail(null)}>
                <SaveButton r={detailR} saved={data.saved.includes(detailR.id)} onToggle={() => data.toggleSave(detailR)} className="is-plain" />
              </DialogHead>
              <div className="book-detail">
                <section className="book-detail-info" aria-label={t("식당 정보", "Restaurant info")}>
                  <Art r={detailR} size="hero" />
                  <RestaurantHead r={detailR} />
                  <RestaurantInfo r={detailR} />
                </section>
                <section className="book-detail-book" aria-label={t("예약하기", "Book a table")}>
                  <BookingFlow
                    key={detail.nonce}
                    r={detailR}
                    initialDay={filters.day}
                    initialParty={filters.party}
                    initialTime={detail.time}
                    onBooked={data.book}
                    onFinish={(goTo) => { setDetail(null); if (goTo === "reservations") go("reservations"); }}
                  />
                </section>
              </div>
            </Layer>
          )}
          {dialog?.type === "cancel" && <CancelDialog res={dialog.res} onClose={() => setDialog(null)} onConfirm={() => { data.cancel(dialog.res.id); setDialog(null); }} />}
          {dialog?.type === "review" && <ReviewDialog res={dialog.res} onClose={() => setDialog(null)} onSubmit={(rating) => { data.review(dialog.res.id, rating); setDialog(null); }} />}
          <Toast notice={data.notice} />
        </div>
      </IntroViewport>
    </div>
  );
}

/* ───────────────────────── app ───────────────────────── */

type AppTab = "home" | "map" | "reservations" | "saved" | "my";

function RestaurantRow({ r, saved, onToggleSave, onOpen }: { r: Restaurant; saved: boolean; onToggleSave: () => void; onOpen: () => void }) {
  const { t, l, money, km } = useI18n();
  return (
    <article className="book-row">
      <button type="button" className="book-row-main" onClick={onOpen}>
        <Art r={r} size="thumb" />
        <span className="book-row-copy">
          <strong>{l(r.name)}</strong>
          <small>{l(AREAS[r.area])} · {l(CUISINES[r.cuisine].label)} · {km(r.distance)}</small>
          <span className="book-row-meta">
            <Rating r={r} />
            <span className="book-price">{money(r.avg)}<small>{t("/1인", "/pp")}</small></span>
          </span>
          <StatusTag status={r.status} />
        </span>
      </button>
      <SaveButton r={r} saved={saved} onToggle={onToggleSave} className="is-plain" />
    </article>
  );
}

export function BookingApp() {
  const { t, l, money, date, km, slotText } = useI18n();
  const data = useBookingData();
  const [tab, setTab] = useState<AppTab>("home");
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine | "all">("all");
  const [mapArea, setMapArea] = useState<Area | "all">("all");
  const [mapPick, setMapPick] = useState<number | null>(3);
  const [detail, setDetail] = useState<number | null>(null);
  const [sheet, setSheet] = useState<{ time?: string; nonce: number } | null>(null);
  const [dialog, setDialog] = useState<{ type: "cancel" | "review"; res: Reservation } | null>(null);
  const [prefs, setPrefs] = useState({ remind: true, openings: false, marketing: false });
  const rootRef = useRef<HTMLDivElement>(null);
  const layerOpen = detail !== null || sheet !== null || dialog !== null;
  const { list } = filterRestaurants({ ...DEFAULT_FILTERS, period: "any", query, cuisine, sort: "distance" });
  const nowOpen = RESTAURANTS.filter((r) => r.status !== "waiting" && availableSlots(r, TODAY, "dinner", 2).length > 0);
  const mapList = RESTAURANTS.filter((r) => mapArea === "all" || r.area === mapArea);
  const picked = mapPick !== null ? byId(mapPick) : null;
  const detailR = detail !== null ? byId(detail) : null;
  const visited = data.reservations.filter((x) => x.status === "visited").length;
  const reviewed = data.reservations.filter((x) => x.review).length;

  function switchTab(next: AppTab) {
    setTab(next);
    const scroller = rootRef.current?.closest(".phone-scroll");
    if (scroller) scroller.scrollTop = 0;
  }
  function openDetail(rid: number, time?: string) {
    setDetail(rid);
    if (time) setSheet((current) => ({ time, nonce: (current?.nonce ?? 0) + 1 }));
  }
  function openSheet(time?: string) {
    setSheet((current) => ({ time, nonce: (current?.nonce ?? 0) + 1 }));
  }
  const row = (r: Restaurant) => <RestaurantRow key={r.id} r={r} saved={data.saved.includes(r.id)} onToggleSave={() => data.toggleSave(r)} onOpen={() => openDetail(r.id)} />;

  const tabs: { id: AppTab; label: string; icon: LucideIcon }[] = [
    { id: "home", label: t("홈", "Home"), icon: House },
    { id: "map", label: t("지도", "Map"), icon: MapIcon },
    { id: "reservations", label: t("예약", "Bookings"), icon: CalendarCheck },
    { id: "saved", label: t("저장", "Saved"), icon: Heart },
    { id: "my", label: t("마이", "Me"), icon: CircleUser },
  ];

  const home = (
    <>
      <header className="book-app-top">
        <Brand small />
        <button type="button" className="book-icon-btn book-bell" aria-label={t("알림", "Notifications")} onClick={() => data.toast(data.upcoming[0] ? t(`${date(data.upcoming[0].day)} 예약이 다가와요.`, `Your table on ${date(data.upcoming[0].day)} is coming up.`) : t("새 알림이 없어요.", "No new notifications."))}>
          <Bell size={18} />
          {data.upcoming.length > 0 && <i />}
        </button>
      </header>
      <div className="book-app-greet">
        <h1>{t("지우님, 오늘은 어디서 먹을까요?", "Where to tonight, Jiwoo?")}</h1>
        <p>{t(`${date(TODAY)} · 성수 근처`, `${date(TODAY)} · near Seongsu`)}</p>
      </div>
      <label className="book-pill">
        <Search size={16} aria-hidden="true" />
        <span className="book-sr">{t("식당 검색", "Search restaurants")}</span>
        <input value={query} placeholder={t("식당, 메뉴, 지역 검색", "Search places or dishes")} onChange={(event) => setQuery(event.target.value)} />
        {query && (
          <button type="button" className="book-pill-clear" aria-label={t("검색어 지우기", "Clear search")} onClick={() => setQuery("")}>
            <X size={14} />
          </button>
        )}
      </label>
      <div className="book-app-chips" role="group" aria-label={t("음식 종류", "Cuisine")}>
        <button type="button" className="book-chip" aria-pressed={cuisine === "all"} onClick={() => setCuisine("all")}>{t("전체", "All")}</button>
        {CUISINE_ORDER.map((item) => {
          const Icon = CUISINES[item].icon;
          return (
            <button key={item} type="button" className="book-chip" aria-pressed={cuisine === item} onClick={() => setCuisine(item)}>
              <Icon size={13} aria-hidden="true" />
              {l(CUISINES[item].label)}
            </button>
          );
        })}
      </div>
      {!query && cuisine === "all" && (
        <section className="book-app-section">
          <div className="book-app-section-head">
            <h2>{t("지금 예약 가능", "Open right now")}</h2>
            <span>{t("오늘 저녁 · 2명", "Tonight · 2 guests")}</span>
          </div>
          <ul className="book-scroller">
            {nowOpen.map((r) => {
              const next = availableSlots(r, TODAY, "dinner", 2)[0];
              return (
                <li key={r.id}>
                  <button type="button" className="book-tile" onClick={() => openDetail(r.id, next)} aria-label={t(`${l(r.name)}, 오늘 ${next} 예약하기`, `${l(r.name)}, book today at ${next}`)}>
                    <Art r={r} size="tile" />
                    <strong>{l(r.name)}</strong>
                    <small>{l(AREAS[r.area])} · {l(CUISINES[r.cuisine].label)}</small>
                    <span className={`book-chip-slot is-${slotInfo(r, TODAY, next, 2).state}`}>{next}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <section className="book-app-section">
        <div className="book-app-section-head">
          <h2>{query || cuisine !== "all" ? t(`검색 결과 ${list.length}곳`, `${list.length} results`) : t("내 주변 식당", "Near you")}</h2>
          <span>{t("가까운순", "Nearest first")}</span>
        </div>
        {list.length ? <div className="book-rows">{list.map(row)}</div> : (
          <Empty icon={SearchX} title={t("찾는 식당이 없어요", "Nothing found")} body={t("다른 검색어나 음식 종류를 골라 보세요.", "Try another keyword or cuisine.")} action={<button type="button" className="book-btn book-secondary" onClick={() => { setQuery(""); setCuisine("all"); }}>{t("초기화", "Reset")}</button>} />
        )}
      </section>
    </>
  );

  const map = (
    <>
      <header className="book-app-top">
        <h1>{t("지도", "Map")}</h1>
        <button type="button" className="book-icon-btn" aria-label={t("내 위치로", "Go to my location")} onClick={() => { setMapArea("seongsu"); setMapPick(1); data.toast(t("현재 위치 근처를 보여 드려요.", "Showing places near you.")); }}>
          <LocateFixed size={18} />
        </button>
      </header>
      <div className="book-app-chips" role="group" aria-label={t("지역", "Area")}>
        <button type="button" className="book-chip" aria-pressed={mapArea === "all"} onClick={() => setMapArea("all")}>{t("전체", "All")}</button>
        {AREA_ORDER.map((area) => (
          <button key={area} type="button" className="book-chip" aria-pressed={mapArea === area} onClick={() => { setMapArea(area); setMapPick(RESTAURANTS.find((r) => r.area === area)?.id ?? null); }}>
            {l(AREAS[area])}
          </button>
        ))}
      </div>
      <div className="book-map" role="group" aria-label={t("식당 지도", "Restaurant map")}>
        <span className="book-map-park is-a" aria-hidden="true" />
        <span className="book-map-park is-b" aria-hidden="true" />
        <span className="book-map-road is-a" aria-hidden="true" />
        <span className="book-map-road is-b" aria-hidden="true" />
        <span className="book-map-road is-c" aria-hidden="true" />
        <span className="book-map-river" aria-hidden="true" />
        {AREA_ORDER.map((area) => (
          <span key={area} className={`book-map-label${mapArea === area ? " is-on" : ""}`} style={{ left: `${AREA_LABEL_POS[area][0]}%`, top: `${AREA_LABEL_POS[area][1]}%` }} aria-hidden="true">{l(AREAS[area])}</span>
        ))}
        <span className="book-map-me" style={{ left: "68%", top: "50%" }} aria-hidden="true" />
        {RESTAURANTS.map((r) => {
          const Icon = r.icon;
          const dim = mapArea !== "all" && r.area !== mapArea;
          return (
            <button key={r.id} type="button" className={`book-pin book-tone-${r.tone}${mapPick === r.id ? " is-on" : ""}${dim ? " is-dim" : ""}`} style={{ left: `${r.pin[0]}%`, top: `${r.pin[1]}%` }} aria-pressed={mapPick === r.id} aria-label={`${l(r.name)}, ${l(AREAS[r.area])}`} onClick={() => setMapPick(r.id)}>
              <Icon size={14} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {picked && (
        <article className="book-map-card" aria-live="polite">
          <Art r={picked} size="thumb" />
          <div className="book-min">
            <div className="book-between">
              <strong>{l(picked.name)}</strong>
              <StatusTag status={picked.status} />
            </div>
            <small>{l(AREAS[picked.area])} · {l(CUISINES[picked.cuisine].label)} · {km(picked.distance)}</small>
            <div className="book-between">
              <Rating r={picked} />
              <button type="button" className="book-btn is-sm book-primary" onClick={() => openDetail(picked.id)}>
                {t("상세 보기", "View")}
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        </article>
      )}
      <section className="book-app-section">
        <div className="book-app-section-head">
          <h2>{mapArea === "all" ? t(`지도 안 식당 ${mapList.length}곳`, `${mapList.length} places on the map`) : t(`${l(AREAS[mapArea])} ${mapList.length}곳`, `${mapList.length} in ${l(AREAS[mapArea])}`)}</h2>
        </div>
        <div className="book-rows">{mapList.map(row)}</div>
      </section>
    </>
  );

  const reservations = (
    <>
      <header className="book-app-top">
        <h1>{t("내 예약", "My bookings")}</h1>
      </header>
      <ReservationList compact reservations={data.reservations} onCancel={(res) => setDialog({ type: "cancel", res })} onReview={(res) => setDialog({ type: "review", res })} onOpen={(rid) => openDetail(rid)} onExplore={() => switchTab("home")} />
    </>
  );

  const savedList = RESTAURANTS.filter((r) => data.saved.includes(r.id));
  const saved = (
    <>
      <header className="book-app-top">
        <h1>{t("저장함", "Saved")}</h1>
        <span className="book-muted">{t(`${savedList.length}곳`, `${savedList.length} places`)}</span>
      </header>
      {savedList.length ? <div className="book-rows">{savedList.map(row)}</div> : (
        <Empty icon={Heart} title={t("저장한 식당이 없어요", "Nothing saved yet")} body={t("하트를 눌러 가고 싶은 곳을 모아 보세요.", "Tap the heart to keep places here.")} action={<button type="button" className="book-btn book-secondary" onClick={() => switchTab("home")}>{t("둘러보기", "Explore")}</button>} />
      )}
    </>
  );

  const prefRows: { key: keyof typeof prefs; label: string; body: string }[] = [
    { key: "remind", label: t("예약 리마인드", "Booking reminders"), body: t("방문 하루 전, 두 시간 전에 알려 드려요", "A day and two hours before") },
    { key: "openings", label: t("빈자리 알림", "Opening alerts"), body: t("저장한 식당에 자리가 나면 알려 드려요", "When a saved place frees up") },
    { key: "marketing", label: t("혜택 소식", "Offers & news"), body: t("이벤트와 할인 소식을 받아요", "Events and discounts") },
  ];
  const my = (
    <>
      <header className="book-app-top">
        <h1>{t("마이", "Me")}</h1>
      </header>
      <section className="book-me">
        <span className="book-avatar is-lg" aria-hidden="true">J</span>
        <div>
          <strong>{t("김지우", "Jiwoo Kim")}</strong>
          <small>{t("supper. 멤버 · 2024년부터", "supper. member since 2024")}</small>
        </div>
      </section>
      <div className="book-stats">
        <div><strong>{visited}</strong><small>{t("방문", "Visits")}</small></div>
        <div><strong>{reviewed}</strong><small>{t("리뷰", "Reviews")}</small></div>
        <div><strong>{data.saved.length}</strong><small>{t("저장", "Saved")}</small></div>
      </div>
      <section className="book-settings" aria-label={t("알림 설정", "Notification settings")}>
        {prefRows.map((item) => (
          <div key={item.key} className="book-setting">
            <div>
              <strong>{item.label}</strong>
              <small>{item.body}</small>
            </div>
            <Switch checked={prefs[item.key]} label={item.label} onChange={(next) => { setPrefs((current) => ({ ...current, [item.key]: next })); data.toast(next ? t(`${item.label}을 켰어요.`, `${item.label} on.`) : t(`${item.label}을 껐어요.`, `${item.label} off.`)); }} />
          </div>
        ))}
      </section>
      <section className="book-settings">
        {[t("결제 수단 관리", "Payment methods"), t("고객센터", "Help center"), t("약관 및 정책", "Terms & policies")].map((label) => (
          <button key={label} type="button" className="book-setting is-link" onClick={() => data.toast(t("프리뷰에서는 준비 중인 메뉴예요.", "This menu isn't part of the preview."))}>
            <strong>{label}</strong>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        ))}
      </section>
    </>
  );

  const todaySlots = detailR ? availableSlots(detailR, TODAY, "any", 2).slice(0, 4) : [];

  const overlay = (
    <>
      {detailR && (
        <Layer kind="panel" label={l(detailR.name)} onClose={() => { setDetail(null); setSheet(null); }} inert={sheet !== null || dialog !== null}>
          <div className="book-panel-scroll">
            <div className="book-panel-hero">
              <Art r={detailR} size="hero" />
              <div className="book-panel-actions">
                <button type="button" className="book-float-btn" aria-label={t("뒤로", "Back")} onClick={() => { setDetail(null); setSheet(null); }}>
                  <ArrowLeft size={18} />
                </button>
                <SaveButton r={detailR} saved={data.saved.includes(detailR.id)} onToggle={() => data.toggleSave(detailR)} className="book-float-btn" />
              </div>
            </div>
            <div className="book-panel-body">
              <RestaurantHead r={detailR} />
              <section className="book-panel-today" aria-label={t("오늘 남은 시간", "Times left today")}>
                <h3 className="book-subhead">{t("오늘 남은 시간", "Left today")}</h3>
                {todaySlots.length ? (
                  <div className="book-card-slots">
                    {todaySlots.map((time) => {
                      const info = slotInfo(detailR, TODAY, time, 2);
                      return (
                        <button key={time} type="button" className={`book-chip-slot is-${info.state}`} onClick={() => openSheet(time)} aria-label={`${time}, ${slotText(info.state, info.left)}`}>
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="book-muted">{isClosed(detailR, TODAY) ? t("오늘은 정기 휴무예요.", "Closed today.") : t("오늘은 남은 자리가 없어요. 다른 날을 골라 보세요.", "No tables left today. Try another day.")}</p>
                )}
              </section>
              <RestaurantInfo r={detailR} />
            </div>
          </div>
          <div className="book-panel-bar">
            <div>
              <small>{t("1인 평균", "Avg. per person")}</small>
              <strong>{money(detailR.avg)}</strong>
            </div>
            <button type="button" className="book-btn book-primary" onClick={() => openSheet()}>
              <CalendarCheck size={16} aria-hidden="true" />
              {t("예약하기", "Book a table")}
            </button>
          </div>
        </Layer>
      )}
      {detailR && sheet && (
        <Layer kind="sheet" label={t("예약하기", "Book a table")} onClose={() => setSheet(null)}>
          <span className="book-handle" aria-hidden="true" />
          <DialogHead eyebrow={l(detailR.name)} title={t("예약하기", "Book a table")} onClose={() => setSheet(null)} />
          <BookingFlow
            key={sheet.nonce}
            compact
            r={detailR}
            initialDay={TODAY}
            initialParty={2}
            initialTime={sheet.time}
            onBooked={data.book}
            onFinish={(goTo) => { setSheet(null); if (goTo === "reservations") { setDetail(null); switchTab("reservations"); } }}
          />
        </Layer>
      )}
      {dialog?.type === "cancel" && <CancelDialog sheet res={dialog.res} onClose={() => setDialog(null)} onConfirm={() => { data.cancel(dialog.res.id); setDialog(null); }} />}
      {dialog?.type === "review" && <ReviewDialog sheet res={dialog.res} onClose={() => setDialog(null)} onSubmit={(rating) => { data.review(dialog.res.id, rating); setDialog(null); }} />}
      <Toast notice={data.notice} />
    </>
  );

  const nav = (
    <nav className="book-tabbar" aria-label={t("앱 메뉴", "App menu")} inert={layerOpen}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => switchTab(id)}>
          <span className="book-tab-icon">
            <Icon size={20} aria-hidden="true" />
            {id === "reservations" && data.upcoming.length > 0 && <i className="book-tab-badge">{data.upcoming.length}</i>}
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="book book-app">
      <IntroPhone nav={nav} overlay={overlay}>
        <div className="book-app-content" ref={rootRef} inert={layerOpen}>
          {tab === "home" && home}
          {tab === "map" && map}
          {tab === "reservations" && reservations}
          {tab === "saved" && saved}
          {tab === "my" && my}
        </div>
      </IntroPhone>
    </div>
  );
}
