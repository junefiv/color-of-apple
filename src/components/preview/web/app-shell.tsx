import { MiniChart, StatusBadge, rows } from "../shared";

const nav = ["Overview", "Activity", "Library", "Settings"];

export function WebAppShell() {
  return (
    <div className="flex min-h-[540px] overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-canvas)]">
      <aside className="hidden w-44 shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] p-3 md:block">
        <div className="mb-4 px-2 text-xs font-semibold tracking-[0.18em] text-[var(--color-text-tertiary)]">
          LOGO
        </div>
        <nav className="space-y-1">
          {nav.map((item, index) => (
            <div
              key={item}
              className="rounded-lg px-2.5 py-2 text-sm"
              style={
                index === 0
                  ? {
                      background: "var(--color-primary-subtle)",
                      color: "var(--color-primary-text)",
                    }
                  : { color: "var(--color-text-secondary)" }
              }
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] px-4 py-3">
          <input className="pv-input max-w-xs" defaultValue="Search" readOnly />
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            Help
            <span className="grid size-7 place-items-center rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]">
              P
            </span>
          </div>
        </header>
        <main className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Page title</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Supporting text</p>
            </div>
            <div className="flex gap-2">
              <button className="pv-btn pv-btn-outline" type="button">
                Secondary action
              </button>
              <button className="pv-btn pv-btn-primary" type="button">
                Primary action
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["1,284", "72%", "+12.5%"].map((value) => (
              <div key={value} className="pv-card p-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">Supporting text</p>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="pv-card p-3">
              <p className="mb-3 text-sm font-medium">Content / Chart</p>
              <MiniChart />
            </div>
            <div className="pv-card p-3">
              <p className="mb-3 text-sm font-medium">Recent items</p>
              <ul className="space-y-2 text-sm">
                {rows.map((row) => (
                  <li key={row.status} className="flex items-center justify-between">
                    <span>{row.title}</span>
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
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pv-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Item title</th>
                  <th className="px-3 py-2 font-medium">Supporting text</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.status}
                    style={
                      index === 1
                        ? { background: "var(--color-interaction-selected)" }
                        : undefined
                    }
                  >
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
          </div>
        </main>
      </div>
    </div>
  );
}
