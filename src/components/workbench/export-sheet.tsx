"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { uiToast } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCopy } from "@/hooks/use-copy";
import type { ColorSystemResult, GenerateInput } from "@/lib/color-engine";
import { preventProtectedCopy, preventProtectedCopyShortcut } from "@/lib/copy-protection";
import { consumeQuota, isPlanRequiredError, quotaErrorMessage } from "@/lib/firebase/data";
import { formatExport, type ExportFormat } from "@/lib/export";
import { useMatchuStore } from "@/lib/store";

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
  const router = useRouter();
  const { user, signIn } = useAuth();
  const locale = useMatchuStore((state) => state.locale);
  const [format, setFormat] = useState<ExportFormat>("css");
  const file = useMemo(() => formatExport(format, result, input), [format, result, input]);

  async function copyCode() {
    try {
      const currentUser = user ?? await signIn();
      await consumeQuota(currentUser.uid, "export");
      await navigator.clipboard.writeText(file.code);
      uiToast.success(copy.result.copied, locale);
    } catch (error) {
      if (isPlanRequiredError(error)) {
        uiToast.info(
          locale === "ko" ? "무료 내보내기 한도를 모두 사용했어요. Pro 플랜은 곧 제공됩니다." : "You reached the free export limit. Pro is coming soon.",
          locale,
        );
        onOpenChange(false);
        router.push("/coming-soon");
        return;
      }
      uiToast.error(error instanceof Error && error.name === "QuotaLimitError" ? quotaErrorMessage(error, locale) : copy.result.copyFailed, locale);
    }
  }

  async function download() {
    try {
      const currentUser = user ?? await signIn();
      await consumeQuota(currentUser.uid, "export");
      const blob = new Blob([file.code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      uiToast.success(copy.result.downloaded, locale);
    } catch (error) {
      if (isPlanRequiredError(error)) {
        uiToast.info(
          locale === "ko" ? "무료 내보내기 한도를 모두 사용했어요. Pro 플랜은 곧 제공됩니다." : "You reached the free export limit. Pro is coming soon.",
          locale,
        );
        onOpenChange(false);
        router.push("/coming-soon");
        return;
      }
      uiToast.error(quotaErrorMessage(error, locale), locale);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-xl"
        onCopyCapture={preventProtectedCopy}
        onKeyDownCapture={preventProtectedCopyShortcut}
      >
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
        <pre className="copy-protected mt-4 max-h-[50vh] overflow-auto rounded-xl bg-foreground p-3 text-[11px] leading-5 text-background">
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
