"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Progress } from "../widgets";
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

const products = [
  { name: "린넨 셔츠", price: "48,000", sale: "32%", tone: "danger" as const },
  { name: "캔버스 토트", price: "36,000", sale: "신상", tone: "info" as const },
  { name: "울 머플러", price: "21,000", sale: "품절", tone: "warning" as const },
];

export function ShopWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [tab, setTab] = useState("상의");
  const [price, setPrice] = useState(60);
  const [qty, setQty] = useState(1);
  const [option, setOption] = useState("M");

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="North"
          links={["신상", "우먼", "맨", "세일"]}
          searchPlaceholder="상품 검색"
          cta="장바구니"
          onCta={() => setOverlay({ type: "drawer", title: "장바구니", body: "린넨 셔츠 1 · 48,000원. 쿠폰을 적용한 뒤 결제합니다." })}
          onNotify={() => show({ type: "toast", message: "재입고 알림을 받아두었습니다.", tone: "info" }, 2000)}
          onHelp={() => setOverlay({ type: "tooltip", message: "무료 반품은 14일 이내입니다." })}
          onProfile={() =>
            setOverlay({
              type: "modal",
              title: "쿠폰을 적용할까요?",
              body: "WELCOME10 쿠폰으로 10%가 할인됩니다.",
              confirm: "적용",
              onConfirm: () => show({ type: "toast", message: "쿠폰이 적용되었습니다.", tone: "success" }, 1800),
            })
          }
        />
        <div className="preview-scroll space-y-8 p-6">
          <button
            type="button"
            className="w-full rounded-2xl px-5 py-6 text-left"
            style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-text)" }}
            onClick={() => show({ type: "toast", message: "가을 프로모션이 시작되었습니다.", tone: "info" }, 2000)}
          >
            <p className="text-xs">이번 주만</p>
            <p className="mt-1 text-2xl font-semibold">가을 신상 20% 할인</p>
          </button>
          <IntroHero
            kicker="스토어 소개"
            title="색이 상품과 CTA 사이에서 어떻게 보이는지."
            body="배너, 카드, 가격, 할인, 장바구니 드로어를 한 소개 페이지에서 확인합니다."
            primary="쇼핑 시작"
            onPrimary={() => setOverlay({ type: "drawer", title: "추천 상품", body: "방금 본 린넨 셔츠와 어울리는 아이템 3개." })}
          />
          <div className="flex gap-3 text-sm">
            {["상의", "가방", "ACC"].map((item) => (
              <button key={item} type="button" style={tab === item ? { borderBottom: "2px solid var(--color-primary-default)" } : { color: "var(--color-text-tertiary)" }} onClick={() => setTab(item)}>
                {item}
              </button>
            ))}
          </div>
          <label className="block text-sm text-[var(--color-text-secondary)]">
            가격대 {price}%
            <input type="range" className="mt-2 w-full" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            {products.map((item) => (
              <div key={item.name} className="pv-card space-y-3 p-3">
                <div className="h-28 rounded-xl bg-[var(--color-secondary-subtle)]" />
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.name}</p>
                  <StatusBadge tone={item.tone}>{item.sale}</StatusBadge>
                </div>
                <p className="text-sm">★ 4.8 · {item.price}원</p>
                {item.sale === "품절" ? (
                  <button className="pv-btn pv-btn-outline w-full" type="button" onClick={() => show({ type: "toast", message: "재입고되면 알려드릴게요.", tone: "warning" }, 2000)}>
                    재입고 알림
                  </button>
                ) : (
                  <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => setOverlay({ type: "drawer", title: "장바구니", body: `${item.name}을 담았습니다. 배송은 2–3일 소요됩니다.` })}>
                    담기
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="pv-card space-y-3 p-4">
            <p className="font-medium">옵션</p>
            <div className="flex gap-3 text-sm">
              {["S", "M", "L"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="radio" name="size" checked={option === item} onChange={() => setOption(item)} />
                  {item}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setQty(Math.max(1, qty - 1))}>
                –
              </button>
              <span>{qty}</span>
              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setQty(qty + 1)}>
                +
              </button>
              <button
                className="pv-btn pv-btn-primary ml-auto"
                type="button"
                onClick={() =>
                  setOverlay({
                    type: "modal",
                    title: "결제를 진행할까요?",
                    body: `사이즈 ${option}, ${qty}개. 결제 후 주문 상태가 업데이트됩니다.`,
                    confirm: "결제",
                    onConfirm: () => show({ type: "toast", message: "주문이 완료되었습니다.", tone: "success" }, 2000),
                  })
                }
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function ShopApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [liked, setLiked] = useState(false);

  return (
    <IntroPhone
      nav={
        <BottomNav
          items={["홈", "검색", "장바구니", "마이"]}
          active="홈"
          onItem={(item) => item === "장바구니" && setOverlay({ type: "sheet", title: "장바구니", body: <p className="text-sm">린넨 셔츠 1개 · 48,000원</p> })}
        />
      }
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="North" subtitle="상품 상세" onNotify={() => show({ type: "snackbar", message: "배송이 내일 도착 예정이에요." }, 2000)} />
      <div className="space-y-4 px-5 py-4">
        <div className="h-40 rounded-2xl bg-[var(--color-secondary-subtle)]" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">린넨 셔츠</p>
            <p className="text-sm text-[var(--color-text-secondary)]">48,000원</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLiked(true);
              show({ type: "toast", message: "위시리스트에 담았습니다.", tone: "success" }, 1600);
            }}
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">리뷰 만족</p>
        <Progress value={86} />
        <select className="pv-input" defaultValue="home">
          <option value="home">집</option>
          <option value="office">회사</option>
        </select>
        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="pay" defaultChecked /> 카드
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="pay" /> 간편결제
          </label>
        </div>
        <button
          className="pv-btn pv-btn-primary w-full"
          type="button"
          onClick={() =>
            setOverlay({
              type: "sheet",
              title: "사이즈 선택",
              body: (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {["S", "M", "L"].map((item) => (
                      <button key={item} className="pv-chip" type="button">
                        {item}
                      </button>
                    ))}
                  </div>
                  <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "주문이 완료되었습니다.", tone: "success" }, 1800)}>
                    바로 구매
                  </button>
                </div>
              ),
            })
          }
        >
          구매하기
        </button>
      </div>
    </IntroPhone>
  );
}
