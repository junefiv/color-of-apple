import { PhoneFrame } from "../phone-frame";

export function AppForm() {
  return (
    <PhoneFrame>
      <div className="flex min-h-[640px] flex-col">
        <div className="space-y-4 px-5 pt-5">
          <h2 className="text-xl font-semibold">Page title</h2>
          <input className="pv-input" defaultValue="Text field" readOnly />
          <textarea className="pv-input min-h-24" defaultValue="Supporting text" readOnly />
          <select className="pv-input">
            <option>Select</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked readOnly /> Checkbox
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" defaultChecked readOnly /> Option one
          </label>
          <input type="range" className="w-full" defaultValue={40} readOnly />
          <p className="text-xs text-[var(--color-text-tertiary)]">Helper text</p>
          <p className="text-xs text-[var(--color-text-danger)]">Error text</p>
        </div>
        <div className="mt-auto p-5">
          <button className="pv-btn pv-btn-primary w-full" type="button">
            Primary action
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
