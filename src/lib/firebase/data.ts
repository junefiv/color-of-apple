import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import type { GenerateInput } from "@/lib/color-engine";
import type { Locale } from "@/lib/copy";
import { getFirebaseDb } from "./client";

export const FREE_PROJECT_LIMIT = 5;
export const FREE_GENERATION_LIMIT = 5;
export const FREE_EXPORT_LIMIT = 5;

export type Plan = "free" | "pro";
export type QuotaKind = "generation" | "export";

export type UserProfile = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  plan: Plan;
};

export type SavedProject = {
  id: string;
  title: string;
  input: GenerateInput;
  selectedPaletteId: string;
  overrides: Record<string, string>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UsageSnapshot = {
  generationCount: number;
  exportCount: number;
};

export class QuotaLimitError extends Error {
  constructor(
    public readonly kind: QuotaKind,
    public readonly resetAt: Date,
  ) {
    super(`${kind} quota exceeded`);
    this.name = "QuotaLimitError";
  }
}

export class ProjectLimitError extends Error {
  constructor() {
    super("project limit exceeded");
    this.name = "ProjectLimitError";
  }
}

export function isPlanRequiredError(error: unknown) {
  return error instanceof QuotaLimitError || error instanceof ProjectLimitError;
}

export function getUtcQuotaWindow(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const slot = now.getUTCHours() < 12 ? 0 : 12;
  const start = new Date(Date.UTC(year, month - 1, day, slot));
  const end = new Date(start.getTime() + 12 * 60 * 60 * 1000);

  return { id: String(slot), year, month, day, slot, start, end };
}

export async function ensureUserProfile(user: User) {
  const reference = doc(getFirebaseDb(), "users", user.uid);
  const snapshot = await getDoc(reference);
  const profile = {
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };

  if (snapshot.exists()) {
    await setDoc(reference, profile, { merge: true });
    return;
  }

  await setDoc(reference, {
    ...profile,
    plan: "free",
    createdAt: serverTimestamp(),
  });
}

export function subscribeUserProfile(uid: string, onValue: (profile: UserProfile | null) => void): Unsubscribe {
  return onSnapshot(
    doc(getFirebaseDb(), "users", uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onValue(null);
        return;
      }
      const value = snapshot.data();
      onValue({
        displayName: typeof value.displayName === "string" ? value.displayName : null,
        email: typeof value.email === "string" ? value.email : null,
        photoURL: typeof value.photoURL === "string" ? value.photoURL : null,
        plan: value.plan === "pro" ? "pro" : "free",
      });
    },
    () => onValue(null),
  );
}

export async function consumeQuota(uid: string, kind: QuotaKind) {
  const database = getFirebaseDb();
  const userReference = doc(database, "users", uid);
  const window = getUtcQuotaWindow();
  const usageReference = doc(database, "users", uid, "usage", window.id);
  const limit = kind === "generation" ? FREE_GENERATION_LIMIT : FREE_EXPORT_LIMIT;

  return runTransaction(database, async (transaction) => {
    const userSnapshot = await transaction.get(userReference);
    if (!userSnapshot.exists()) throw new Error("user profile is missing");
    if (userSnapshot.data().plan === "pro") return { used: 0, limit: Number.POSITIVE_INFINITY, resetAt: window.end };

    const usageSnapshot = await transaction.get(usageReference);
    const previous = usageSnapshot.data();
    const sameWindow = previous
      && previous.year === window.year
      && previous.month === window.month
      && previous.day === window.day
      && previous.slot === window.slot;
    const generationCount = sameWindow ? Number(previous.generationCount ?? 0) : 0;
    const exportCount = sameWindow ? Number(previous.exportCount ?? 0) : 0;
    const current = kind === "generation" ? generationCount : exportCount;

    if (current >= limit) throw new QuotaLimitError(kind, window.end);

    const nextGenerationCount = generationCount + (kind === "generation" ? 1 : 0);
    const nextExportCount = exportCount + (kind === "export" ? 1 : 0);
    transaction.set(usageReference, {
      year: window.year,
      month: window.month,
      day: window.day,
      slot: window.slot,
      generationCount: nextGenerationCount,
      exportCount: nextExportCount,
      updatedAt: serverTimestamp(),
    });

    return {
      used: kind === "generation" ? nextGenerationCount : nextExportCount,
      limit,
      resetAt: window.end,
    };
  });
}

