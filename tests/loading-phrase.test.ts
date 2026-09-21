import { describe, expect, it } from "vitest";
import { parseLoadingPhraseTemplate } from "@/components/flow/loading-phrase";
import { ko } from "@/lib/copy/ko";

describe("loading phrase", () => {
  it("parses hex and count placeholders from ko templates", () => {
    const [first, second, third] = ko.loading.phrases;

    expect(parseLoadingPhraseTemplate(first)).toEqual([
      { type: "text", value: "선택하신 " },
      { type: "hex" },
      { type: "text", value: "을 분석하고 있어요." },
    ]);

    expect(parseLoadingPhraseTemplate(second)).toEqual([
      { type: "hex" },
      { type: "text", value: " 컬러에 맞는 팔레트를 생성하고 있어요." },
    ]);

    expect(parseLoadingPhraseTemplate(third)).toEqual([
      { type: "count" },
      { type: "text", value: "종의 컬러 팔레트가 준비되었어요." },
    ]);
  });
});
