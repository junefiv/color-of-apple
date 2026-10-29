import { record, text } from "./config-check";

// Small words the component frames print around the user's content (utility links, labels, units).
// They live in an optional `texts` map on each config so older saved layouts stay valid, and every
// one of them can be rewritten from the settings panel.
export type Texts = Record<string, string>;
export type TextDef = readonly [key: string, label: string, fallback: string];

export const headerTexts: readonly TextDef[] = [["topLeft", "상단 바 왼쪽", "새 소식을 확인하세요"], ["topRight", "상단 바 오른쪽", "고객센터 · 로그인 · 회원가입 · ENG"],
  ["language", "언어 버튼", "KOR"], ["login", "로그인 버튼", "로그인"], ["menuTitle", "펼친 메뉴 제목", "메뉴"], ["mobileLanguage", "모바일 언어 표시", "KOR / ENG"]];
export const heroTexts: readonly TextDef[] = [["cardTitle", "공지 카드 제목", "공지사항"], ["cardText", "공지 카드 내용", "새로운 소식을 확인하세요"], ["cardDate", "공지 카드 날짜", "2026.10.29"],
  ["ticker", "티커 단어 (쉼표)", "새 컬렉션, 브랜드 스토리, 이벤트, 오프라인 스토어, 멤버십"]];
export const ctaTexts: readonly TextDef[] = [["countValues", "카운트다운 숫자 (쉼표)", "03, 14, 27, 50"], ["countUnits", "카운트다운 단위 (쉼표)", "일, 시간, 분, 초"]];
export const footerTexts: readonly TextDef[] = [["family", "패밀리 사이트 문구", "Family Site"], ["top", "맨 위로 문구", "TOP"], ["newsPlaceholder", "구독 입력 안내", "이메일 주소"]];
export const floatingTexts: readonly TextDef[] = [["top", "맨 위로 문구", "TOP"]];

export const tx = (texts: Texts | undefined, defs: readonly TextDef[], key: string) => texts?.[key] ?? defs.find(d => d[0] === key)?.[2] ?? "";
export const csvText = (value: string) => value.split(",").map(s => s.trim()).filter(Boolean);
export const validTexts = (value: unknown) => value === undefined || (record(value) && Object.keys(value).length <= 30 && Object.values(value).every(v => text(v, 160)));
