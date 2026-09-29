import { describe, expect, it } from "vitest";
import { getUtcQuotaWindow } from "@/lib/firebase/data";

describe("UTC quota windows", () => {
  it("uses the midnight window before 12:00 UTC", () => {
    const window = getUtcQuotaWindow(new Date("2026-09-29T11:59:59.000Z"));
    expect(window.id).toBe("0");
    expect(window.start.toISOString()).toBe("2026-09-29T00:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-09-29T12:00:00.000Z");
  });

  it("uses the noon window from 12:00 UTC", () => {
    const window = getUtcQuotaWindow(new Date("2026-09-29T12:00:00.000Z"));
    expect(window.id).toBe("12");
    expect(window.start.toISOString()).toBe("2026-09-29T12:00:00.000Z");
    expect(window.end.toISOString()).toBe("2026-09-30T00:00:00.000Z");
  });
});
