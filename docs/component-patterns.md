# 컴포넌트 패턴 카탈로그 (헤더 외)

직접 빌드 모드(`src/components/builder/layout-builder.tsx`, `src/lib/page-layout.ts`)에 다음으로 들일 컴포넌트를 정하기 위해 GDWEB 선정작을 조사한 결과다. 헤더에서 한 방식(`src/lib/header-config.ts`)을 그대로 따른다. 사이트에서 반복되는 **구조**를 프리셋과 옵션으로 바꾸고, 색은 전부 팔레트 토큰 역할로 칠한다. 디자인을 베끼려는 것이 아니라 구조의 변형 폭을 파악하려는 조사다.

## 조사 방법

- 출처: `https://www.gdweb.co.kr/sub/list.asp` 1페이지(60건). 상세 페이지 `view.asp?str_no=…`(EUC-KR)에서 실제 사이트 URL을 추출했다.
- 제외: 헤더 조사에 이미 쓴 13곳(무신사 corp, 웨스틴 파르나스, UNIST, CJ온스타일 corp, BIFF, Genesis Space, 씨마크, Dtribe, 더플라자 다이닝, Etrium, HandsomeFish, Weekends, OKGO).
- 측정: 각 사이트를 1440×900과 390×844에서 열고 같은 DOM 프로브를 실행했다. 섹션 높이·배경(이미지/비디오/색), 섹션 안의 슬라이더·탭·폼·마키·아코디언, 반복 목록의 개수와 한 줄당 개수, 좌우 분할 비율, `position: fixed` 레이어(크기·위치), 팝업, 푸터 구성을 기록했다. 원자료는 프로브 출력에서 정리한 메모다.
- 한계: 스크롤 연동 애니메이션과 실제 전환 효과는 정적 측정에 잡히지 않는다. 웰크론디펜스는 모바일 리사이즈가 반영되지 않아 데스크톱 값만 있다. 새마을금고 보험(insure.kfcc.co.kr)은 브라우저에서 접속이 거부돼 제외했다.

### 조사한 사이트 (25곳)

| 사이트 | 성격 | 눈여겨본 컴포넌트 |
|---|---|---|
| ICEVAN (icevansnow.com) | B2B 제빙기 | 비디오 히어로 슬라이더, 탭+카드 슬라이더, 2×2 연락 CTA, 브랜드색 푸터 |
| MOZAIQ (mozaiq.co.kr) | 빌라 멤버십 | 지역 탭, 다크 상담 폼 섹션, 카운트다운 배지 CTA 버튼(PC 우상단 → 모바일 하단 바) |
| 세계로탑치과 (worldtopdental.com) | 병원 | 전체화면 공지 팝업 슬라이더, 우측 세로 퀵메뉴 → 모바일 하단 바, 원형 "빠른 신청" |
| 솔깃 (solgit.shinhan.com) | 금융 콘텐츠 | 썸네일 내비 히어로, 마키 카드 열, 3장 고정 → 모바일 가로 스크롤 |
| 잉글리쉬원 (egone.co.kr) | 학원 | 히어로 위 공지 카드, 우측 퀵메뉴, "오늘 하루 열지 않기" 레이어 팝업 |
| 플래닛 (plan-et.kr) | 템플릿 제작 | FAQ 아코디언, 이벤트 CTA를 품은 메가 푸터, 챗봇 패널 |
| MAKERVIL (makervil.com) | 브랜드 컴퍼니 | 올다크, 커서 따라오는 뉴스 미리보기, 고정 노출(reveal) 풀스크린 푸터 |
| eSTEEL4U (home.esteel4u.com) | 철강 이커머스 | 딤 + 여러 공지 슬라이드 팝업, 텍스트+버튼 배너 CTA, 패밀리 링크 푸터 |
| Soo (soofonts.com) | 폰트 마이크로사이트 | 글리프 그리드 11→4열, 라이브 타이핑 테스터 폼, 한 줄 푸터 |
| 콕뭉치 (kokmoongchi.com) | 동호회 앱 | 프라이머리 색 밴드, 스티키 텍스트+카드 스크롤, 채팅 FAB, 모바일 하단 탭바, 동의 카드 |
| 투모어스텝스 (twomos.com) | 웹 에이전시 | 텍스트 히어로, 칩 선택형 장문 문의 폼, 한 줄 푸터 |
| 카누 한정판 (kanu.co.kr) | 제품 프로모션 | 챕터별 색 장면 전환 스토리텔링, 채팅 위젯 |
| Samsung CSR (csr.samsung.com/en) | 기업 CSR | 세로 탭 리스트+패널, 필터 탭+카드, 아코디언 푸터(모바일), 쿠키 카드 |
| 이퓨전아이 (efusioni.com) | 웹 에이전시 | 가운데 열 오프셋 3열 포트폴리오 그리드 |
| KINORIA (kinoria.studio) | 스튜디오 | 단일 화면 WebGL 히어로(섹션 없음) |
| 코오롱 워크웨어 (kolonworkwear.com) | B2B 의류 | 50:50 히어로, 라벨+본문 12열 텍스트 섹션, CTA를 얹은 푸터 |
| 한미그룹 채용 (2026recruitment.hanmi.co.kr) | 채용 캠페인 | 직무 탭, 일정 탭+카드, 카운트다운 최종 CTA |
| 웰크론디펜스 (welcrondefense.com) | 방산 B2B | 다크 탭+슬라이더, 문의 CTA 섹션 |
| 천만문화재단 (chunman.or.kr) | 재단 | `<dialog>` 팝업(페이저), 슬라이더 → 모바일 세로 목록, 프라이머리 푸터+파트너 슬라이더, 모바일 하단 메뉴 |
| 더현대 서울 (thehyundaiseoul.ehyundai.com) | 백화점 | 띠 배너 히어로, 회색/검정/흰색 섹션 리듬, 영업시간 플로팅 카드, AI 말풍선 |
| 에브리봇 (everybot.co.kr) | 로봇청소기 | 패밀리 사이트 셀렉트 푸터, 접이식 바로가기 카드 |
| 트리니티항공 (brand.trinityairways.com) | 항공 브랜드 | 풀페이지 스냅, 좌측 진행 인디케이터, 파스텔 섹션, CTA 밴드 |
| 서울아트굿즈페스티벌 (sejongpac.or.kr) | 행사 | 포스터형 단일 화면, 상단 카운트다운 바, 후원 로고 푸터 |
| PhysicalWorks (physicalworks.ai) | AI 로보틱스 | 텍스트 히어로, 마무리 CTA 밴드 |
| HILO WAVE (hilowave.co.kr) | 의료기기 | 프라이머리 단색 히어로, 핀 고정 가로 스크롤, reveal 푸터, 모바일 전용 축약 페이지 |

