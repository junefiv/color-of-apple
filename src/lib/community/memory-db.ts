import type { CommunityDatabase, CommunityTx, StoredDoc } from "./types";

type Pending = { op: "set"; data: Record<string, unknown> } | { op: "delete" };

export class MemoryCommunityDb implements CommunityDatabase {
  readonly docs = new Map<string, Record<string, unknown>>();
  reads = 0;
  writes = 0;

  async runTransaction<T>(run: (tx: CommunityTx) => Promise<T>) {
    const pending = new Map<string, Pending>();
    const tx: CommunityTx = {
      get: async (path) => {
        this.reads += 1;
        const change = pending.get(path);
        if (change?.op === "delete") return null;
        const data = change?.op === "set" ? change.data : this.docs.get(path);
        if (!data) return null;
        return { id: path.split("/").at(-1) ?? path, path, data: { ...data } };
      },
      set: (path, data) => {
        this.writes += 1;
        pending.set(path, { op: "set", data: { ...data } });
      },
      delete: (path) => {
        this.writes += 1;
        pending.set(path, { op: "delete" });
      },
      list: async (collectionPath) => {
        const prefix = `${collectionPath}/`;
        const paths = new Set<string>([
          ...this.docs.keys(),
          ...pending.keys(),
        ]);
        const docs: StoredDoc[] = [];
        for (const path of paths) {
          if (!path.startsWith(prefix) || path.slice(prefix.length).includes("/")) continue;
          this.reads += 1;
          const change = pending.get(path);
          if (change?.op === "delete") continue;
          const data = change?.op === "set" ? change.data : this.docs.get(path);
          if (!data) continue;
          docs.push({ id: path.slice(prefix.length), path, data: { ...data } });
        }
        return docs;
      },
    };
    const result = await run(tx);
    for (const [path, change] of pending) {
      if (change.op === "delete") this.docs.delete(path);
      else this.docs.set(path, change.data);
    }
    return result;
  }
}
