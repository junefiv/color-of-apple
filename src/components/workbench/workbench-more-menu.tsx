"use client";

import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function WorkbenchMoreMenu({
  onTokens,
  onCopyCss,
  onExport,
  onSave,
  onShare,
}: {
  onTokens: () => void;
  onCopyCss: () => void;
  onExport: () => void;
  onSave: () => void;
  onShare: () => void;
}) {
  const copy = useCopy();
  const locale = useMatchuStore((state) => state.locale);
  const setLocale = useMatchuStore((state) => state.setLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="studio-more-trigger shrink-0"
        aria-label={copy.result.moreMenu}
        data-testid="workbench-more-menu"
      >
        <EllipsisVertical className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-44">
        <DropdownMenuItem onClick={onTokens}>{copy.result.tokens}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCopyCss}>{copy.result.copy}</DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>{copy.result.export}</DropdownMenuItem>
        <DropdownMenuItem onClick={onSave}>{copy.result.save}</DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>{copy.result.share}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocale(locale === "ko" ? "en" : "ko")}>
          {locale === "ko" ? copy.otherLocaleName : copy.localeName}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