---

## 공통 관찰

1. **섹션 배경 리듬이 곧 디자인이다.** 대부분 2~4가지 표면을 번갈아 쓴다. 기본 흰색, 옅은 틴트, 짙은 반전색, 가끔 브랜드색 풀블리드 밴드다. 더현대(회색→검정→흰색→검정), 솔깃(흰색→틴트), ICEVAN(흰색→연회색→네이비 푸터), 트리니티(파스텔 3종→다크→블러시)가 그렇다. 헤더에 쓴 `HeaderSurface` 역할(`surface/subtle/primary/secondary/inverse/transparent`)을 모든 섹션이 공유하면 팔레트만 바꿔도 페이지 리듬이 유지된다. 콕뭉치의 `rgb(11,80,204)` 밴드와 HILO WAVE의 `rgb(0,91,255)` 히어로가 `primary` 표면, 콕뭉치의 `rgb(245,248,255)` 섹션이 primary 틴트(`subtle` 혹은 `primary-subtle`)에 해당한다.
2. **모바일 변환은 다섯 가지로 거의 다 설명된다.**
   - `stack`: 그리드와 분할을 1열로 쌓는다(가장 흔함).
   - `reduce`: 열 수만 줄인다. 4→2(ICEVAN 연락 카드), 11→4(Soo 글리프), 5→2(한미 일정), 6→4(치과 아이콘).
   - `swipe`: 데스크톱 3~6장 고정 열이 모바일에서 가로 스크롤로 바뀐다(솔깃 3장, MOZAIQ 6장, 더현대 인스타그램 띠).
   - `unslide`: 데스크톱 슬라이더가 모바일에서 세로 목록으로 풀린다(천만문화재단 수상작 42개).
   - `swap`: 모바일 전용 마크업이나 축약 페이지를 쓴다(에브리봇 `mobile_section`, HILO WAVE).

   지금 `resolveLayout`은 `stack`만 자동으로 하고 열 수 덮어쓰기는 `mobile.columns`로 된다. `swipe`와 `unslide`가 빠져 있다.
3. **고정 레이어가 많다.** 25곳 중 15곳 이상에 흐름 밖 요소가 있다. 퀵메뉴, FAB, 플로팅 CTA, 팝업, 동의 카드, 챗 위젯, 모바일 하단 탭바 같은 것들이다. 이 요소들은 섹션 트리 안에 있지 않다. 문서 단위의 `overlays` 층이 따로 필요하다.
4. **분할 비율은 몇 개로 수렴한다.** 50/50(코오롱, HILO), 약 1/3 : 2/3(MOZAIQ 상담 65/34, 투모어스텝스 36/48, 삼성 65/32), 라벨 열+본문(코오롱 30/30, 12열 그리드)이다. 모바일에서는 항상 쌓이고, 미디어를 위로 올릴지가 사이트마다 다르다.
5. **풀화면(100vh) 섹션이 기본 단위인 사이트가 늘었다.** ICEVAN, plan-et, 트리니티, MAKERVIL은 섹션 대부분이 900(=1뷰포트)이다. 높이 옵션에 `auto | screen | fixed px`가 있어야 한다.

---

## 1. 히어로 / 메인 비주얼

