"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCopy } from "@/hooks/use-copy";
import type { ColorSystemResult, GenerateInput } from "@/lib/color-engine";
import { formatExport, type ExportFormat } from "@/lib/export";

export function ExportSheet({
  open,
  onOpenChange,
  result,
  input,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ColorSystemResult;
  input: GenerateInput;
}) {
  const copy = useCopy();
  const [format, setFormat] = useState<ExportFormat>("css");
  const file = useMemo(() => formatExport(format, result, input), [format, result, input]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(file.code);
      toast.success(copy.result.copied);
    } catch {
      toast.error(copy.result.copyFailed);
    }
  }

  function download() {
    const blob = new Blob([file.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{copy.export.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["css", copy.export.css],
              ["tailwind", copy.export.tailwind],
              ["react-native", copy.export.reactNative],
              ["json", copy.export.json],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={format === key ? "default" : "outline"}
              onClick={() => setFormat(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <pre className="mt-4 max-h-[50vh] overflow-auto rounded-xl bg-foreground p-3 text-[11px] leading-5 text-background">
          {file.code}
        </pre>
        <div className="mt-4 flex gap-2">
          <Button onClick={copyCode}>{copy.export.copy}</Button>
          <Button variant="outline" onClick={download}>
            {copy.export.download}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
