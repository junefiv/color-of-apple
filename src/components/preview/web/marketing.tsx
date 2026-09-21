"use client";

import { useState } from "react";

export function WebMarketing() {
  const [open, setOpen] = useState("one");

  return (
    <div data-token="background" style={{ background: "var(--color-bg-canvas)" }}>
      <div
        data-token="accent"
        className="px-4 py-2 text-center text-sm"
        style={{ background: "var(--color-accent-default)", color: "var(--color-accent-on)" }}
      >
        새 워크스페이스를 14일 동안 써볼 수 있습니다.
      </div>
      <header
        data-token="surface"
        className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] px-5 py-3"
      >
        <span className="text-xs font-semibold tracking-[0.18em]" data-token="text">
          LOGO
        </span>
        <nav className="hidden gap-4 text-sm text-[var(--color-text-secondary)] md:flex">
          {["Product", "Pricing", "Docs"].map((item) => (
            <button key={item} type="button" data-token="text">
              {item}
            </button>
          ))}
        </nav>
        <div className="flex gap-2">
          <button className="pv-btn pv-btn-outline" type="button" data-token="text">
            Sign in
          </button>
          <button className="pv-btn pv-btn-primary" type="button" data-token="primary">
            Start
          </button>
        </div>
      </header>
      <section className="grid gap-6 px-6 py-10 md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold leading-tight" data-token="text">
            한 화면에서 팀의 진행을 읽습니다.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]" data-token="text">
            배경은 조용하고, 행동만 Primary로 남깁니다. 긴 페이지에서도 제목과 본문이 부담 없이 읽혀야 합니다.
          </p>
          <div className="mt-5 flex gap-2">
            <button className="pv-btn pv-btn-primary" type="button" data-token="primary">
              시작하기
            </button>
            <button className="pv-btn pv-btn-secondary-fill" type="button" data-token="secondary">
              둘러보기
            </button>
          </div>
        </div>
        <div data-token="primary" className="pv-bg-primary min-h-44 rounded-3xl" />
      </section>
      <section className="flex flex-wrap justify-center gap-3 px-6 pb-8">
        {["North", "Harbor", "Atlas", "Pike", "Orbit"].map((name) => (
          <span key={name} className="rounded-full border border-[var(--color-border-default)] px-3 py-1 text-xs text-[var(--color-text-tertiary)]" data-token="text">
            {name}
          </span>
        ))}
      </section>
      <section className="grid gap-3 px-6 pb-10 md:grid-cols-3">
        {[
          ["정리", "역할별 컬러가 화면 위계를 만듭니다."],
          ["속도", "반복되는 화면에도 같은 토큰을 씁니다."],
          ["검증", "상태와 대비를 한 자리에서 확인합니다."],
        ].map(([title, body]) => (
          <div key={title} className="pv-card p-4" data-token="surface">
            <div className="mb-3 size-8 rounded-lg bg-[var(--color-secondary-default)]" data-token="secondary" />
            <p className="font-medium" data-token="text">
              {title}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]" data-token="text">
              {body}
            </p>
          </div>
        ))}
      </section>
      <section className="grid gap-3 px-6 pb-10 sm:grid-cols-3">
        {[
          ["48k", "주간 세션"],
          ["99.2%", "가용성"],
          ["4.8", "만족도"],
        ].map(([value, label]) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-semibold" data-token="accent" style={{ color: "var(--color-accent-default)" }}>
              {value}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]" data-token="text">
              {label}
            </p>
          </div>
        ))}
      </section>
      <section className="px-6 pb-10">
        <div className="pv-card p-5" data-token="surface">
          <p className="text-sm leading-6" data-token="text">
            “배경이 튀지 않아서 숫자가 먼저 보입니다. Accent는 한 줄에만 썼어요.”
          </p>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]" data-token="text">
            Mina Cho · Product
          </p>
        </div>
      </section>
      <section className="grid gap-3 px-6 pb-10 md:grid-cols-3">
        {(
          [
            ["Starter", "무료", false],
            ["Team", "₩12,000", true],
            ["Scale", "문의", false],
          ] as const
        ).map(([name, price, featured]) => (
          <div
            key={name}
            data-token={featured ? "primary" : "surface"}
            className="pv-card relative p-4"
            style={featured ? { outline: "2px solid var(--color-primary-default)" } : undefined}
          >
            {featured ? (
              <span
                data-token="accent"
                className="absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "var(--color-accent-default)", color: "var(--color-accent-on)" }}
              >
                추천
              </span>
            ) : null}
            <p className="text-sm" data-token="text">
              {name}
            </p>
            <p className="mt-2 text-2xl font-semibold" data-token="text">
              {price}
            </p>
            <button className={featured ? "pv-btn pv-btn-primary mt-4 w-full" : "pv-btn pv-btn-outline mt-4 w-full"} type="button" data-token={featured ? "primary" : "text"}>
              선택
            </button>
          </div>
        ))}
      </section>
      <section className="px-6 pb-10">
        <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]" data-token="surface">
          {[
            ["one", "토큰을 어떻게 쓰나요?", "Pages에서 위계를 보고 Components에서 상태를 검사합니다."],
            ["two", "다크 모드는요?", "같은 역할을 밝기만 뒤집어 유지합니다."],
            ["three", "내보낼 수 있나요?", "CSS 변수와 JSON으로 내보냅니다."],
          ].map(([id, title, body]) => (
            <div key={id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                data-token="text"
                onClick={() => setOpen(open === id ? "" : id)}
              >
                {title}
                <span className="text-[var(--color-text-tertiary)]">{open === id ? "–" : "+"}</span>
              </button>
              {open === id ? (
                <p className="px-3 pb-3 text-xs text-[var(--color-text-secondary)]" data-token="text">
                  {body}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap items-center gap-2 px-6 pb-10">
        <input className="pv-input max-w-xs" placeholder="email@studio.com" data-token="surface" />
        <button className="pv-btn pv-btn-primary" type="button" data-token="primary">
          구독
        </button>
      </section>
      <footer className="flex flex-wrap gap-4 border-t border-[var(--color-border-subtle)] px-6 py-5 text-xs text-[var(--color-text-tertiary)]">
        {["Privacy", "Terms", "Status", "Contact"].map((item) => (
          <button key={item} type="button" data-token="text">
            {item}
          </button>
        ))}
      </footer>
    </div>
  );
}