| 변형 | 구조 | 인터랙션 | 모바일 390 | 예시 |
|---|---|---|---|---|
| **풀스크린 미디어** | 100vh 비디오·이미지 위에 카피와 버튼, 투명 헤더 겹침 | 자동재생 비디오, 스크롤 시 축소·고정 | 높이 유지(844) 또는 약 70%, 카피 크기 축소 | ICEVAN, 웰크론, plan-et, 트리니티, 콕뭉치 |
| **미디어 슬라이더 + 썸네일 내비** | 풀스크린 슬라이드에 하단 또는 측면 슬라이드 목록(3~7개) | 자동 넘김, 썸네일 클릭 | 썸네일 목록 숨김 → 점·숫자 페이지네이션 | 치과(측면 7개), 잉글리쉬원(하단 3장), 솔깃(7개) |
| **텍스트 히어로** | 이미지 없이 큰 헤드라인(+짧은 문단) | 글자 등장 애니메이션 | 높이 대폭 축소(715→189), 줄바꿈 재조정 | 투모어스텝스, 삼성 CSR, PhysicalWorks |
| **분할 히어로** | 좌: 헤드라인+CTA / 우: 이미지 스택 | 이미지 페이드 | 쌓임, 이미지 축소 또는 숨김(905→444) | 코오롱 |
| **브랜드색 단색** | `primary` 배경 + 로고·워드마크 | 로고 모션 | 그대로 | HILO WAVE(`rgb(0,91,255)`), MOZAIQ(다크) |
| **띠 배너** | 높이 약 190~330의 와이드 슬라이더, 풀스크린 아님 | 자동 넘김 + 마키 | 비율 유지로 높아짐(189→326) | 더현대 서울 |
| **히어로 + 오버레이 카드** | 풀스크린 위 우하단에 공지·이벤트 카드 | 카드만 링크 | 카드가 히어로 아래로 내려감 | 잉글리쉬원(공지 400×135) |
| **히어로 + 티커** | 하단에 가로로 흐르는 키워드·뉴스 띠 | 마키 | 그대로 | MOZAIQ(7개), 한미(14개) |
| **몰입형 단일 화면** | 캔버스/WebGL, 섹션 없음 | 마우스·스크롤 반응 | 그대로 | KINORIA, 서울아트굿즈(포스터형) |

**빌더 옵션 제안** (`HeroConfig`):

```ts
type HeroConfig = {
  layout: "overlay" | "split" | "text" | "band" | "poster";   // 미디어 위 카피 / 좌우 분할 / 텍스트만 / 띠 배너 / 단일화면
  media: "image" | "video" | "none" | "color";                 // color = 표면색 자체가 비주얼
  height: "screen" | "large" | "medium" | "band";              // 100vh / 80vh / 60vh / ~240px
  align: "start" | "center" | "end";                           // 카피 정렬(세로·가로 묶음)
  slides: number;                                              // 1 = 단일, 2+ = 슬라이더
  nav: "none" | "dots" | "fraction" | "thumbs" | "progress";   // 슬라이드 인디케이터
  overlayCard: boolean;                                        // 우하단 공지/이벤트 카드
  ticker: boolean;                                             // 하단 마키 띠
  scrim: "none" | "gradient" | "solid";                        // 미디어 위 텍스트 대비용 막
  surface: SectionSurface;                                     // color 모드에서 쓰는 역할
  cta: { primary: string; secondary: string };
  mobile: { height?: HeroConfig["height"]; nav?: HeroConfig["nav"]; mediaFirst: boolean; hideMedia: boolean };
};
```

- 토큰: 미디어 위 카피는 `--color-text-inverse`, 스크림은 `color-mix(--color-surface-inverse …)`, `color` 모드는 `--color-primary-default` / `-on`이다. 슬라이드 인디케이터 활성색은 accent 역할로 칠한다.
- 투명 헤더(`HeaderSurface: "transparent"`)는 `overlay` 히어로 바로 위일 때만 의미가 있다. 둘을 짝지어 미리보기하면 좋다.

---

## 2. 푸터

| 변형 | 구조 | 모바일 390 | 예시 |
|---|---|---|---|
| **정보형(기본)** | 로고 + 정책 링크 한 줄 + 사업자 정보 블록 | 그대로 쌓임 | 치과, 잉글리쉬원, 솔깃 |
| **사이트맵 열** | 3~4열 메뉴 제목+하위 링크, 하단 저작권 | 2열로 줄거나(MAKERVIL·코오롱) **아코디언**(삼성 CSR "Open") | 삼성 CSR, 에브리봇, MAKERVIL |
| **CTA 얹은 푸터** | 상단에 "Work with us"·이벤트·슬로건 블록 + 버튼, 그 아래 일반 푸터 | 쌓임 | 코오롱, plan-et(1467 높이 메가), 천만문화재단(슬로건) |
| **브랜드색 푸터** | `primary`나 진한 브랜드 톤 배경 | 동일 | ICEVAN(네이비), 천만문화재단(비비드 블루), 웰크론(네이비) |
| **한 줄 미니멀** | © · SNS · 개인정보 · Back to top이 한 줄 | 두 줄로 줄바꿈 | 투모어스텝스, Soo, 이퓨전아이 |
| **풀스크린 reveal** | 콘텐츠 뒤에 고정, 마지막 스크롤에서 드러남. 100vh 크기 사이트맵 | 동일(100vh) | MAKERVIL, HILO WAVE |
| **스폰서 띠** | 주최·후원 로고 열만 | 높이 축소 | 서울아트굿즈 |

