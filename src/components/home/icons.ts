import {
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  LayoutDashboard,
  Mail,
  NotebookPen,
  RotateCcw,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { FeatureIcon } from "@/data/features";

/** 「できること」のアイコン（src/data/features.ts の icon と対応） */
export const FEATURE_ICONS: Record<FeatureIcon, LucideIcon> = {
  clipboard: ClipboardCheck,
  badge: BadgeCheck,
  calendar: CalendarCheck,
  refund: RotateCcw,
  video: Video,
  sparkles: Sparkles,
  notebook: NotebookPen,
  mail: Mail,
  layout: LayoutDashboard,
};
