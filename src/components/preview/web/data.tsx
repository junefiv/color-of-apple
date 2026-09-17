import { StatusBadge, rows } from "../shared";

export function WebData() {
  return (
    <div className="min-h-[540px] space-y-4 bg-[var(--color-bg-canvas)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Page title</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">24 items</p>
        </div>
        <div className="flex gap-2">
          <input className="pv-input w-44" defaultValue="Search" readOnly />
          <button className="pv-btn pv-btn-outline" type="button">
            Filter
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        {["All", "Active", "Pending"].map((chip, index) => (
          <span key={chip} className="pv-chip" data-selected={index === 0}>
            {chip}
          </span>
        ))}
      </div>
      <div className="pv-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
            <tr>
              <th className="px-3 py-2">
                <input type="checkbox" readOnly />
              </th>
              <th className="px-3 py-2 font-medium">Item title</th>
              <th className="px-3 py-2 font-medium">Supporting text</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.status}
                className="border-t border-[var(--color-border-subtle)]"
                style={
                  index === 0
                    ? { background: "var(--color-interaction-selected)" }
                    : undefined
                }
              >
                <td className="px-3 py-2">
                  <input type="checkbox" defaultChecked={index === 0} readOnly />
                </td>
                <td className="px-3 py-2">{row.title}</td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.meta}</td>
                <td className="px-3 py-2">
                  <StatusBadge
                    tone={
                      row.status === "Active"
                        ? "success"
                        : row.status === "Pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {row.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
          <span>1 / 8</span>
          <div className="flex gap-1">
            <button className="pv-btn pv-btn-ghost" type="button">
              Prev
            </button>
            <button className="pv-btn pv-btn-outline" type="button">
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="pv-card p-8 text-center">
        <p className="font-medium">Empty state</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Supporting text</p>
      </div>
    </div>
  );
}
