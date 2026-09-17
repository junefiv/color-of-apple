function StateRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-center gap-3">
      <p className="text-[11px] text-[var(--color-text-tertiary)]">{label}</p>
      {children}
    </div>
  );
}

export function WebStates() {
  return (
    <div className="grid gap-4 bg-[var(--color-bg-canvas)] p-4 md:grid-cols-2">
      <section className="pv-card space-y-3 p-4">
        <h3 className="text-sm font-semibold">Button</h3>
        <StateRow label="Default">
          <button className="pv-btn pv-btn-primary" type="button">
            Primary action
          </button>
        </StateRow>
        <StateRow label="Hover">
          <button className="pv-btn" style={{ background: "var(--color-primary-hover)", color: "var(--color-primary-on)" }} type="button">
            Primary action
          </button>
        </StateRow>
        <StateRow label="Active">
          <button className="pv-btn" style={{ background: "var(--color-primary-pressed)", color: "var(--color-primary-on)" }} type="button">
            Primary action
          </button>
        </StateRow>
        <StateRow label="Focus">
          <button className="pv-btn pv-btn-primary ring-2 ring-[var(--color-interaction-focus-ring)]" type="button">
            Primary action
          </button>
        </StateRow>
        <StateRow label="Disabled">
          <button className="pv-btn" data-disabled="true" type="button">
            Primary action
          </button>
        </StateRow>
        <StateRow label="Loading">
          <button className="pv-btn pv-btn-primary opacity-70" type="button">
            …
          </button>
        </StateRow>
      </section>
      <section className="pv-card space-y-3 p-4">
        <h3 className="text-sm font-semibold">Input</h3>
        {["Default", "Hover", "Focus", "Filled", "Error", "Disabled"].map((label) => (
          <StateRow key={label} label={label}>
            <input
              className="pv-input"
              data-error={label === "Error"}
              disabled={label === "Disabled"}
              defaultValue={label === "Filled" ? "Text input" : ""}
              placeholder={label}
              readOnly
              style={
                label === "Hover"
                  ? { background: "var(--color-interaction-hover)" }
                  : label === "Focus"
                    ? { outline: "2px solid var(--color-border-focus)" }
                    : undefined
              }
            />
          </StateRow>
        ))}
      </section>
      <section className="pv-card space-y-3 p-4">
        <h3 className="text-sm font-semibold">Menu</h3>
        {["Default", "Hover", "Selected", "Disabled"].map((label) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background:
                label === "Hover"
                  ? "var(--color-interaction-hover)"
                  : label === "Selected"
                    ? "var(--color-interaction-selected)"
                    : "transparent",
              color:
                label === "Disabled"
                  ? "var(--color-text-disabled)"
                  : "var(--color-text-primary)",
            }}
          >
            {label}
          </div>
        ))}
      </section>
      <section className="pv-card space-y-3 p-4">
        <h3 className="text-sm font-semibold">Table row / Checkbox</h3>
        {["Default", "Hover", "Selected"].map((label) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background:
                label === "Hover"
                  ? "var(--color-interaction-hover)"
                  : label === "Selected"
                    ? "var(--color-interaction-selected)"
                    : "var(--color-surface-default)",
            }}
          >
            {label} row
          </div>
        ))}
        <div className="flex flex-wrap gap-3 text-sm">
          <label><input type="checkbox" readOnly /> Unchecked</label>
          <label><input type="checkbox" defaultChecked readOnly /> Checked</label>
          <label><input type="checkbox" defaultChecked readOnly /> Indeterminate</label>
          <label className="text-[var(--color-text-disabled)]">
            <input type="checkbox" disabled /> Disabled
          </label>
        </div>
      </section>
    </div>
  );
}
