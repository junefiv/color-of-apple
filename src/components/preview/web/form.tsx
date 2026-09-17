export function WebForm() {
  return (
    <div className="min-h-[540px] bg-[var(--color-bg-canvas)] p-5">
      <div className="pv-card mx-auto max-w-xl p-5">
        <h2 className="text-lg font-semibold">Page title</h2>
        <p className="mb-5 text-sm text-[var(--color-text-secondary)]">Supporting text</p>
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]">Label</span>
            <input className="pv-input" defaultValue="Text input" readOnly />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]">Label</span>
            <select className="pv-input">
              <option>Option one</option>
              <option>Option two</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--color-text-secondary)]">Label</span>
            <textarea className="pv-input min-h-20" defaultValue="Supporting text" readOnly />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
            <label className="flex items-center gap-2">
              <input type="radio" defaultChecked readOnly /> Option one
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" readOnly /> Option two
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked readOnly /> Checkbox
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="h-5 w-9 rounded-full bg-[var(--color-primary-default)] p-0.5">
              <span className="ml-auto block size-4 rounded-full bg-[var(--color-primary-on)]" />
            </span>
            Switch
          </label>
          <p className="text-xs text-[var(--color-text-tertiary)]">Helper text</p>
          <p className="text-xs text-[var(--color-text-danger)]">Error message</p>
          <input className="pv-input" data-error="true" defaultValue="Text input" readOnly />
          <input className="pv-input opacity-60" disabled defaultValue="Disabled" />
          <div className="flex justify-end gap-2 pt-2">
            <button className="pv-btn pv-btn-outline" type="button">
              Secondary action
            </button>
            <button className="pv-btn pv-btn-primary" type="button">
              Primary action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
