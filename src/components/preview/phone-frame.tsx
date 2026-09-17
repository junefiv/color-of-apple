export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[min(100%,390px)] overflow-hidden rounded-[2rem] border-8 border-[var(--color-border-strong)] bg-[var(--color-bg-canvas)] shadow-[0_20px_50px_var(--color-shadow-strong)]">
      <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-[var(--color-text-secondary)]">
        <span>9:41</span>
        <span>● ● ●</span>
      </div>
      <div className="min-h-[640px]">{children}</div>
    </div>
  );
}
