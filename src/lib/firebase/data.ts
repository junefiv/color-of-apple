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
import type { ColorHistoryEntry } from "@/lib/project-tokens";
import { getFirebaseDb } from "./client";

export const FREE_PROJECT_LIMIT = 5;

export type Plan = "free" | "pro";

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
  tokenSnapshot: Record<string, string>;
  colorHistory: ColorHistoryEntry[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export class ProjectLimitError extends Error {
  constructor() {
    super("project limit exceeded");
    this.name = "ProjectLimitError";
  }
}

export function isPlanRequiredError(error: unknown) {
  return error instanceof ProjectLimitError;
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

function projectFromDocument(snapshot: QuerySnapshot<DocumentData>["docs"][number]): SavedProject {
  const value = snapshot.data();
  return {
    id: snapshot.id,
    title: String(value.title ?? "Color palette"),
    input: value.input as GenerateInput,
    selectedPaletteId: String(value.selectedPaletteId),
    overrides: (value.overrides ?? {}) as Record<string, string>,
    tokenSnapshot: (value.tokenSnapshot ?? {}) as Record<string, string>,
    colorHistory: Array.isArray(value.colorHistory) ? value.colorHistory as ColorHistoryEntry[] : [],
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
  title,
  input,
  selectedPaletteId,
  overrides,
  tokenSnapshot,
  historyEntries = [],
}: {
  uid: string;
  projectId?: string | null;
  title: string;
  input: GenerateInput;
  selectedPaletteId: string;
  overrides: Record<string, string>;
  tokenSnapshot: Record<string, string>;
  historyEntries?: ColorHistoryEntry[];
}) {
  const database = getFirebaseDb();
  const projectData = {
    title: title.trim().slice(0, 60),
    input,
    selectedPaletteId,
    overrides,
    tokenSnapshot,
    updatedAt: serverTimestamp(),
  };

  if (projectId) {
    const reference = doc(database, "users", uid, "projects", projectId);
    await runTransaction(database, async (transaction) => {
      const snapshot = await transaction.get(reference);
      const previousHistory = snapshot.exists() && Array.isArray(snapshot.data().colorHistory)
        ? snapshot.data().colorHistory as ColorHistoryEntry[]
        : [];
      transaction.set(reference, {
        ...projectData,
        colorHistory: [...previousHistory, ...historyEntries].slice(-500),
      }, { merge: true });
    });
    return projectId;
  }

  return runTransaction(database, async (transaction) => {
    const userSnapshot = await transaction.get(doc(database, "users", uid));
    if (!userSnapshot.exists()) throw new Error("user profile is missing");

    if (userSnapshot.data().plan === "pro") {
      const reference = doc(collection(database, "users", uid, "projects"));
      transaction.set(reference, { ...projectData, colorHistory: historyEntries.slice(-500), createdAt: serverTimestamp() });
      return reference.id;
    }

    const slots = Array.from({ length: FREE_PROJECT_LIMIT }, (_, index) => (
      doc(database, "users", uid, "projects", `slot-${index + 1}`)
    ));
    const snapshots = await Promise.all(slots.map((reference) => transaction.get(reference)));
    const openIndex = snapshots.findIndex((snapshot) => !snapshot.exists());
    if (openIndex < 0) throw new ProjectLimitError();

    transaction.set(slots[openIndex], { ...projectData, colorHistory: historyEntries.slice(-500), createdAt: serverTimestamp() });
    return slots[openIndex].id;
  });
}

export async function deleteProject(uid: string, projectId: string) {
  await deleteDoc(doc(getFirebaseDb(), "users", uid, "projects", projectId));
}

export function quotaErrorMessage(error: unknown, locale: Locale) {
  if (error instanceof ProjectLimitError) {
    return locale === "ko"
      ? "무료 저장 공간 5개를 모두 사용했어요. 저장한 컬러를 삭제하거나 Pro로 업그레이드하세요."
      : "All 5 free saved-color slots are in use. Delete one or upgrade to Pro.";
  }
  return locale === "ko" ? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." : "Something went wrong. Please try again.";
}