부속 요소의 출현 빈도: 패밀리 사이트 셀렉트(에브리봇, eSTEEL4U "그룹사 바로가기"), SNS 아이콘(10곳 이상), 맨위로 버튼(ICEVAN, eSTEEL4U, 에브리봇, 솔깃), 파트너 로고 슬라이더(천만문화재단), 규제 문구(HILO WAVE 광고심의, 병원 비급여 안내).

**빌더 옵션 제안** (`FooterConfig`):

```ts
type FooterConfig = {
  layout: "info" | "columns" | "minimal" | "poster";       // poster = 큰 슬로건·워드마크 중심
  surface: SectionSurface;                                  // surface | subtle | primary | inverse …
  lead: "none" | "cta" | "slogan" | "newsletter";          // 상단 얹는 블록
  columns: number;                                          // 사이트맵 열 수 (2~5)
  familySite: boolean; sns: boolean; backToTop: boolean; partners: boolean;
  reveal: boolean;                                          // 고정 노출 효과
  legal: string[];                                          // 정책 링크
  info: { label: string; value: string }[];                 // 사업자 정보 행
  mobile: { columns: "stack" | "two" | "accordion" };
};
```

- 사이트맵 열은 헤더의 `items`를 그대로 재사용할 수 있다. 헤더 메뉴를 바꾸면 푸터도 따라 바뀌는 쪽이 사용자 기대와 맞다.
- 토큰: `inverse`/`primary` 푸터의 보조 텍스트는 헤더에서 쓴 `color-mix(on 72%)` 규칙을 그대로 쓴다.

---

## 3. 카드 / 리스트 그리드

| 변형 | 구조 | 모바일 390 | 예시 |
|---|---|---|---|
| **균등 그리드** | 3·4열 카드(이미지+제목+메타) | 1열(`stack`) 또는 2열(`reduce`) | ICEVAN 표준 4열, 콕뭉치 4열, 삼성 What's New 3열 |
| **아이콘 그리드(밀집)** | 6~11열 작은 타일 | 4열 | 치과 11개 6열, Soo 글리프 60개 11열 |
| **오프셋(스태거)** | 3열 세로형 카드, 가운데 열만 +80px 내림 | 1열 | 이퓨전아이 |
| **큰 행 리스트** | 1열 와이드 행(썸네일·비디오 + 텍스트), 지그재그 | 그대로 1열 | 투모어스텝스 작업 7개, MAKERVIL 브랜드 3개, 더현대 Maker |
| **게시판 리스트** | 날짜+제목 행 4~5개, 우상단 "더보기" | 그대로 | eSTEEL4U 공지, 천만문화재단 뉴스 |
| **통계 / 수치** | 3~4개 큰 숫자 + 라벨 | 2×2 | MAKERVIL 2×2, 웰크론 4개, 콕뭉치 다크 띠 |
| **가로 스크롤 열** | 데스크톱에서도 넘침, 드래그 | 1장+peek | MOZAIQ coming soon 6장, 솔깃 시리즈 |
| **스티키 분할 리스트** | 좌측 제목 sticky + 우측 카드 세로 스크롤 | 제목 위, 카드 아래 | 콕뭉치 "특별한 이유", ICEVAN 제품 |
| **2×2 / 비대칭** | 큰 카드 1 + 작은 카드 n | 1열 | 솔깃 스토리 4개 2열 |

**빌더 옵션 제안** (`CardGridConfig`). 기존 `LayoutStyle`의 `grid/columns/gap`에 카드 표현 옵션을 얹는다.

```ts
type CardGridConfig = {
  variant: "grid" | "stagger" | "rows" | "board" | "stats" | "sticky";
  count: number;                                   // 미리보기 카드 수
  card: {
    media: "top" | "left" | "background" | "icon" | "none";
    ratio: "1:1" | "4:3" | "3:4" | "16:9";
    surface: "none" | "surface" | "subtle" | "outline" | "inverse";
    meta: ("category" | "date" | "badge" | "arrow")[];
    hover: "none" | "lift" | "zoom" | "reveal";
  };
  header: { title: boolean; more: "none" | "link" | "button" };   // 섹션 제목 + 더보기
  mobile: { mode: "stack" | "reduce" | "swipe"; columns?: number };
};
```

- 토큰: 카드 표면 `--color-surface-default` 또는 `--color-bg-subtle`, 테두리 `--color-border-subtle`, 배지는 accent 역할의 `-subtle`/`-text`를 쓴다. `inverse` 섹션 안의 카드는 자동으로 반전 쌍을 쓴다.
- 모바일 `swipe`는 지금 `resolveLayout`의 "모바일이면 column" 기본값과 충돌한다. 모바일에서 `direction: "row"`와 `overflow: scroll`이 가능하도록 `LayoutStyle`에 `overflow: "visible" | "scroll"`(또는 `wrap: boolean`)을 추가해야 한다.

