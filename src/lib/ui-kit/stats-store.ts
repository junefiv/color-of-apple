import { FieldValue } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";
import type { LibraryItemId } from "@/components/preview/library/catalog";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { statsFromDocs, type UiKitStats } from "./stats";

const COLLECTION = "uiKitStats";

async function readUiKitStats(): Promise<UiKitStats> {
  const snapshot = await getFirebaseAdminDb().collection(COLLECTION).get();
  return statsFromDocs(snapshot.docs.map((doc) => {
    const data = doc.data();
    return { id: doc.id, viewCount: data.viewCount, copyCount: data.copyCount };
  }));
}

export const cachedUiKitStats = unstable_cache(readUiKitStats, ["ui-kit-stats"], { revalidate: 60 });

export async function bumpUiKitStat(id: LibraryItemId, kind: "view" | "copy") {
  const field = kind === "view" ? "viewCount" : "copyCount";
  await getFirebaseAdminDb().collection(COLLECTION).doc(id).set({ [field]: FieldValue.increment(1) }, { merge: true });
}
