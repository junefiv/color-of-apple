# Color of Apple UI Library 제공 목록 기획안

작성: 2026-10-08. 공개 공식 목록과 현재 프로젝트 코드를 확인한 기획안이며 구현 완료 목록이 아니다.

## 1. 제공 구조

사용자가 팔레트와 UI Library를 각각 고른다. Library는 기본(Default), 쿠션(Cushion), 잉크(Ink)로 시작한다. 세 스타일은 같은 컴포넌트 API, 의미 색상 토큰, 상태 체계를 사용한다.

제공 단위를 구분한다.
- Foundations: 색 외에 타이포그래피, 간격, 모서리, 테두리, 그림자, 모션, 포커스 규칙.
- Components: 버튼, 입력창, 카드 같은 재사용 가능한 단일 구성.
- Blocks: 로그인 폼, 가격표, 프로필 설정 등 여러 컴포넌트가 조합된 기능 영역.
- Templates: 여러 블록을 연결한 앱/웹 프리뷰 화면.

UI Kit은 위 구성과 문서를 담은 전체 배포 묶음으로 정의한다. 컴포넌트와 화면 블록을 모두 UI Kit으로 부르며 중복 집계하지 않는다.

공식 참고:
- [shadcn/ui Components](https://ui.shadcn.com/docs/components): 컴포넌트 카탈로그.
- [shadcn/ui Blocks](https://ui.shadcn.com/blocks): 로그인, 사이드바, 대시보드 등 조합 블록.
- [Material UI](https://mui.com/material-ui/all-components/): 입력, 데이터 표시, 피드백, 표면, 탐색, 레이아웃 분류.
- [Chakra UI](https://chakra-ui.com/docs/components/concepts/overview): 폼, 상태 표시, 레이아웃 등 구성.
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction): 스타일과 접근성 동작을 분리하는 설계 참고.
- [Base UI](https://base-ui.com/react/overview/quick-start): 현재 저장소가 사용하는 기반 기술과의 정합성 참고.

공식 사이트의 분류와 제공 방식을 참고하며 아래 구성/우선순위는 Color of Apple 자체 기획이다. 다른 업체의 유료 템플릿이나 디자인 파일을 재배포 대상으로 삼지 않는다.

## 2. Foundations — 모든 스타일에 필수

| 항목 | 정의할 내용 |
| --- | --- |
| 색상 연결 | Primary, Secondary, Accent, Surface, Text, Border, Success, Warning, Error, Info 등 현재 엔진의 의미 토큰 매핑 |
| Typography | 제목/본문/라벨/캡션/코드, 크기·두께·행간, 한글/영문 폰트 대체 |
| Spacing | 패딩, 간격, 레이아웃 여백의 공통 척도 |
| Radius | 버튼, 입력, 카드, 모달, pill별 모서리 |
| Border | 기본/강조/선택/오류 테두리, 두께 |
| Elevation | 카드, 팝오버, 모달의 그림자와 레이어 |
| Motion | hover/press/open/close, 시간과 easing, reduced-motion 대체 |
| Focus | 키보드 포커스 링, 대비, outline offset |
| Size/Density | 작은/기본/큰 컨트롤, 앱과 웹 밀도 차이 |
| Responsive | 화면/컨테이너 너비에 따른 재배치, 터치 영역 |
| Icons | 기존 아이콘 체계 재사용, 크기·stroke·텍스트 정렬 |
| Theme scope | 밝은/어두운 표면에서의 지원 범위를 명시. 현재 엔진이 지원하지 않는 모드를 지원한다고 표시하지 않음 |

## 3. Components 제공 목록

1차는 라이브러리 첫 출시의 공통 지원 대상이다. 2차는 후속 추가 대상이다. 기본 컴포넌트의 실제 동작을 완성한 뒤 고급 컴포넌트를 늘린다.

| 분류 | 1차 컴포넌트 | 2차 컴포넌트 |
| --- | --- | --- |
| 액션 | Button, Icon Button, Button Group | Toggle, Toggle Group, Floating Action Button |
| 입력 | Input, Textarea, Form Field, Checkbox, Radio Group, Switch, Select, Slider | Combobox/Autocomplete, Number Input, Date Picker/Calendar, OTP Input, File Upload, Range Slider |
| 정보 표시 | Typography, Card, Badge/Chip, Avatar, Separator, List | Avatar Group, Tooltip 부가 형태, Stat Card, Timeline, Code Block |
| 탐색 | Tabs, Navbar, Sidebar, Bottom Navigation, Dropdown Menu | Breadcrumb, Pagination, Stepper, Command Palette, Context Menu |
| 오버레이 | Dialog, Alert Dialog, Sheet/Drawer, Popover, Tooltip | Hover Card, Responsive Dialog |
| 피드백 | Alert, Toast, Spinner, Skeleton, Progress, Empty State | Error/Result 화면, Upload Progress |
| 콘텐츠·데이터 | Accordion, 기본 Table | Data Table(정렬/선택/필터), Carousel, Tree View, Charts |
| 레이아웃 | Container, Stack, Grid, Scroll Area | Resizable Panels, Masonry, Split View |

보충 정의:
- Input은 일반 텍스트/이메일/비밀번호 상태를 포함하며 이들을 별도 컴포넌트 수로 부풀리지 않는다.
- Form Field는 Label, Help Text, Error Message와 입력 연결을 포함한다.
- Badge/Chip은 상태 표시와 선택/해제 가능한 태그를 구분한다.
- 기본 Table은 렌더링과 반응형 처리. Data Table은 별도 데이터 조작 기능을 가진 후속 구성이다.
- Dialog/Alert Dialog는 일반 정보·폼 모달과 확인이 필요한 삭제 등의 모달을 구분한다.
- Sheet/Drawer는 같은 기반 동작을 사용하되 방향과 용도를 변형으로 제공한다.
- Navbar/Sidebar/Bottom Navigation는 제품 탐색 컴포넌트이며 로그인/라우팅 백엔드를 자동 제공하지 않는다.
- List는 기본 항목 구조이고 상품/게시글 목록은 Blocks에서 구성한다.
- Layout 유틸리티는 사용 편의를 위해 제공하되 마케팅용 핵심 컴포넌트 개수에 과장해 포함하지 않는다.

## 4. Blocks 제공 목록

| UI Kit 분야 | 1차 블록 | 2차 블록 |
| --- | --- | --- |
| 계정 | 로그인 폼, 회원가입 폼, 프로필 카드, 계정/환경 설정 폼 | 비밀번호 재설정, 인증 단계, 세션 관리 |
| 마케팅 | Hero/CTA, Feature Grid, Pricing Cards, FAQ, Footer | 후기, 로고 목록, 이메일 구독, 비교표 |
| 쇼핑 | Product Card, Product Grid, 상품 상세 요약, 장바구니 요약 | 주문 폼, 주문 내역, 배송 상태 |
| 대시보드 | Sidebar+Header 셸, 통계 요약, 최근 활동, 기본 데이터 목록 | 필터 툴바, 차트 묶음, 고급 테이블 |
| 콘텐츠·커뮤니티 | 팔레트 카드 그리드, 선택 카드 상세, 작성자 정보, 게시 폼 | 글 목록/상세, 댓글 UI, 미디어 갤러리 |
| 앱 | 앱 상단 바, Bottom Navigation, 설정 목록, 카드 피드, Bottom Sheet | 알림 목록, 검색 결과, 작업 상세 |

블록은 UI와 데모 동작을 제공한다. 인증, 실제 결제, 주문 처리, 파일 서버, 이메일 발송이 함께 구현되어 있다고 표현하지 않는다. 필요 백엔드 연결 지점을 문서로 명시한다.

커뮤니티 팔레트 카드는 커뮤니티 구현에 사용하는 공통 컴포넌트를 재사용한다. 실제 사용자 게시물/프로필을 다운로드 예제에 포함하지 않는다.

## 5. 앱·웹 Templates

초기 화면 프리뷰는 다음을 기준으로 제공한다. 기존 화면이 있으면 재사용하며 페이지 수를 늘리는 것보다 실제 컴포넌트 스타일 적용을 우선한다.

| 웹 프리뷰 | 앱 프리뷰 |
| --- | --- |
| 서비스 랜딩 | 카드 피드/홈 |
| 대시보드 | 상품 목록/상세 |
| 쇼핑 상품 목록/상세 | 프로필/설정 |
| 로그인/계정 설정 | 알림/목록 상태 |
| 콘텐츠 목록/상세 | 폼/Bottom Sheet |

별도로 Component Playground에서 모든 컴포넌트의 상태를 비교한다. 라이브러리 변경은 현재 팔레트를 유지하고, 팔레트 변경은 선택 라이브러리를 유지한다. 쿠션/잉크가 적용되지 않은 레거시 프리뷰 영역을 전체 지원으로 표시하지 않는다.

초기 앱 프리뷰는 모바일 웹 UI 프리뷰다. 웹 React 라이브러리를 React Native/SwiftUI 네이티브 컴포넌트와 혼동하지 않는다. 실제 네이티브 배포는 별도 제품 범위다.

## 6. Default / Cushion / Ink의 차이

| 스타일 | 기본 외형 | 핵심 인터랙션 |
| --- | --- | --- |
| Default | 정돈된 모서리, 명확한 경계, 절제된 그림자 | 표준 hover/focus/press, 빠른 열기/닫기 |
| Cushion | 둥근 형태, 부드러운 면과 깊이감 | 버튼 누른 지점의 눌림과 복원, 선택 요소의 부드러운 반응 |
| Ink | 잉크를 연상시키는 경계/강조와 표면 표현 | 클릭·선택·포커스 위치의 잉크 퍼짐, 입력 활성 상태의 강조 |

기존 `src/components/preview/concept-samples.tsx`에 Cushion/Ink 샘플이 존재한다. 이는 전체 라이브러리 지원 완료가 아니다. 실제 배포용 API, 반응형, 키보드 동작, 스타일 scope를 갖춘 컴포넌트로 확장한다.

모든 요소가 같은 강도의 모션을 가질 필요는 없다. Typography/Table/긴 본문은 가독성을 유지하고, 스타일 특성은 테두리·여백·표면과 제한적인 선택 효과로 반영한다. Input에서 글자나 caret이 변형되지 않게 하며 드롭다운/모달은 기존 포커스 동작을 유지한다. Pointer 효과가 없는 키보드 입력에는 중앙 또는 포커스 기반 대체를 제공한다.

## 7. 컴포넌트별 필수 상태

| 종류 | 지원 상태 |
| --- | --- |
| 버튼 | default, hover, pressed, focus-visible, disabled, loading |
| 입력 | empty, filled, focus, invalid, disabled, read-only |
| 선택 | checked/selected, unchecked, disabled, focus, checkbox mixed 상태 |
| 메뉴/모달 | open/closed, keyboard navigation, Escape, 적절한 focus 관리 |
| 목록/카드 | default, selected, loading, empty, error |
| 색상 변형 | 의미에 맞는 primary/secondary/neutral/destructive, 대비 검증 |

API는 지원 상태만 문서에 표시한다. SVG/CSS 모션이 있어도 실제 DOM 버튼/입력/링크의 의미와 이벤트 처리를 유지한다. 포커스, 키보드, 스크린리더, 터치, reduced-motion을 검증한다.

## 8. 다운로드와 AI 적용에 함께 제공할 것

각 컴포넌트와 블록에는 다음을 제공한다.
- 현재 팔레트 + 선택 라이브러리가 적용된 인터랙티브 프리뷰.
- 컴포넌트 코드/사용 예제 복사.
- 필요한 스타일/토큰/의존성을 포함한 다운로드.
- `AI 프롬프트 복사`: 대상 환경, 정확한 컴포넌트 API, 파일/설치 경로, 라이브러리 버전, 현재 색상 토큰, 상태·모션 규칙, 필요한 의존성.
- 설치 안내와 지원 환경. 실제 패키지가 없는 동안 존재하지 않는 npm 설치 명령을 만들지 않는다.
- Props/variants/state 문서, 접근성 사용법, 라이트/다크 지원 범위.
- 버전, 변경 이력, 사용/재배포 라이선스.

프롬프트는 단순히 '쿠션처럼 만들어줘'가 아니라 현재 제공되는 코드와 토큰을 사용하는 지시여야 한다. 프리뷰/다운로드/프롬프트가 서로 다른 CSS나 임의 색으로 구현되지 않게 동일한 라이브러리 manifest에서 생성한다.

현재 앱의 `src/components/ui`는 서비스 운영 UI를 포함한다. 이를 제품 다운로드로 그대로 노출하지 말고 Color of Apple 배포용 컴포넌트/스타일 범위를 분리한다. Base UI를 쓰는 기존 접근성 기반은 재사용을 검토하되 새 시스템을 위해 MUI/Chakra/Radix를 동시에 추가하지 않는다.

## 9. 개발 우선순위

첫 단계: Default/Cushion/Ink의 공통 토큰과 핵심 Button, Input, Card, Checkbox, Switch, Tabs를 먼저 완성해 스타일 품질을 검증한다.

첫 출시: 위 표의 1차 컴포넌트를 세 스타일에서 제공하고, 최소 로그인·설정·가격표·상품·대시보드 블록으로 실제 조합을 검증한다. 현재 팔레트 연결, 웹/모바일 웹 프리뷰 적용, 코드와 AI 프롬프트를 함께 제공한다.

후속: Date Picker, Data Table, Charts, Command Palette 등 복잡한 컴포넌트와 추가 블록/템플릿. Native 앱 컴포넌트와 Figma 파일은 별도 범위로 결정한다.

컴포넌트 하나마다 세 스타일 및 여러 상태를 검증해야 하므로 단순히 개수만 늘리지 않는다. 운영 화면의 API와 스타일에 영향을 주지 않게 배포용 라이브러리의 CSS를 scope한다.