---

## 4. 탭

| 변형 | 구조 | 모바일 390 | 예시 |
|---|---|---|---|
| **텍스트 언더라인 탭** | 섹션 제목 아래 가로 탭, 활성 밑줄 | 가로 스크롤 | ICEVAN 제품, 웰크론(다크) |
| **필 탭(칩)** | 둥근 버튼 그룹, 활성 채움 | 가로 스크롤(7개 중 5개 보임) | 한미 직무 7개, MOZAIQ 지역 7개(양평/서울/가평…) |
| **세로 탭 + 패널** | 좌측 탭 목록, 우측 이미지+설명 패널 | 탭이 위쪽 가로 스크롤로, 패널 아래 | 삼성 CSR(프로그램 6개) |
| **필터 탭 + 카드** | 카테고리 탭이 아래 카드 그리드를 거름 | 탭 스크롤, 카드 1열 | 삼성 What's New, 더현대 Issue Diary, 한미 일정 |
| **탭 + 슬라이더** | 탭 전환 시 카드 슬라이더 교체 | 동일 | eSTEEL4U 비전, 웰크론 |

**빌더 옵션 제안** (`TabsConfig`):

```ts
type TabsConfig = {
  style: "underline" | "pill" | "segmented" | "vertical";
  align: "start" | "center" | "stretch";
  labels: string[];                       // 2~8
  panel: "cards" | "media-text" | "slider" | "frame";  // frame = 탭마다 자유 프레임(트리의 children)
  surface: SectionSurface;
  accent: HeaderAccent;                   // 활성 표시 색 역할 (헤더와 같은 타입 재사용)
  mobile: { style?: "scroll" | "select" | "accordion" };
};
```

- 헤더의 `active: "text" | "underline" | "pill"`과 같은 개념이라 스타일 이름을 맞춰 두면 사용자가 한 번만 배운다.
- `panel: "frame"`은 탭 각각이 레이아웃 노드 children을 갖게 한다. 빌더 트리와 가장 자연스럽게 맞는 확장이다.

---

## 5. 슬라이더 / 캐러셀 / 마키

| 변형 | 구조 | 인터랙션 | 모바일 390 | 예시 |
|---|---|---|---|---|
| **1장 풀블리드** | 섹션 폭 전체 1장 | 자동 + 화살표/점 | 동일 | 히어로 대부분, 천만문화재단 스토리 |
| **다장 + peek** | 3~4장 보이고 다음 카드 일부 노출 | 드래그, 화살표 | 1.1~1.2장 | 삼성 Stories, ICEVAN 제품 |
| **센터 모드** | 가운데 카드 확대 | 드래그 | 1장 | 치과 의료진 |
| **썸네일 동기화** | 큰 이미지 + 작은 썸네일 열 | 썸네일 클릭 | 썸네일 숨김 | 치과 히어로, 솔깃 |
| **마키(무한 흐름)** | 로고·키워드·카드가 일정 속도로 흐름 | 호버 시 정지 | 동일 | 투모어스텝스 클라이언트 18개, 솔깃, 더현대, plan-et |
| **핀 고정 가로 스크롤** | 세로 스크롤이 가로 이동으로 변환(섹션 핀) | ScrollTrigger | 보통 세로 목록으로 풀림 | HILO WAVE(15개), eSTEEL4U 사업 4패널 |
| **장면 전환(스토리텔링)** | 100vh 장면 여러 개가 겹쳐 페이드 | 스크롤 진행 | 동일 | 카누, 트리니티(풀페이지 스냅 + 진행 인디케이터) |

**빌더 옵션 제안** (`SliderConfig`). 그리드·탭·히어로가 공유하는 하위 옵션으로 두는 편이 낫다.

```ts
type SliderConfig = {
  mode: "slide" | "peek" | "center" | "marquee" | "pinned";
  perView: number;                         // 데스크톱 보이는 장수
  autoplay: boolean; loop: boolean;
  nav: "none" | "arrows" | "dots" | "fraction" | "progress" | "thumbs";
  navPosition: "inside" | "below" | "header";   // header = 섹션 제목 우측에 화살표
  mobile: { perView: number; mode?: "slide" | "stack" };  // stack = unslide
};
```

- 토큰: 화살표 버튼은 `surface` 위 `--color-text-primary` 아웃라인, 진행 바와 활성 점은 accent 역할이다.
- 빌더 미리보기에서는 실제 자동재생 대신 첫 장과 peek만 그리고, 모드는 배지로 표시하면 충분하다(빌더는 배치 도구이기 때문).

---

## 6. CTA 섹션

