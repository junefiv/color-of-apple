"use client";

import {
  InteractiveAccordion,
  InteractiveActions,
  InteractiveDialog,
  InteractiveFields,
  InteractiveStates,
  InteractiveSwitch,
  InteractiveTabs,
  InteractiveTooltip,
  KitCard,
} from "../interactive-kit";

export function AppMore({
  onSheet,
  onBack,
}: {
  onSheet?: () => void;
  onBack?: () => void;
} = {}) {
  return (
    <div className="space-y-3 px-4 py-4">
      <div>
        {onBack ? (
          <button className="mb-2 text-sm text-[var(--color-primary-text)]" type="button" onClick={onBack}>
            ← Back
          </button>
        ) : null}
        <h2 className="text-xl font-semibold">설정</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">토큰이 붙은 컴포넌트를 여기서 만져봅니다.</p>
      </div>
      <KitCard title="Actions">
        <InteractiveActions />
      </KitCard>
      <KitCard title="Inputs">
        <InteractiveFields />
      </KitCard>
      <KitCard title="Switch">
        <InteractiveSwitch />
      </KitCard>
      <KitCard title="Tabs">
        <InteractiveTabs />
      </KitCard>
      <KitCard title="Accordion">
        <InteractiveAccordion />
      </KitCard>
      <KitCard title="Tooltip">
        <InteractiveTooltip />
      </KitCard>
      <KitCard title="Modal">
        <InteractiveDialog />
      </KitCard>
      <KitCard title="States">
        <InteractiveStates />
      </KitCard>
      <button className="pv-btn pv-btn-primary w-full" type="button" onClick={onSheet}>
        인증 옵션 시트
      </button>
    </div>
  );
}
