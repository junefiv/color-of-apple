import { AppWindow, Building2, ChevronsDown, Clapperboard, ClipboardList, Columns2, Cookie, FileText, Inbox, List, ListOrdered, Loader, MapPin, MessageCircleQuestion, MessageSquare, MoveHorizontal, Package, PanelBottomOpen, PanelTop, Search, Smartphone, SquareStack, Table, type LucideIcon } from "lucide-react";

// Layer-panel and library icons for the schema-described blocks.
export const blockIcons: Record<string, LucideIcon> = {
  split: Columns2, marquee: MoveHorizontal, subhero: PanelTop, tabs: SquareStack, video: Clapperboard, form: ClipboardList, faq: MessageCircleQuestion, steps: ListOrdered,
  board: List, post: FileText, location: MapPin, about: Building2, product: Package, table: Table, popup: AppWindow, intro: Loader, consent: Cookie, progress: ChevronsDown,
  appbar: PanelTop, search: Search, sheet: PanelBottomOpen, toast: MessageSquare, empty: Inbox, appbanner: Smartphone,
};
// Blocks whose look is an app screen: their style thumbnails use a phone-sized stage.
export const phoneBlocks = new Set(["appbar", "search", "sheet", "toast", "empty", "appbanner"]);
