import { describe, expect, it } from "vitest";
import { INBOX_COOLDOWN_MS, parseInbox } from "@/lib/inbox/schema";

describe("inbox submissions", () => {
  it("keeps a five minute cooldown", () => {
    expect(INBOX_COOLDOWN_MS).toBe(5 * 60 * 1000);
  });

  it("accepts a general inquiry with a reply email", () => {
    const record = parseInbox({
      kind: "inquiry",
      topic: "general",
      locale: "ko",
      name: "이든",
      email: "Eden@Example.com",
      message: "팔레트 저장이 궁금합니다.",
    });
    expect(record).toMatchObject({
      collection: "inquiries",
      email: "eden@example.com",
      data: { topic: "general", email: "eden@example.com", locale: "ko" },
    });
  });

  it("asks collaboration messages for an organization", () => {
    expect(parseInbox({
      kind: "inquiry",
      topic: "collaboration",
      name: "Eden",
      email: "eden@example.com",
      message: "함께 만들고 싶습니다.",
    })).toBeNull();
  });

  it("accepts a join request with a role", () => {
    const record = parseInbox({
      kind: "join",
      role: "design",
      name: "Eden",
      email: "eden@example.com",
      link: "https://example.com",
      message: "색과 인터페이스를 다룹니다.",
      locale: "en",
    });
    expect(record?.collection).toBe("joinRequests");
    expect(record?.data.role).toBe("design");
  });

  it("rejects a billing inquiry without a transaction reference", () => {
    expect(parseInbox({
      kind: "inquiry",
      topic: "billing",
      name: "Eden",
      email: "eden@example.com",
      message: "환불을 확인하고 싶습니다.",
    })).toBeNull();
  });
});