| 변형 | 구조 | 모바일 390 | 예시 |
|---|---|---|---|
| **배너 띠** | 한 줄 높이(약 350): 좌측 카피 / 우측 버튼 | 쌓임, 버튼 풀폭 | eSTEEL4U("지금 이스틸포유에서 시작하세요") |
| **컬러 밴드** | `primary`·틴트 풀블리드 + 중앙 카피 + 버튼 | 동일 | 트리니티(블러시 480), 콕뭉치(프라이머리 밴드), PhysicalWorks 마무리 |
| **이미지 배경 CTA** | 배경 이미지 + 스크림 + 카피·버튼 | 동일 | 웰크론 "We'll help you", 콕뭉치 contact |
| **연락 카드 묶음** | 제목 + 2×2 연락 수단 카드(전화·메일·카톡…) | 1열 | ICEVAN(연회색 섹션), 콕뭉치 3채널 |
| **카운트다운 CTA** | 마감까지 남은 일·시간 + 지원 버튼 | 숫자 축소 | 한미 채용, 서울아트굿즈 상단 바 |
| **마키 대형 텍스트** | 화면을 가로지르는 큰 문구가 흐르고 링크 | 동일 | MAKERVIL contact |
| **푸터 합체형** | CTA가 푸터 최상단에 붙음(§2 `lead: "cta"`) | – | 코오롱, plan-et |

**빌더 옵션 제안** (`CtaConfig`):

```ts
type CtaConfig = {
  layout: "inline" | "center" | "split" | "cards" | "marquee";
  surface: SectionSurface | "image";
  title: string; body: string;
  actions: { label: string; style: "solid" | "outline" | "link" }[];  // 최대 2
  countdown: { enabled: boolean; label: string };   // 날짜는 미리보기용 더미
  contacts: number;                                   // cards 레이아웃일 때 카드 수
  mobile: { stretchButtons: boolean };
};
```

- 토큰: `primary` 표면 위 버튼은 반전(`--color-primary-on` 배경에 `--color-primary-default` 글자)으로 자동 전환해야 대비가 깨지지 않는다. 헤더 accent 처리 규칙과 같은 문제다.

---

## 7. 폼

| 변형 | 구조 | 모바일 390 | 예시 |
|---|---|---|---|
| **짧은 리드 폼** | 이름 + 전화 + 전체 동의 체크(세부 펼침) + 버튼 1개 | 1열 | MOZAIQ("회원권 안내 받기") |
| **분할 상담 폼** | 좌측 카피·연락처 / 우측 폼 카드(65/34) | 카피 위, 폼 아래 | MOZAIQ(다크 섹션) |
| **장문 문의 폼** | 체크박스 **칩 그룹**(Branding/Design/…) + 셀렉트(목적·예산·일정) + 텍스트·이메일·전화·URL + textarea + 파일 첨부 + 개인정보 동의(내용 보기) + 큰 제출 버튼 | 칩 4열→2열, 필드 1열 | 투모어스텝스 |
| **인터랙티브 도구** | 입력창 + 조절 컨트롤로 즉석 미리보기 | 컨트롤 아래로 | Soo "TRY IT" |
| **챗/위저드** | 질문을 단계별로 묻는 패널 | 거의 전체화면 시트 | plan-et 추천 챗봇 |

한국 사이트에 공통으로 나타나는 필수 구성: 개인정보 수집 동의 체크박스와 "내용 보기" 펼침이 거의 항상 있다. 스팸 방지 허니팟 필드도 있다(투모어스텝스).

**빌더 옵션 제안** (`FormConfig`):

```ts
type FormConfig = {
  layout: "stacked" | "two-column" | "inline";       // inline = 한 줄(이메일+버튼)
  container: "none" | "card" | "split";              // split = 카피 패널 + 폼
  fields: { kind: "text" | "email" | "tel" | "select" | "textarea" | "chips" | "file" | "date"; label: string; required: boolean }[];
  field: "outline" | "filled" | "underline";
  consent: "none" | "single" | "expandable";         // 개인정보 동의
  submit: { label: string; width: "auto" | "full" };
  surface: SectionSurface;
};
```

- 토큰: 필드 테두리 `--color-border-subtle`, 포커스 accent, 오류는 상태 토큰(danger), `inverse` 섹션에서는 `filled` 필드 배경을 `color-mix(on 8%)`로 칠한다. 칩 활성은 탭의 `pill` 스타일과 같게 둔다.

---

## 8. 퀵메뉴 / 플로팅 버튼

가장 다양했고 모바일 변화가 가장 큰 영역이다.

