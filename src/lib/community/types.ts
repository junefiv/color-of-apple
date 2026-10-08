import type { GenerateInput } from "@/lib/color-engine";
import type { ProjectSource } from "./source";

export const COMMUNITY_SCHEMA_VERSION = 1;
export const COMMUNITY_PAGE_SIZE = 12;

export type CommunitySort = "latest" | "liked" | "mine";
export type PublicSort = "latest" | "liked";
export type PostStatus = "published" | "hidden";

export type CommunityPalette = {
  input: GenerateInput;
  selectedPaletteId: string;
  tokenSnapshot: Record<string, string>;
  overrides: Record<string, string>;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  schemaVersion: number;
  engineVersion: string;
  likeCount: number;
  viewCount: number;
  palette: CommunityPalette;
  status?: PostStatus;
};

export type StoredPost = {
  id: string;
  ownerUid: string;
  authorName: string;
  title: string;
  description: string;
  tags: string[];
  status: PostStatus;
  publishedAt: number;
  updatedAt: number;
  schemaVersion: number;
  engineVersion: string;
  likeCount: number;
  viewCount: number;
  palette: CommunityPalette;
};

export type CommunityPage = {
  items: CommunityPost[];
  nextCursor: string | null;
};

export type PublishInput = {
  projectId: string;
  title: string;
  description: string;
  tags: string[];
};

export type PostPatch = {
  title?: string;
  description?: string;
  tags?: string[];
  status?: PostStatus;
  refreshPalette?: boolean;
};

export type CopyResult = {
  projectId: string;
  title: string;
  input: GenerateInput;
  selectedPaletteId: string;
  overrides: Record<string, string>;
  tokenSnapshot: Record<string, string>;
  source: ProjectSource;
  created: boolean;
};

export type StoredDoc = {
  id: string;
  path: string;
  data: Record<string, unknown>;
};

export interface CommunityTx {
  get(path: string): Promise<StoredDoc | null>;
  set(path: string, data: Record<string, unknown>): void;
  delete(path: string): void;
  list(collectionPath: string): Promise<StoredDoc[]>;
}

export interface CommunityDatabase {
  runTransaction<T>(run: (tx: CommunityTx) => Promise<T>): Promise<T>;
}
