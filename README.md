# MATCHU

색 하나만 골라. 나머지는 MATCHU가 맞춰줄게.

MATCHU는 기준색 하나를 역할이 부여된 UI 컬러 시스템으로 바꿉니다. 작업대는 끝까지 무채색이고, 색은 MATCH를 누른 뒤에 미리보기와 핵심 CTA에만 퍼집니다. 로그인이나 서버 DB는 없습니다.

## Windows (C: / Documents)

클라우드 에이전트는 **당신 PC의 `C:\`에 파일을 쓸 수 없습니다.** 로컬에 같은 구조를 받으려면 **WSL**에서 Origin으로 클론합니다.

- Browse: https://cursor.com/codebase/daesung-digital/matchu (Private — 설정에서 변경 가능)
- Origin CLI: https://cursor.com/docs/origin/cli

**한 번에 설치 (WSL):**

```bash
bash scripts/setup-windows-documents.sh
```

기본 경로: `C:\Users\Administrator\Documents\matchu`

**PowerShell** (WSL 호출):

```powershell
.\scripts\setup-windows-documents.ps1
```

**수동 (WSL):**

```bash
curl -fsSL https://downloads.cursor.com/origin/install.sh | sh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
origin auth login
cd /mnt/c/Users/Administrator/Documents
origin repo clone daesung-digital/matchu
cd matchu && npm install && npm run dev
```

## 로컬 실행

```bash
npm install
npm run dev
```

개발 서버는 `http://127.0.0.1:43123`에서 뜹니다.

```bash
npm test
npm run build
```

## 쓰는 법

1. 무채색 작업대에서 HEX 하나를 고릅니다. MATCH 버튼만 그 색으로 바뀝니다.
2. MATCH를 누르면 팔레트 → 미리보기 배경 → 버튼·입력창 → 상태색 순으로 색이 퍼집니다.
3. 웹·앱 쇼케이스에서 라이트/다크를 확인합니다.
4. CSS / Tailwind / React Native / JSON으로 내보냅니다.
5. 공유 링크는 입력값을 URL에 압축합니다.

## 디자인 원칙

Color is the result, not the decoration.

- 편집 도구 영역은 차가운 뉴트럴을 유지합니다.
- 결과 미리보기와 MATCH 버튼에만 생성된 색을 씁니다.
- 로고는 MATCHU 옆에 작은 점만 Primary로 바뀝니다.
- 폰트는 Paperlogy(헤드라인) + SUIT Variable(UI) + Geist Mono(HEX)입니다.

## 컬러 엔진

- 색공간: OKLCH (`culori`)
- 입력 HEX는 가장 가까운 Primary 단계에 고정
- 버튼색은 대비가 확보되는 Primary 600–800을 고르고, 위 글자색은 자동 선택
- Neutral / Secondary / Status는 별도 생성하고, 상태색은 메인 색에서 파생하지 않습니다
- 맞닿는 토큰 쌍만 WCAG 대비 검사 후 자동 보정
- 결과는 결정적입니다. `ENGINE_VERSION`이 JSON에 포함됩니다.
