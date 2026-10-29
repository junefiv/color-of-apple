import { Award, BadgePercent, BarChart3, Bell, CalendarDays, CreditCard, Flag, GalleryHorizontal, Grid3x3, Images, Camera, LayoutGrid, LogIn, Mail, Megaphone, MessagesSquare, Quote, ShoppingBag, ShoppingCart, SplitSquareHorizontal, Ticket, Trophy, Truck, UserRound, Users, AppWindow, Building2, ChevronsDown, Clapperboard, ClipboardList, Columns2, Cookie, FileText, Inbox, List, ListOrdered, Loader, MapPin, MessageCircleQuestion, MessageSquare, MoveHorizontal, Package, PanelBottomOpen, PanelTop, Search, Smartphone, SquareStack, Table, type LucideIcon } from "lucide-react";

// Layer-panel and library icons for the schema-described blocks.
export const blockIcons: Record<string, LucideIcon> = {
  split: Columns2, marquee: MoveHorizontal, subhero: PanelTop, tabs: SquareStack, video: Clapperboard, form: ClipboardList, faq: MessageCircleQuestion, steps: ListOrdered,
  board: List, post: FileText, location: MapPin, about: Building2, product: Package, table: Table, popup: AppWindow, intro: Loader, consent: Cookie, progress: ChevronsDown,
  appbar: PanelTop, search: Search, sheet: PanelBottomOpen, toast: MessageSquare, empty: Inbox, appbanner: Smartphone,
  gallery: Images, logos: Award, reviews: Quote, newsletter: Mail, promo: Megaphone, stats: BarChart3, pricing: CreditCard, team: Users, compare: SplitSquareHorizontal, ticker: Flag,
  feed: Camera, productlist: ShoppingBag, cart: ShoppingCart, buybar: BadgePercent, booking: CalendarDays, coupons: Ticket, orderstatus: Truck, iconmenu: Grid3x3, banners: GalleryHorizontal,
  ranking: Trophy, onboarding: LayoutGrid, auth: LogIn, mypage: UserRound, notices: Bell, chat: MessagesSquare,
};
// Blocks whose look is an app screen: their style thumbnails use a phone-sized stage.
export const phoneBlocks = new Set(["appbar", "search", "sheet", "toast", "empty", "appbanner", "buybar", "iconmenu", "banners", "ranking", "onboarding", "auth", "mypage", "notices", "chat", "orderstatus", "coupons"]);