export function subscribeCurrentUsage(uid: string, onValue: (usage: UsageSnapshot) => void): Unsubscribe {
  const window = getUtcQuotaWindow();
  return onSnapshot(
    doc(getFirebaseDb(), "users", uid, "usage", window.id),
    (snapshot) => {
      const value = snapshot.data();
      const sameWindow = value
        && value.year === window.year
        && value.month === window.month
        && value.day === window.day
        && value.slot === window.slot;
      onValue({
        generationCount: sameWindow ? Number(value.generationCount ?? 0) : 0,
        exportCount: sameWindow ? Number(value.exportCount ?? 0) : 0,
      });
    },
    () => onValue({ generationCount: 0, exportCount: 0 }),
  );
}

function projectFromDocument(snapshot: QuerySnapshot<DocumentData>["docs"][number]): SavedProject {
  const value = snapshot.data();
  return {
    id: snapshot.id,
    title: String(value.title ?? "Color palette"),
    input: value.input as GenerateInput,
    selectedPaletteId: String(value.selectedPaletteId),
    overrides: (value.overrides ?? {}) as Record<string, string>,
    createdAt: value.createdAt as Timestamp | undefined,
    updatedAt: value.updatedAt as Timestamp | undefined,
  };
}

export function subscribeProjects(uid: string, onValue: (projects: SavedProject[]) => void): Unsubscribe {
  const projectsQuery = query(
    collection(getFirebaseDb(), "users", uid, "projects"),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(
    projectsQuery,
    (snapshot) => onValue(snapshot.docs.map(projectFromDocument)),
    () => onValue([]),
  );
}

export async function saveProject({
  uid,
  projectId,
  input,
  selectedPaletteId,
  overrides,
}: {
  uid: string;
  projectId?: string | null;
  input: GenerateInput;
  selectedPaletteId: string;
  overrides: Record<string, string>;
}) {
  const database = getFirebaseDb();
  const projectData = {
    title: `${input.hex.toUpperCase()} palette`,
    input,
    selectedPaletteId,
    overrides,
    updatedAt: serverTimestamp(),
  };

  if (projectId) {
    await setDoc(doc(database, "users", uid, "projects", projectId), projectData, { merge: true });
    return projectId;
  }

  return runTransaction(database, async (transaction) => {
    const userSnapshot = await transaction.get(doc(database, "users", uid));
    if (!userSnapshot.exists()) throw new Error("user profile is missing");

    if (userSnapshot.data().plan === "pro") {
      const reference = doc(collection(database, "users", uid, "projects"));
      transaction.set(reference, { ...projectData, createdAt: serverTimestamp() });
      return reference.id;
    }

    const slots = Array.from({ length: FREE_PROJECT_LIMIT }, (_, index) => (
      doc(database, "users", uid, "projects", `slot-${index + 1}`)
    ));
    const snapshots = await Promise.all(slots.map((reference) => transaction.get(reference)));
    const openIndex = snapshots.findIndex((snapshot) => !snapshot.exists());
    if (openIndex < 0) throw new ProjectLimitError();

    transaction.set(slots[openIndex], { ...projectData, createdAt: serverTimestamp() });
    return slots[openIndex].id;
  });
}

export async function deleteProject(uid: string, projectId: string) {
  await deleteDoc(doc(getFirebaseDb(), "users", uid, "projects", projectId));
}

export function quotaErrorMessage(error: unknown, locale: Locale) {
  if (error instanceof QuotaLimitError) {
    const time = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(error.resetAt);
    if (locale === "ko") return `무료 한도를 모두 사용했어요. UTC ${time}에 다시 사용할 수 있습니다.`;
    return `You have reached the free limit. It resets at ${time} UTC.`;
  }
  if (error instanceof ProjectLimitError) {
    return locale === "ko"
      ? "무료 프로젝트 5개를 모두 사용했어요. 기존 프로젝트를 삭제하거나 Pro로 업그레이드하세요."
      : "All 5 free project slots are in use. Delete one or upgrade to Pro.";
  }
  return locale === "ko" ? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." : "Something went wrong. Please try again.";
}
