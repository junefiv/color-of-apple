import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasAvailableProjectSlot } from "@/lib/firebase/data";

const mocks = vi.hoisted(() => ({ getDoc: vi.fn(), getDocs: vi.fn() }));
vi.mock("@/lib/firebase/client", () => ({ getFirebaseDb: () => ({}) }));
vi.mock("firebase/firestore", () => ({
  doc: (...parts: unknown[]) => parts,
  collection: (...parts: unknown[]) => parts,
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
}));

describe("new colorbook capacity", () => {
  beforeEach(() => {
    mocks.getDoc.mockReset();
    mocks.getDocs.mockReset();
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ plan: "free" }) });
  });

  it("requires freeing a slot when all free slots are occupied", async () => {
    mocks.getDocs.mockResolvedValue({ docs: [1, 2, 3, 4, 5].map(i => ({ id: `slot-${i}` })) });
    expect(await hasAvailableProjectSlot("user")).toBe(false);
  });

  it("allows saving after a slot is deleted, even with older extra projects", async () => {
    mocks.getDocs.mockResolvedValue({ docs: ["slot-1", "slot-2", "slot-4", "slot-5", "old-project"].map(id => ({ id })) });
    expect(await hasAvailableProjectSlot("user")).toBe(true);
  });

  it("does not limit pro users to the free slots", async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ plan: "pro" }) });
    mocks.getDocs.mockResolvedValue({ docs: [1, 2, 3, 4, 5].map(i => ({ id: `slot-${i}` })) });
    expect(await hasAvailableProjectSlot("user")).toBe(true);
  });

  it("fails the precheck when reading storage fails", async () => {
    mocks.getDocs.mockRejectedValue(new Error("offline"));
    await expect(hasAvailableProjectSlot("user")).rejects.toThrow("offline");
  });
});