| 변형 | 위치·크기(데스크톱) | 모바일 390 | 예시 |
|---|---|---|---|
| **세로 퀵메뉴 레일** | 우측 중앙, 82~130폭 아이콘+라벨 세로 스택(예약·공지·카톡·인스타·블로그) | **하단 가로 바**(370×92)로 변신하거나 숨김 | 치과, 잉글리쉬원(무료체험·1:1 문의) |
| **맨위로 / 업다운 스택** | 우하단 40~56 원형 1~2개 | 크기 축소 | 이퓨전아이, 솔깃, 천만문화재단, plan-et |
| **FAB(원형 주요 행동)** | 우하단 80 원형 "빠른 신청" | 45로 축소 | 치과 |
| **필 CTA 버튼** | 우상단·우하단 텍스트 버튼(+배지) | **하단 풀폭 고정 바**(390×97) | MOZAIQ("회원권 안내 받기"+D-03 배지) |
| **채팅 FAB → 패널** | 우하단 104×46 필이 412×608 패널을 엶 | 패널이 거의 전체화면 시트 | 콕뭉치, plan-et, 카누(채널톡) |
| **정보 카드** | 우상단 260×381 카드(오늘 영업시간) | 200×294로 축소 | 더현대 서울 |
| **말풍선 어시스턴트** | 우하단 262×77 인사 말풍선 | 동일 | 더현대(쇼핑 AI) |
| **바로가기 링크 카드** | 우하단 225×200 접이식 카드(공식몰 →) | 189×184 | 에브리봇 |
| **모바일 하단 탭바** | 데스크톱엔 없음 | 390×56~72 앱형 탭 5개 | 콕뭉치, 천만문화재단 |
| **진행 인디케이터** | 좌측 세로 점·숫자 | 동일 | 트리니티 |

**빌더 옵션 제안**. 섹션 트리 밖, 문서 수준 `overlays`로 둔다.

```ts
type FloatingConfig = {
  kind: "rail" | "fab" | "stack" | "pill" | "chat" | "card" | "tabbar" | "progress";
  anchor: "right-center" | "right-bottom" | "right-top" | "left-center" | "bottom";
  items: { label: string; icon: string }[];      // rail/stack/tabbar
  label: string; badge: string;                  // pill/fab
  surface: "primary" | "surface" | "inverse";
  shape: "circle" | "pill" | "square";
  mobile: { kind?: FloatingConfig["kind"]; hidden: boolean };   // rail → tabbar, pill → bottom bar
};
```

- 모바일 대체 규칙이 핵심이다. `rail → bottom bar`와 `pill → full-width bottom bar`가 관찰된 기본값이다. 하단 탭바와 하단 CTA 바는 같은 자리를 다투므로 둘 중 하나만 허용하거나 쌓는 규칙이 필요하다(콕뭉치는 탭바 위로 FAB를 올렸다: 716 → 772).

---

## 9. 팝업 / 레이어

| 변형 | 구조 | 모바일 390 | 예시 |
|---|---|---|---|
| **중앙 공지 팝업** | 딤 + 중앙 카드(360×452~620×308), 하단 바에 "오늘 하루 열지 않기 / 닫기" | 화면 폭 -32 카드 또는 축소 | eSTEEL4U, 잉글리쉬원 |
| **다중 공지 슬라이더 팝업** | 팝업 안에 공지 여러 장 + 페이저("1 / 1") + 자세히 보기 | 동일 | 천만문화재단(`<dialog>`), eSTEEL4U(4장), 치과(전체화면) |
| **전체화면 레이어** | 첫 진입 시 뷰포트 전체를 덮는 공지 | 동일 | 세계로탑치과 |
| **하단 동의 카드** | 우하단 카드(302×238~440×147): 분석/쿠키 허용·거부 | **하단 시트**(풀폭-24) | 삼성 CSR, 콕뭉치 |
| **사이드 패널** | 우측에서 밀려나오는 패널(챗봇·전체메뉴) | 전체화면 | plan-et, 삼성 GNB |
| **인트로 스플래시** | 첫 로딩 오버레이·페이지 전환 커튼 | 동일 | 잉글리쉬원, MAKERVIL, 천만문화재단 |

**빌더 옵션 제안** (`PopupConfig`). 역시 `overlays`에 둔다. 빌더에서는 "미리보기 열기" 토글로만 보인다(헤더 메뉴 미리보기와 같은 방식).

```ts
type PopupConfig = {
  kind: "modal" | "sheet" | "fullscreen" | "corner" | "side";
  size: "small" | "medium" | "large";
  pages: number;                                    // 2+ = 공지 슬라이더, 페이저 표시
  media: "top" | "full" | "none";
  dismiss: "close" | "today" | "both";              // 오늘 하루 보지 않기
  dim: boolean;
  actions: { label: string }[];                     // 자세히 보기 등
  mobile: { kind?: "sheet" | "fullscreen" | "modal" };
};
```

- 토큰: 딤은 `color-mix(--color-surface-inverse 80%, transparent)`(eSTEEL4U `rgba(17,17,17,.8)` 대응), 하단 dismiss 바는 `inverse` 표면이다.

---

## 빌더 모델에 주는 시사점

