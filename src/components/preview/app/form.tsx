"use client";

import { useState } from "react";
import { ChoiceCard } from "../widgets";

export function AppForm({
  onBack,
  onSubmit,
}: {
  onBack?: () => void;
  onSubmit?: () => void;
} = {}) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("team");

  return (
    <div className="flex min-h-full flex-col" data-token="background">
      <div className="px-5 pt-2">
        {onBack ? (
          <button className="text-sm" type="button" data-token="primary" style={{ color: "var(--color-primary-text)" }} onClick={onBack}>
            ← Back
          </button>
        ) : null}
        <div className="mt-3 flex gap-1">
          {[0, 1, 2].map((id) => (
            <span
              key={id}
              data-token={id <= step ? "primary" : "surface"}
              className="h-1 flex-1 rounded-full"
              style={{ background: id <= step ? "var(--color-primary-default)" : "var(--color-border-subtle)" }}
            />
          ))}
        </div>
        <h2 className="mt-3 text-xl font-semibold" data-token="text">
          {step === 0 ? "기본 정보" : step === 1 ? "옵션 선택" : "확인 및 제출"}
        </h2>
      </div>
      <div className="flex-1 space-y-3 px-5 py-4">
        {step === 0 ? (
          <>
            <input className="pv-input" placeholder="이름" defaultValue="Northwind" data-token="surface" />
            <input className="pv-input" placeholder="검색 가능한 선택" data-token="surface" />
            <textarea className="pv-input min-h-24" defaultValue="범위를 짧게 적습니다." data-token="surface" />
            <p className="text-xs text-[var(--color-text-secondary)]" data-token="text">
              Helper: 이름은 나중에 바꿀 수 있습니다.
            </p>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <ChoiceCard title="Team" body="작은 팀" selected={plan === "team"} onClick={() => setPlan("team")} />
            <ChoiceCard title="Scale" body="조직" selected={plan === "scale"} onClick={() => setPlan("scale")} />
            <label className="flex items-center gap-2 text-sm" data-token="text">
              <input type="checkbox" defaultChecked /> 알림
            </label>
            <label className="flex items-center gap-2 text-sm" data-token="text">
              <input type="radio" name="vis" defaultChecked /> Public
            </label>
            <input type="range" className="w-full" defaultValue={40} />
            <input className="pv-input" type="date" data-token="surface" />
            <div className="rounded-xl border border-dashed border-[var(--color-border-default)] px-3 py-5 text-center text-xs" data-token="surface">
              <span data-token="text">업로드</span>
            </div>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <p className="text-sm" data-token="text">
              Northwind · Team
            </p>
            <p className="text-xs text-[var(--color-danger-text)]">이름을 다시 확인하세요.</p>
            <p className="text-xs text-[var(--color-text-secondary)]" data-token="text">
              제출하면 멤버에게 보입니다.
            </p>
          </>
        ) : null}
      </div>
      <div className="px-5 pb-3">
        {step < 2 ? (
          <button className="pv-btn pv-btn-primary w-full" type="button" data-token="primary" onClick={() => setStep((value) => value + 1)}>
            다음
          </button>
        ) : (
          <button className="pv-btn pv-btn-primary w-full" type="button" data-token="primary" onClick={onSubmit}>
            제출
          </button>
        )}
      </div>
    </div>
  );
}
