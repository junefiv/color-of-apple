"use client";

import Image from "next/image";
import Link from "next/link";
import { JoinDialog } from "@/components/brand/join-dialog";
import { SiteDocument } from "@/components/brand/site-document";
import { useMatchuStore } from "@/lib/store";

const marks = {
  ko: { src: "/assets/git_in.png", alt: "옷깃도 스치면 인연", width: 1072, height: 589 },
  en: { src: "/assets/en_git_in.png", alt: "We interdigitate, and something begins.", width: 1841, height: 412 },
} as const;

function OperatorMark({ locale }: { locale: "ko" | "en" }) {
  const mark = marks[locale];
  return (
    <Image
      src={mark.src}
      alt={mark.alt}
      width={mark.width}
      height={mark.height}
      className="h-auto"
      style={{ width: locale === "ko" ? 200 : 340, height: "auto" }}
    />
  );
}

export function InformationView() {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";

  return (
    <SiteDocument title="About us" centered>
      <section className="mt-9 space-y-4 text-center text-base leading-8">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">About Color-of-Apple</h2>
        <div className="space-y-4">
          {isKo ? (
            <>
              <p>Color of Apple은 메인 컬러 하나로 UI 컬러 팔레트를 만드는 웹 서비스입니다. 메인 컬러를 고르면 배경, 글자, 버튼, 보조 색 등 웹/앱 디자인에 필요한 컬러토큰이 7개 팔레트로 생성됩니다. </p>
              <p>선택된 컬러 팔레트는 웹 화면, 앱 화면, UI 컴포넌트 프리뷰에서 확인해보세요.</p>
              <p>컬러 토큰은 CSS, Tailwind, React Native, JSON으로 복사하거나 파일로 받을 수 있으니, 퍼블리싱 업무에 적극 활용해보세요. </p>
            </>
          ) : (
            <>
              <p>Color of Apple is a web service that builds a UI color palette from one main color. After you choose that color, backgrounds, text, buttons, secondary colors and neutrals are filled from the selected palette and contrast target. Secondary colors can be the same hue, a nearby hue, a split contrast or the opposite hue.</p>
              <p>The result is previewed on web screens, app screens and UI components. Pairs of text and background that miss the contrast target are flagged.</p>
              <p>Color tokens can be copied or downloaded as CSS, Tailwind, React Native or JSON. A colorbook can be saved to an account, sent with a share link, or downloaded as a file.</p>
            </>
          )}
        </div>
      </section>
      <section className="mt-9 space-y-4 text-center text-base leading-8">
        <h2 className="font-heading text-2xl font-extrabold tracking-tight">About GIT_IN</h2>
        <div className="space-y-4">
          {(isKo ? [
            ["GIT IN은 아이디어를 실제 결과물로 만들어내는 팀입니다."],
            ["누구나 아이디어를 가질 수 있습니다.", "기획자일 수도 있고, 디자이너나 개발자일 수도 있고, 아직 구체적인 방법은 모르지만 “이런 게 있으면 좋겠다”는 생각만 가진 사람일 수도 있습니다."],
            ["GIT IN은 그 생각에서 시작하고,", "좋은 생각을 그냥 생각으로 끝내지 않습니다."],
            ["서로 다른 경험과 관점을 가진 사람들이 모여", "아이디어를 구조화하고, 실제로 작동하게 만드는 것."],
            ["그게 GIT IN이 하는 일입니다."],
          ] : [
            ["GIT IN is a team that turns an idea into something you can actually use."],
            ["Anyone can have an idea.", "You might be a planner, a designer, or a developer — or someone who only knows that this should exist."],
            ["GIT IN starts from that thought,", "and does not leave a good one as only a thought."],
            ["People with different experience and points of view interdigitate,", "give the idea a structure, and make it run."],
            ["That is what GIT IN does."],
          ]).map((paragraph) => (
            <p key={paragraph[0]}>
              {paragraph.map((line, index) => <span key={line}>{index > 0 ? <br /> : null}{line}</span>)}
            </p>
          ))}
        </div>
        <div className="flex justify-center">
          <OperatorMark locale={locale} />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <JoinDialog />
          <Link href="/contact" className="inline-flex rounded-lg border border-black px-5 py-3 text-sm font-medium">Contact US</Link>
        </div>
      </section>
    </SiteDocument>
  );
}
