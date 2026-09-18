"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Alert } from "../widgets";
import {
  AppBar,
  AppOverlays,
  BottomNav,
  IntroHeader,
  IntroHero,
  IntroPhone,
  IntroViewport,
  WebOverlays,
  useTimedOverlay,
  type AppOverlay,
  type WebOverlay,
} from "./shared";

export function FoodWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState(1);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Table"
          links={["배달", "포장", "예약"]}
          searchPlaceholder="주소 또는 매장"
          cta="장바구니"
          onCta={() => setOverlay({ type: "drawer", title: "장바구니", body: "라멘 1 · 12,000원. 최소 주문 15,000원까지 3,000원이 남았습니다." })}
          onNotify={() => show({ type: "toast", message: "라이더가 매장에 도착했습니다.", tone: "info" }, 2000)}
          onHelp={() => setOverlay({ type: "tooltip", message: "최소 주문 금액을 채우면 주문이 열립니다." })}
          onProfile={() => setOverlay({ type: "drawer", title: "최근 주문", body: "어제 라멘 · 배달 완료" })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="주문 소개"
            title="단계와 CTA가 상태를 따라 바뀌어야 합니다."
            body="메뉴, 옵션, 장바구니, 배달 타임라인을 소개 페이지에서 눌러봅니다."
            primary="주문하기"
            onPrimary={() => setOverlay({ type: "drawer", title: "장바구니", body: "라멘 · 차슈 추가 · 12,000원" })}
          />
          <div className="flex flex-wrap gap-2">
            {["한식", "일식", "디저트"].map((item) => (
              <button key={item} className="pv-chip" type="button">
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {["스즈키 라멘", "북촌 국밥"].map((name) => (
              <button key={name} type="button" className="pv-card p-3 text-left" onClick={() => setOverlay({ type: "drawer", title: name, body: "평점 4.8 · 배달 28분 · 최소 15,000원" })}>
                <div className="mb-3 h-24 rounded-xl bg-[var(--color-secondary-subtle)]" />
                <div className="flex items-center justify-between">
                  <p className="font-medium">{name}</p>
                  <StatusBadge tone="info">28분</StatusBadge>
                </div>
              </button>
            ))}
          </div>
          <div className="pv-card space-y-3 p-4">
            <p className="font-medium">라멘</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> 차슈 추가
            </label>
            <div className="flex gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="spice" defaultChecked /> 보통
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="spice" /> 맵게
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setQty(Math.max(1, qty - 1))}>
                –
              </button>
              <span>{qty}</span>
              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setQty(qty + 1)}>
                +
              </button>
            </div>
            <Alert tone="warning" title="최소 주문" body="15,000원부터 배달이 가능합니다." />
            <button
              className="pv-btn pv-btn-primary"
              type="button"
              onClick={() =>
                qty < 2
                  ? show({ type: "toast", message: "최소 주문 금액이 부족합니다.", tone: "warning" }, 2000)
                  : setOverlay({
                      type: "modal",
                      title: "주문을 확정할까요?",
                      body: `라멘 ${qty}개 · 결제 후 조리를 시작합니다.`,
                      confirm: "주문",
                      onConfirm: () => {
                        setStep(3);
                        show({ type: "toast", message: "주문이 접수되었습니다.", tone: "success" }, 1800);
                      },
                    })
              }
            >
              주문하기
            </button>
          </div>
          <div className="flex gap-2">
            {["담기", "결제", "배달"].map((item, index) => (
              <span key={item} className="pv-chip" data-selected={step === index + 1}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function FoodApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });

  function openOption() {
    setOverlay({
      type: "sheet",
      title: "옵션",
      body: (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> 차슈 추가
          </label>
          <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "메뉴를 담았습니다.", tone: "success" }, 1600)}>
            담기
          </button>
        </div>
      ),
    });
  }

  return (
    <IntroPhone
      nav={<BottomNav items={["탐색", "주문", "찜", "나"]} active="탐색" onItem={(item) => item === "주문" && show({ type: "snackbar", message: "라이더가 5분 뒤 도착해요." }, 2000)} />}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="Table" subtitle="주문 · 배달" onNotify={() => show({ type: "snackbar", message: "조리가 시작됐어요." }, 1800)} />
      <div className="space-y-4 px-5 py-4">
        <div className="h-32 rounded-2xl bg-[var(--color-secondary-subtle)]" />
        <p className="text-lg font-semibold">스즈키 라멘</p>
        <button className="pv-btn pv-btn-outline w-full" type="button" onClick={openOption}>
          옵션 선택
        </button>
        <div className="flex gap-2 text-xs">
          {["접수", "조리", "배달"].map((item, index) => (
            <span key={item} className="pv-chip" data-selected={index === 1}>
              {item}
            </span>
          ))}
        </div>
        <button className="pv-btn pv-btn-primary w-full" type="button" onClick={openOption}>
          주문하기
        </button>
        <button
          className="pv-btn pv-btn-ghost w-full"
          type="button"
          onClick={() =>
            setOverlay({
              type: "dialog",
              title: "주문을 취소할까요?",
              body: "조리 시작 전에는 취소할 수 있습니다.",
              confirm: "취소하기",
              danger: true,
              onConfirm: () => show({ type: "toast", message: "주문을 취소했습니다.", tone: "danger" }, 1600),
            })
          }
        >
          주문 취소
        </button>
      </div>
    </IntroPhone>
  );
}
