import { BookOpen, Building2, Calendar, Gift, Heart, Leaf, MapPin, Phone, Shield, Sparkles, Star, Users } from "lucide-react";
import type { HeaderIcon } from "@/lib/header-config";

// Icon choices shared by every builder component (menus, quick menus, contact cards, feature cards).
export const iconMap: Record<Exclude<HeaderIcon, "">, typeof Star> = { star: Star, sparkles: Sparkles, heart: Heart, shield: Shield, leaf: Leaf, building: Building2, users: Users, phone: Phone, map: MapPin, calendar: Calendar, book: BookOpen, gift: Gift };
export const iconNames: Record<Exclude<HeaderIcon, "">, string> = { star: "별", sparkles: "반짝임", heart: "하트", shield: "방패", leaf: "잎", building: "건물", users: "사람들", phone: "전화", map: "위치", calendar: "달력", book: "책", gift: "선물" };

export function IconOptions() {
  return <>{(Object.keys(iconNames) as (keyof typeof iconNames)[]).map(icon => <option key={icon} value={icon}>{iconNames[icon]}</option>)}</>;
}
