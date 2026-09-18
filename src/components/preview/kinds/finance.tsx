"use client";

import { useState } from "react";
import { DonutChart, LineChart } from "../charts";
import { StatusBadge } from "../shared";
import { Alert, Progress } from "../widgets";
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

export function FinanceWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [period, setPeriod] = useState("1M");
  const [loading, setLoading] = useState(false);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Ledger"
          links={["자산", "투자", "송금"]}
          searchPlaceholder="종목·계좌 검색"
          cta="송금"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "200,000원을 보낼까요?",
              body: "받는 계좌와 금액을 다시 확인하세요.",
              confirm: "송금",
              onConfirm: () => show({ type: "toast", message: "송금이 완료되었습니다.", tone: "success" }, 2000),
            })
          }
          onNotify={() => show({ type: "toast", message: "해외 결제가 차단되었습니다.", tone: "danger" }, 2200)}
          onHelp={() => setOverlay({ type: "tooltip", message: "수익률은 세전 기준입니다." })}
          onProfile={() => setOverlay({ type: "drawer", title: "보안 알림", body: "새 기기 로그인이 감지되면 여기에서 확인할 수 있습니다." })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="자산 소개"
            title="숫자와 대비가 가장 엄격한 화면."
            body="총자산, 증감, 위험 상태, 송금 확인이 같은 팔레트에서 읽히는지 봅니다."
            primary="송금하기"
            onPrimary={() =>
              setOverlay({
                type: "modal",
                title: "송금을 확인할까요?",
                body: "민준 · 200,000원 · 오늘 처리",
                confirm: "확인",
                onConfirm: () => show({ type: "toast", message: "송금이 완료되었습니다.", tone: "success" }, 2000),
              })
            }
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">총자산</p>
              <p className="mt-1 text-2xl font-semibold">128,400,000</p>
            </div>
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">수익률</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--color-accent-default)" }}>
                +2.4%
              </p>
            </div>
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">위험도</p>
              <Progress value={38} />
            </div>
          </div>
          <div className="flex gap-2">
            {["1W", "1M", "1Y"].map((item) => (
              <button key={item} type="button" className="pv-chip" data-selected={period === item} onClick={() => setPeriod(item)}>
                {item}
              </button>
            ))}
            <select className="pv-input w-36" defaultValue="main">
              <option value="main">주거래</option>
              <option value="invest">투자</option>
            </select>
          </div>
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="pv-card p-4">
              <LineChart />
            </div>
            <div className="pv-card p-4">
              <DonutChart />
            </div>
          </div>
          <Alert tone="danger" title="보안 확인" body="새 기기에서 로그인을 시도했습니다." />
          <div className="pv-card overflow-hidden">
            <p className="px-4 py-3 font-medium">거래내역</p>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["스타벅스", "-6,400", "하락"],
                  ["급여", "+3,200,000", "상승"],
                ].map(([name, amount, tone]) => (
                  <tr key={name} className="border-t border-[var(--color-border-subtle)]">
                    <td className="px-4 py-2">{name}</td>
                    <td className="px-4 py-2">{amount}</td>
                    <td className="px-4 py-2">
                      <StatusBadge tone={tone === "상승" ? "success" : "danger"}>{tone}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="pv-btn pv-btn-outline"
            type="button"
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => {
                setLoading(false);
                show({ type: "toast", message: "내역을 불러왔습니다.", tone: "success" }, 1600);
              }, 700);
            }}
          >
            {loading ? "불러오는 중…" : "내역 새로고침"}
          </button>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function FinanceApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [pin, setPin] = useState("");

  function openSend() {
    setOverlay({
      type: "sheet",
      title: "송금 확인",
      body: (
        <div className="space-y-3">
          <p className="text-sm">민준 · 200,000원</p>
          <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "송금이 완료되었습니다.", tone: "success" }, 1800)}>
            보내기
          </button>
        </div>
      ),
    });
  }

  return (
    <IntroPhone
      nav={<BottomNav items={["홈", "자산", "송금", "더보기"]} active="홈" onItem={(item) => item === "송금" && openSend()} />}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="Ledger" subtitle="투자 · 송금" onNotify={() => show({ type: "snackbar", message: "인증이 만료되어 다시 확인이 필요해요." }, 2200)} />
      <div className="space-y-4 px-5 py-4">
        <div className="pv-card p-4">
          <p className="text-xs text-[var(--color-text-tertiary)]">사용 가능</p>
          <p className="text-3xl font-semibold">2,480,000</p>
          <p className="text-xs" style={{ color: "var(--color-accent-default)" }}>
            +18,400
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["송금", "결제", "충전"].map((item) => (
            <button key={item} className="pv-btn pv-btn-outline" type="button" onClick={openSend}>
              {item}
            </button>
          ))}
        </div>
        <p className="text-sm">PIN</p>
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6"].map((key) => (
            <button key={key} className="pv-btn pv-btn-ghost" type="button" onClick={() => setPin(pin + key)}>
              {key}
            </button>
          ))}
        </div>
        <button
          className="pv-btn pv-btn-primary w-full"
          type="button"
          onClick={() =>
            setOverlay({
              type: "dialog",
              title: "생체인증을 사용할까요?",
              body: "다음부터 PIN 대신 Face ID로 확인할 수 있습니다.",
              confirm: "허용",
              onConfirm: () => show({ type: "toast", message: "송금이 완료되었습니다.", tone: "success" }, 1800),
            })
          }
        >
          확인
        </button>
      </div>
    </IntroPhone>
  );
}
