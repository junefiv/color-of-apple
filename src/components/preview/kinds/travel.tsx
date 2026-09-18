"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Alert, EmptySlot } from "../widgets";
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

export function TravelWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [step, setStep] = useState(1);
  const [room, setRoom] = useState("스탠다드");
  const [empty, setEmpty] = useState(false);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Away"
          links={["호텔", "항공", "일정"]}
          searchPlaceholder="여행지 검색"
          cta="예약"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "예약을 확정할까요?",
              body: "제주 · 2박 · 스탠다드. 취소는 체크인 24시간 전까지 가능합니다.",
              confirm: "예약하기",
              onConfirm: () => show({ type: "toast", message: "예약이 확정되었습니다.", tone: "success" }, 2000),
            })
          }
          onNotify={() => show({ type: "toast", message: "출발 하루 전 리마인더를 보냈습니다.", tone: "info" }, 2000)}
          onHelp={() => setOverlay({ type: "tooltip", message: "날짜를 고른 뒤 객실을 선택하세요." })}
          onProfile={() => setOverlay({ type: "drawer", title: "저장한 여행", body: "제주 2박, 교토 3박이 저장되어 있습니다." })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="여행 소개"
            title="검색, 날짜, 카드, 예약 상태를 한 흐름으로."
            body="소개 페이지 안에서 필터와 예약 확인이 어떻게 열리는지 봅니다."
            primary="일정 만들기"
            onPrimary={() =>
              setOverlay({
                type: "modal",
                title: "일정을 만들까요?",
                body: "선택한 날짜로 초안이 저장됩니다.",
                confirm: "만들기",
                onConfirm: () => show({ type: "toast", message: "일정을 저장했습니다.", tone: "success" }, 1800),
              })
            }
          />
          <div className="grid gap-3 md:grid-cols-4">
            <input className="pv-input" placeholder="출발지" list="cities" />
            <input className="pv-input" placeholder="도착지" list="cities" />
            <datalist id="cities">
              <option value="서울" />
              <option value="제주" />
            </datalist>
            <input className="pv-input" type="date" defaultValue="2026-10-02" />
            <select className="pv-input" defaultValue="2">
              <option value="2">2명</option>
              <option value="4">4명</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {["조식", "오션뷰", "무료취소"].map((item) => (
              <label key={item} className="pv-chip flex items-center gap-2">
                <input type="checkbox" /> {item}
              </label>
            ))}
            <button className="pv-chip" type="button" onClick={() => setEmpty((value) => !value)}>
              결과 없음 보기
            </button>
          </div>
          {empty ? (
            <EmptySlot label="조건에 맞는 숙소가 없습니다." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {["애월 스테이", "서귀포 리조트"].map((name) => (
                <button key={name} type="button" className="pv-card p-3 text-left" onClick={() => setOverlay({ type: "drawer", title: name, body: "갤러리와 지도, 취소 정책을 이 패널에서 봅니다." })}>
                  <div className="mb-3 h-24 rounded-xl bg-[var(--color-secondary-subtle)]" />
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{name}</p>
                    <StatusBadge tone="info">4.7</StatusBadge>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">1박 128,000원</p>
                </button>
              ))}
            </div>
          )}
          <Alert tone="warning" title="취소 정책" body="체크인 24시간 전까지만 전액 환불됩니다." />
          <div className="flex items-center gap-2 text-sm">
            {["검색", "객실", "결제"].map((item, index) => (
              <button key={item} type="button" className="pv-chip" data-selected={step === index + 1} onClick={() => setStep(index + 1)}>
                {index + 1} {item}
              </button>
            ))}
          </div>
          <div className="flex gap-3 text-sm">
            {["스탠다드", "디럭스"].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input type="radio" name="room" checked={room === item} onChange={() => setRoom(item)} />
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function TravelApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [saved, setSaved] = useState(false);

  return (
    <IntroPhone
      nav={
        <BottomNav
          items={["탐색", "일정", "티켓", "더보기"]}
          active="탐색"
          onItem={(item) =>
            item === "일정" &&
            setOverlay({ type: "sheet", title: "10월 일정", body: <p className="text-sm">2일 출발 · 4일 도착 · 애월 스테이</p> })
          }
        />
      }
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="Away" subtitle="여행 일정" onNotify={() => show({ type: "snackbar", message: "탑승권 QR이 준비됐어요." }, 2000)} />
      <div className="space-y-4 px-5 py-4">
        <input className="pv-input" placeholder="어디로 갈까요?" />
        <input className="pv-input" type="date" defaultValue="2026-10-02" />
        <div className="pv-card p-3">
          <div className="flex items-center justify-between">
            <p className="font-medium">애월 스테이</p>
            <button
              type="button"
              onClick={() => {
                setSaved(true);
                show({ type: "toast", message: "여행지를 저장했습니다.", tone: "success" }, 1600);
              }}
            >
              {saved ? "★" : "☆"}
            </button>
          </div>
          <StatusBadge tone="success">예약 확정</StatusBadge>
        </div>
        <div className="rounded-2xl border border-dashed border-[var(--color-border-default)] p-6 text-center text-sm">QR</div>
        <button
          className="pv-btn pv-btn-outline w-full"
          type="button"
          onClick={() =>
            setOverlay({
              type: "sheet",
              title: "필터",
              body: (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked /> 무료 취소
                  </label>
                  <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "필터를 적용했습니다.", tone: "info" }, 1600)}>
                    적용
                  </button>
                </div>
              ),
            })
          }
        >
          필터
        </button>
        <button
          className="pv-btn pv-btn-primary w-full"
          type="button"
          onClick={() =>
            setOverlay({
              type: "dialog",
              title: "이 숙소를 예약할까요?",
              body: "2박 · 256,000원",
              confirm: "예약",
              onConfirm: () => show({ type: "toast", message: "예약이 확정되었습니다.", tone: "success" }, 1800),
            })
          }
        >
          예약하기
        </button>
      </div>
    </IntroPhone>
  );
}
