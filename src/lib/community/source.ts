export type ProjectSource = {
  kind: "community";
  postId: string;
  authorName: string;
  href: string;
};

export function readProjectSource(value: unknown): ProjectSource | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  if (source.kind !== "community") return null;
  if (typeof source.postId !== "string" || !/^[A-Za-z0-9]{8,128}$/.test(source.postId)) return null;
  if (typeof source.authorName !== "string") return null;
  const authorName = source.authorName.trim();
  if (authorName.length < 1 || authorName.length > 30) return null;
  if (typeof source.href !== "string" || !/^\/community\?post=[A-Za-z0-9]{8,128}$/.test(source.href)) return null;
  return { kind: "community", postId: source.postId, authorName, href: source.href };
}
