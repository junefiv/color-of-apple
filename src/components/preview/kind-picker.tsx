"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopy } from "@/hooks/use-copy";
import { PREVIEW_KINDS, useMatchuStore } from "@/lib/store";

export function KindPicker() {
  const copy = useCopy();
  const previewKind = useMatchuStore((state) => state.previewKind);
  const setPreviewKind = useMatchuStore((state) => state.setPreviewKind);
  const hasMatched = useMatchuStore((state) => state.hasMatched);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="chrome-chip"
        data-active="true"
        data-matched={hasMatched ? "true" : "false"}
      >
        {copy.preview.kinds[previewKind]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {PREVIEW_KINDS.map((kind) => (
          <DropdownMenuItem key={kind} onClick={() => setPreviewKind(kind)}>
            {copy.preview.kinds[kind]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
