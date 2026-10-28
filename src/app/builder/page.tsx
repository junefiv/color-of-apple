import type { Metadata } from "next";
import { Workbench } from "@/components/workbench/workbench";

export const metadata: Metadata = {
  title: "직접 빌드 — Color of Apple",
  description: "섹션과 프레임을 배치하고 PC와 모바일의 레이아웃을 다듬으세요.",
};

export default function BuilderPage() {
  return <Workbench initialBuilder />;
}
