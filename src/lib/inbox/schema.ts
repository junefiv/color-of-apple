export const INBOX_COOLDOWN_MS = 5 * 60 * 1000;
export const INBOX_COOLDOWN_STORAGE_KEY = "matchu:inbox-cooldown-until";

export const inquiryTopics = ["general", "collaboration", "bug", "feature", "billing", "press", "other"] as const;
export type InquiryTopic = (typeof inquiryTopics)[number];

export const joinRoles = ["engineering", "design", "product", "marketing", "operations", "other"] as const;
export type JoinRole = (typeof joinRoles)[number];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InboxRecord = {
  collection: "joinRequests" | "inquiries";
  email: string;
  data: Record<string, string>;
};

function text(value: unknown, max: number, required: boolean, multiline = false): string | null {
  if (typeof value !== "string") return required ? null : "";
  const normalized = multiline ? value.replace(/\r\n/g, "\n").trim() : value.trim().replace(/\s+/g, " ");
  if (!normalized) return required ? null : "";
  if (normalized.length > max) return null;
  return normalized;
}

function email(value: unknown, required: boolean): string | null {
  const normalized = text(value, 254, required)?.toLowerCase();
  if (normalized == null) return null;
  if (!normalized) return required ? null : "";
  return emailPattern.test(normalized) ? normalized : null;
}

function localeOf(value: unknown): "ko" | "en" {
  return value === "en" ? "en" : "ko";
}

export function parseInbox(body: unknown): InboxRecord | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  const locale = localeOf(input.locale);
  const name = text(input.name, 80, true);
  const replyEmail = email(input.email, true);
  if (!name || !replyEmail) return null;

  if (input.kind === "join") {
    const role = text(input.role, 40, true);
    const message = text(input.message, 4000, true, true);
    const link = text(input.link, 300, false);
    if (!role || !joinRoles.includes(role as JoinRole) || !message || link == null) return null;
    const data: Record<string, string> = { name, email: replyEmail, role, message, locale };
    if (link) data.link = link;
    return { collection: "joinRequests", email: replyEmail, data };
  }

  if (input.kind !== "inquiry") return null;
  const topic = text(input.topic, 40, true);
  const message = text(input.message, 4000, true, true);
  if (!topic || !inquiryTopics.includes(topic as InquiryTopic) || !message) return null;

  const data: Record<string, string> = { topic, name, email: replyEmail, message, locale };
  if (topic === "collaboration" || topic === "press") {
    const organization = text(input.organization, 120, true);
    if (!organization) return null;
    data.organization = organization;
  }
  if (topic === "collaboration") {
    const link = text(input.link, 300, false);
    if (link == null) return null;
    if (link) data.link = link;
  }
  if (topic === "bug") {
    const page = text(input.page, 300, true);
    if (!page) return null;
    data.page = page;
  }
  if (topic === "billing") {
    const reference = text(input.reference, 120, true);
    const billingEmail = email(input.billingEmail, false);
    if (!reference || billingEmail == null) return null;
    data.reference = reference;
    if (billingEmail) data.billingEmail = billingEmail;
  }
  if (topic === "press") {
    const deadline = text(input.deadline, 80, false);
    if (deadline == null) return null;
    if (deadline) data.deadline = deadline;
  }
  if (topic === "other") {
    const subject = text(input.subject, 120, true);
    if (!subject) return null;
    data.subject = subject;
  }
  return { collection: "inquiries", email: replyEmail, data };
}