1. **컴포넌트 노드는 `header`처럼 `kind` + 설정 객체로 추가한다.** `LayoutNode.kind`에 `"hero" | "footer" | "cards" | "tabs" | "cta" | "form"`을 더하고 `header?: HeaderConfig`처럼 `hero?: HeroConfig` 같은 필드를 둔다. 검증도 `validHeaderConfig`와 같은 enum 테이블 방식으로 한다. 슬라이더는 독립 노드보다 카드·히어로·탭이 공유하는 `slider?: SliderConfig` 하위 옵션이 더 맞다.
2. **섹션 표면을 공통 타입으로 뺀다.** `HeaderSurface`를 `SectionSurface`(`surface | subtle | primary | secondary | inverse | transparent` + 필요 시 `image`)로 승격하고, `headerColorVars`의 표면별 `[bg, fg, muted, line]` 테이블을 모든 섹션이 쓰는 `surfaceVars()`로 일반화한다. 섹션 리듬(공통 관찰 1)이 팔레트를 그대로 따라가게 된다.
3. **`LayoutStyle` 보강.** `height`에 `screen`(100vh) 개념을 넣는다. 모바일 `overflow: "scroll"`(swipe 열)을 허용한다. 미디어 순서 뒤집기(`reverse: boolean`)를 추가한다. 지금 `resolveLayout`은 모바일에서 무조건 `column`으로 바꾸므로, 노드가 `mobile.direction: "row"`를 명시하면 유지되는 것은 이미 맞다. 다만 가로 스크롤 표현이 없다.
4. **문서 수준 오버레이 층.** `LayoutDocument`에 `overlays: (FloatingConfig | PopupConfig)[]`를 둔다. 트리 드래그와 분리하고 아트보드 위에 절대 위치로 그린다. 모바일 대체(`rail → tabbar`)는 오버레이마다 `mobile` 필드로 처리한다.
5. **모바일 변환 어휘를 통일한다.** 카드·슬라이더·탭·푸터가 모두 `stack | reduce | swipe | unslide | accordion` 중 하나를 고르게 하면 옵션 UI를 하나로 재사용할 수 있다.

## 사이트별 보유 빈도 (조사 25곳, PC + 390px)

| 컴포넌트 | 대략 보유 사이트 | 비고 |
|---|---|---|
| 푸터 | 22 / 25 | 없는 곳은 몰입형 단일 화면(KINORIA, 카누 프로모션, PhysicalWorks) |
| 섹션 제목 + 카드/리스트 | 22 / 25 | 그리드·슬라이더·리스트·게시판·통계가 섞여 쓰임 |
| 슬라이더/마키 | 약 17 / 25 | 대부분 카드 섹션 안의 넘김 방식 |
| CTA 섹션 | 약 15 / 25 | 배너 띠, 컬러 밴드, 연락 카드, 카운트다운 |
| 플로팅 버튼 | 약 13 / 25 | 맨 위로, 퀵메뉴(모바일 하단 바), FAB, 채팅, 앱 탭바 |
| 탭 | 약 11 / 25 | |
| 팝업 | 6 / 25 | |
| 폼 | 4 / 25 | |

> 구현 현황(2026-10-30): 헤더, 히어로, 푸터, 카드 섹션, CTA, 플로팅 버튼은 각자 설정 파일로, 나머지 24종(이미지 + 글 분할, 탭, 흐르는 띠, 영상, 문의 폼, FAQ, 진행 단계·연혁, 서브 페이지 상단, 게시판 목록, 게시글 상세, 오시는 길, 회사 소개, 제품 상세, 표, 레이어 팝업, 인트로, 쿠키 동의, 스크롤 진행 표시, 상단 앱 바, 검색바 + 칩, 바텀시트, 토스트, 빈 화면 안내, 앱 다운로드 배너)은 `src/lib/blocks.ts`의 필드 스키마로 빌더에 들어갔다.

## 먼저 만들 컴포넌트 추천

> 구현 현황: 히어로는 `src/lib/hero-config.ts`(옵션·프리셋 8종·검증), `src/components/builder/hero-frame.tsx`, `hero-settings.tsx`로 들어갔다. 섹션 표면 역할은 `src/lib/section-surface.ts`로 공통화해 헤더와 같이 쓴다.

1. **히어로**: 모든 페이지의 첫 섹션이고 이미 만든 투명 헤더와 바로 짝이 된다. `overlay / split / text / color` 네 레이아웃과 `height`, `scrim`, `slides+nav`만으로 조사한 히어로의 대부분을 덮는다. 섹션 표면 공통화(시사점 2)를 여기서 같이 하면 이후 컴포넌트가 모두 덕을 본다.
2. **푸터**: 구조 변형이 적고(`info / columns / minimal` + `lead`) 헤더 `items`를 재사용할 수 있어 비용 대비 완성도가 높다. 헤더·히어로·푸터만 있어도 "한 페이지"가 된다.
3. **카드 그리드(+슬라이더 하위 옵션)**: 본문 섹션의 절반 이상이 이 형태다. 모바일 `swipe`를 위해 `LayoutStyle` 확장(시사점 3)이 필요하니 세 번째로 둔다.
4. **CTA 섹션**: 컬러 밴드와 배너 띠가 토큰 시연에 가장 효과적이다(`primary` 표면 위 반전 버튼). 구현이 가볍다.
5. **탭 → 폼 → 퀵메뉴/플로팅 → 팝업** 순. 오버레이 둘은 문서 모델 변경(`overlays`)이 필요하므로 한 번에 묶어 진행하는 편이 효율적이다.
