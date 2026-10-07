# Color of Apple

색 하나만 골라. 나머지는 Color of Apple이 맞춰줄게.

Color of Apple은 기준색 하나를 역할이 부여된 UI 컬러 시스템으로 바꿉니다. 작업대는 끝까지 무채색이고, 색은 Generate를 누른 뒤에 미리보기와 핵심 CTA에만 퍼집니다. Google 로그인과 Cloud Firestore를 사용해 프로젝트와 무료 사용량을 관리합니다.

## 집에서 이어서 작업하기 — 2026-10-06 인수인계

현재 작업 브랜치는 `main`이며 저장소는 <https://github.com/junefiv/color-of-apple>입니다(기존 `junefiv/matchu`에서 이동). **Paddle 연동 코드와 Sandbox 상품 설정을 진행한 상태이며, 실제 결제 운영과 요율 협의는 아직 완료하지 않았습니다.** 아래 순서로 이어서 작업합니다.

### 집 PC 재개 확인 — 2026-10-07

- 가져온 `.env.local`로 Firebase Admin 인증과 Paddle Sandbox 가격 검사가 성공했습니다. 월 KRW 990·세금 포함·무료 체험 없음·수량 1 설정을 확인했습니다. 실제 키는 출력하거나 저장소에 추가하지 않았습니다.
- 사용자 요청에 따라 로컬 `BILLING_OPERATOR_NAME=GIT_IN`을 설정했습니다. Sandbox 초안 표기이며, Live 심사 정보와 공개 운영자 표기의 적합성은 운영 전 확인해야 합니다.
- Vercel과 Gmail 플러그인의 설치 상태를 확인했습니다. 이 재개 세션에는 두 서비스의 계정 조회 도구가 아직 나타나지 않았으며, 실제 계정 접근·OAuth 연결 완료는 검증하지 못했습니다. Codex 브라우저의 Paddle Sandbox와 Vercel은 로그인 화면입니다.
- Sandbox API로 조회한 웹훅 목적지는 0개입니다. `PADDLE_WEBHOOK_SECRET`도 비어 있습니다. 웹훅은 아직 생성하지 않았습니다.
- 공개 `/pricing` 페이지는 열리지만 결제 UI는 출시 준비 중입니다. 공개 `/api/billing/webhook`에 서명 없는 빈 요청을 보낸 결과 **HTTP 500, JSON이 아닌 응답**을 받았습니다. 로컬 구현의 예상 응답은 HTTP 400의 `invalid_signature`이므로, Vercel 배포·서버 로그·환경 변수부터 확인하고 정상 endpoint를 확보한 뒤 목적지를 등록해야 합니다.
- 시스템 Node는 20이지만 Codex에 포함된 Node 24.19.0으로 연결 검사와 테스트를 실행했습니다. 기존 네이티브 패키지 파일 잠금으로 `npm ci`가 실패해 `npm install --ignore-scripts --no-audit --no-fund --package-lock=false`로 의존성을 복구했습니다. `package.json`과 lockfile은 변경하지 않았지만 설치 결과는 lockfile의 완전 재현 검증이 아닙니다. 깨끗한 환경에서 Node 22 이상으로 `npm ci` 및 배포 빌드를 확인해야 합니다.
- 결제 관련 3개 테스트 파일, **29개 테스트 통과**. 이번 재개에서는 전체 테스트와 빌드를 다시 실행하지 않았으며, 실제 Sandbox 결제·웹훅 수신·기본 결제 링크·Firestore 규칙 배포·요율 문의 발송은 아직 완료하지 않았습니다. Live는 비활성화 상태로 유지했습니다.

### 로그인 후 진행 결과 — 2026-10-07

- Paddle Sandbox와 Vercel 브라우저 계정 접근을 확인했습니다. Git 커밋 `21cb27c`의 기존 배포가 Ready인 상태였지만 결제 API는 Firebase Admin → `jwks-rsa` → `jose`의 `ERR_REQUIRE_ESM` 로딩 오류로 HTTP 500을 반환했습니다.
- Vercel 공식 문서에 따라 `NODE_OPTIONS=--experimental-require-module`을 등록했습니다. Paddle/Firebase/Billing 설정 12개도 Production 배포 환경에 Secret 유형으로 저장했습니다. `BILLING_APP_URL=https://color-of-apple.vercel.app`, `PADDLE_ENVIRONMENT=sandbox`, `PADDLE_LIVE_ENABLED=false`로 설정했습니다. Preview에는 아직 설정하지 않았습니다.
- 동일 소스로 캐시 없이 재배포한 `hqEiEe2PYQBKexmVr4kntrAghnDL`은 Ready입니다. 공개 `/api/billing/config`는 HTTP 200, enabled=true, sandbox, KRW 990을 반환합니다. 서명 없는 웹훅 요청은 HTTP 400 `invalid_signature`로 정상 거부합니다.
- Sandbox 웹훅 `ntfset_01m48xen1z65jd7qytd213e907`을 생성했습니다. URL은 `https://color-of-apple.vercel.app/api/billing/webhook`, Active, Usage Both, `transaction.completed`·모든 `subscription.*`·`adjustment.created`·`adjustment.updated` 총 12개입니다. secret은 `.env.local`과 Vercel Secret에만 저장했습니다. 기존 API 키의 웹훅 생성/개별 조회 권한이 부족해 관리자 화면으로 생성·저장했으며 키 권한은 확대하지 않았습니다.
- Sandbox 기본 결제 링크 `https://color-of-apple.vercel.app/billing/checkout` 저장을 확인했습니다.
- 권한을 부여하지 않는 `customer.created` 테스트 payload를 로컬에서 서명해 공개 서버에 보낸 결과 HTTP 200 `received=true`입니다. body 변조 요청은 HTTP 400으로 거부했습니다. 이 검사는 배포된 secret·Firebase 읽기·서명 검증을 확인한 것이며, Paddle 서버가 직접 보낸 알림이나 결제 성공을 검증한 것은 아닙니다.
- 앱 Google 로그인과 실제 Sandbox Checkout 결제를 완료했습니다. 거래 `txn_01m48xvcxegej0ay8p80wc1yve`는 KRW 990·completed, 구독 `sub_01m48xx4ghpmz0ynews3nzgeb3`는 active입니다. Paddle의 `subscription.created`, `subscription.activated`, `transaction.completed` 알림이 Delivered이고 Firestore에도 처리 기록이 있습니다. 실제 `users/{uid}.plan`은 `free`로 유지됐습니다.
- 앱에서 생성한 고객 포털에서 해지를 예약했습니다. `subscription.updated` 웹훅이 Delivered이고 앱·서버의 해지 예약일과 결제한 이용 기간 종료는 모두 **2026-11-07 00:39:20 KST**입니다. 종료 전 테스트 Pro는 유지됩니다. `transaction.completed` 알림의 Replay도 Delivered이며 처리 이벤트는 4개로 유지돼 중복 기록이 생기지 않았습니다.
- **남은 검증은 갱신·결제 실패·기간 만료·전액/일부 환불입니다.** Firestore 규칙 배포, 요율 문의 발송, Live 심사·활성화도 미완료입니다. 문의 초안은 아직 보내지 않았으며 Gmail 계정 접근 도구는 이 세션에 나타나지 않았습니다.

### 회사 PC 재개 검증 — 2026-10-07 (11:42 KST)

이 절이 위 과거 진행 기록보다 우선합니다.

- 로컬 웹훅 secret 저장과 공개 서버 서명 검증을 확인했습니다. 운영자 표기는 `GIT_IN`이며 Live 심사 적합성 검토는 남아 있습니다.
- Firestore 규칙은 10:47 KST에 게시됐습니다. 실제 클라이언트로 무료 저장·한도 초과·권한 조작 차단·유효/만료 Pro·기존 컬러북 읽기와 수정 등 8개 시나리오를 모두 확인했고 임시 규칙 테스트 계정은 제거했습니다.
- 요율 문의를 10:55 KST에 `dasawafa@gmail.com`에서 `sellers@paddle.com`으로 발송하고 Gmail 보낸편지함에서 확인했습니다. 협상 요율은 아직 승인되지 않았습니다.
- 실제 Sandbox 카드 거절 후에는 구독이 생성되지 않았고 Free를 유지했습니다. 같은 거래를 정상 결제로 재시도해 구독 생성과 서버 상태 확인 API의 테스트 Pro 응답을 확인했습니다.
- 원래 거래의 500원 일부 환불은 승인 후 권한을 유지했습니다. 남은 490원 환불도 승인돼 누적 전액 환불 시 `paymentRevoked=true`로 테스트 권한이 회수됐습니다. 실제 사용자 plan은 계속 Free입니다.
- 11:35 KST 실제 자동 갱신 거래 `txn_01m4a3dqhaxj7ha1a0ep86kdqj`가 990원으로 완료됐습니다. 웹훅이 이용 기간을 `2026-11-07T02:35:00Z`로 연장하고 이전 전액 환불 후 테스트 권한을 복구했습니다. 정상 구독은 해당 기간 종료 해지 예약을 복원했습니다.
- 11:40 KST 별도 갱신 거래 `txn_01m4a3px94nwcv80pger3sr0sh`는 카드 인증 실패(`authentication_failed`)로 거래·구독 모두 `past_due`가 됐습니다. 실제 웹훅과 인증된 status/confirm API에서 기존 이용 기간을 연장하지 않는 것을 확인했습니다. 이어서 테스트 구독을 즉시 해지해 `canceled`, 테스트 플랜 Free, 다음 청구 없음까지 확인했습니다. 테스트를 위해 청구일을 앞당겼으므로 기존 결제 영수증의 유료 기간이 실패 시각 이후까지 남아 있는 조건입니다.
- 임시 Firebase 결제 테스트 계정과 프로필, 로컬 검증용 파일·서버는 정리했습니다. Sandbox 결제·웹훅 처리 기록은 검증 근거로 유지했습니다.
- 회사 Node 22.15.1에서 전체 157개 테스트와 프로덕션 빌드가 통과했습니다. 기간 만료의 권한 판정은 자동 테스트 및 게시된 규칙으로 확인했으며, 실제 시간 경과에 따른 Paddle 기간 종료는 아직 확인하지 않았습니다.
- Live 심사·별도 Live 설정·실결제 활성화와 선물 수납 제공자 결정은 남아 있습니다. `PADDLE_LIVE_ENABLED=false`를 유지합니다.

### Live 전환 준비 — 2026-10-07

- 사용자가 Live 판매자 심사 정보와 정책 준수·정확성 확인을 직접 제출했습니다. 대시보드에는 `We're reviewing your details`, 현재 추가 작업 없음, 필요 시 이메일 연락으로 표시됩니다. 판매자 계정의 최종 승인 완료는 아직 확인되지 않았습니다. 한국 화면에는 `개인사업자 / Single ownership business`가 표시됐으며, 상품 설명에 사업자등록 없는 한국 개인 개발자라는 맥락을 명시했습니다.
- Live Pro SaaS 상품 `pro_01m4a4h941cfsmnvz8mhv9hmfj`, 가격 `pri_01m4a4k5y9kgr2ecwn2j34w9hz`를 생성했습니다. 월 KRW 990, 세금 포함, 무료 체험 없음, 수량 1입니다. 아직 앱은 Sandbox 가격을 사용합니다.
- 홈페이지 하단에 플랜·이용약관·개인정보·환불·문의 링크를 추가했습니다. 로컬 화면과 TypeScript 및 해당 파일 ESLint 검사를 통과했습니다. `ed29540`을 main에 푸시했고 공개 배포에서 링크 반영을 확인했습니다.
- Live 웹사이트 `color-of-apple.vercel.app`(ID `chedom_01m4a4px7dt55z36ej4b56pmg0`)은 `Checkout approved`, `Apple Pay approved`입니다. 판매자 계정 심사와는 별개입니다.
- 사용자 승인 후 Live API 키·결제창 토큰·웹훅 서명 키를 생성해 **로컬 `.env.paddle-live.local`에 따로 저장**했습니다. Git에서 제외되며 Next.js가 자동 로드하는 `.env.local`의 Sandbox 값은 유지했습니다. 다른 PC로 옮길 때 이 별도 파일도 안전하게 가져와야 합니다. 실제 값은 채팅이나 Git에 넣지 않습니다.
- Live API 키는 5 read / 3 write(가격·구독·환불 조회, 고객·거래 조회/생성, 고객 포털 세션 생성)이며 만료일은 **2026-11-05**입니다. 최초 키는 만료일이 잘못 반영돼 폐기하고 올바른 날짜의 키로 대체했습니다. Live 가격 조회가 성공했고 월 990원·세금 포함·체험 없음·수량 1을 API로 확인했습니다.
- Live 웹훅 ID `ntfset_01m4aah3ct49rknm2endnjnqxn`, URL `https://color-of-apple.vercel.app/api/billing/webhook`, 12개 이벤트, Usage Both를 생성했습니다. 현재 **Inactive**로 준비했으며, 실제 Live 전환 시 서버 secret 교체와 함께 활성화해야 합니다. Sandbox 목적지와 같은 URL이므로 기존 Sandbox 목적지는 전환 시 비활성화해야 합니다. 공식 SDK를 이용한 로컬 서명 검증과 변조 거부는 성공했으나 Live 서버 알림 전달은 아직 검증하지 않았습니다.
- Live 기본 결제 링크 `https://color-of-apple.vercel.app/billing/checkout`을 저장했습니다. 앱과 Vercel은 아직 Sandbox 설정입니다. Vercel 브라우저 세션이 로그아웃되어 사용자 재로그인을 요청했습니다. Live 값을 Vercel에 보관·연결하는 작업은 미완료입니다.
- Paddle 정산 설정은 아직 비어 있습니다. `Payout Settings`에 Payoneer / Wire transfer가 표시되며 사용자에게 본인 정보·정산 수단을 직접 입력하도록 요청했습니다. Live 활성화와 실제 카드 결제는 진행하지 않았습니다.

### 집 PC 준비 (환경 설정)

Node.js **22 이상**을 사용합니다. 저장소가 없으면 다음과 같이 받습니다.

```powershell
git clone https://github.com/junefiv/color-of-apple.git matchu
cd matchu
```

이미 받은 저장소가 있으면 해당 폴더에서 `git switch main`과 `git pull --ff-only`로 최신 코드를 받습니다. 로컬 변경이 있으면 먼저 보존합니다.

```powershell
npm ci
# .env.local이 없고 가져온 설정을 아직 붙여넣지 않은 경우에만 템플릿 생성
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

회사 PC의 `.env.local` 전체 내용을 집 PC의 프로젝트 루트에 있는 `.env.local`에 붙여넣습니다. **Git에는 이 파일이 포함되지 않습니다.** `.env.example`은 이름만 적힌 템플릿이며 실제 키는 들어 있지 않습니다. 특히 Firebase JSON의 `private_key_id`가 아니라 `private_key` 전체 PEM 값을 사용해야 합니다. 키의 줄바꿈은 `\n`을 포함한 따옴표 문자열 형태로 유지합니다. 키 값을 채팅, README, 커밋에 넣지 않습니다.

```powershell
node scripts/check-billing.mjs
npm run dev
```

검사 스크립트는 키 값을 출력하지 않고 Firebase Admin 인증과 Paddle 가격을 확인합니다. 회사 PC에서는 두 검사 모두 성공했습니다. 앱은 <http://localhost:43123>, 플랜은 <http://localhost:43123/pricing>, 구독 관리는 <http://localhost:43123/billing>에서 확인합니다.

### 완료한 것

- 기존 Pro 비교 모달의 **플랜 결제하기**를 Paddle 테스트 결제창에 연결했습니다. 설정이 부족하면 준비 안내를 유지합니다. 기존 컬러북 정리하기, X·오버레이·Esc 닫기도 유지합니다.
- 인증된 Firebase 사용자에 대해 서버에서 거래를 생성합니다. 가격과 수량은 서버에서 결정하며, 이미 구독이 있으면 중복 구매 대신 Paddle 구독 관리로 이동합니다.
- 결제 확인, 구독 상태·고객 포털, 서명 검증 웹훅 API를 구현했습니다. 브라우저 성공 콜백만으로 Pro를 부여하지 않습니다.
- 해지 예약, 결제 기간 만료, 전액 환불·차지백, 중복·역순 이벤트를 처리하고 `proExpiresAt`를 Firestore 규칙과 클라이언트에서 확인합니다. 기존 컬러북은 자동 삭제하지 않습니다.
- Sandbox 기록은 `billing/sandbox`에 분리되며 **테스트 결제는 실제 `users/{uid}.plan`을 바꾸지 않습니다.** 실제 운영 활성화는 별도 설정으로 잠겨 있습니다.
- `/pricing`, `/billing`, `/billing/checkout`, `/terms`, `/privacy`, `/refund-policy`를 추가했습니다. 약관·개인정보·환불 페이지는 Sandbox 초안이며 운영자 표기는 `GIT_IN`입니다. Live 운영 정보의 적합성 확인은 남아 있습니다. 공개 문의 이메일은 `dasawafa@gmail.com`입니다.
- Sandbox에 아래 상품·가격, API 키, 공개 클라이언트 토큰을 생성했고 키와 토큰을 회사 PC의 `.env.local`에 저장했습니다.

| Sandbox 항목 | 값 |
| --- | --- |
| 상품 | Color of Apple Pro / SaaS |
| Product ID | `pro_01m483wmpr2hbjdmrf2vv51grx` |
| Price ID | `pri_01m483zd2z7qgjwjcjq7e6qacj` |
| 가격 | KRW 990 / 매월 / 세금 포함 |
| 무료 체험·수량 | 없음 / 최소·최대 모두 1 |
| API 키 만료 | **2026-11-05** — 이후 교체 필요 |

### 다음 작업 순서

아래 1–4, 6–7과 5의 최초 결제·자동 갱신 성공/실패·해지 예약/즉시 해지·실패 후 재시도·환불·실제 계정 Free 유지 검사는 2026-10-07에 완료했습니다. 위 회사 PC 재개 검증부터 확인하고, 실제 기간 종료 관찰과 8을 이어갑니다. 아래 미완료 표현은 2026-10-06 인수인계 당시 상태입니다.

1. 가져온 `.env.local`로 검사 스크립트를 실행하고, 공개 운영자 이름을 `BILLING_OPERATOR_NAME`에 확정합니다. `BILLING_SUPPORT_EMAIL=dasawafa@gmail.com`을 유지합니다.
2. **Sandbox 웹훅 목적지는 아직 생성하지 않았습니다.** 회사 브라우저에서는 생성 폼을 준비하던 중 중단했습니다. Sandbox의 Events → Notifications → New destination에서 배포된 테스트 서버의 `/api/billing/webhook`을 등록합니다. 이벤트는 `transaction.completed`, 모든 `subscription.*`, `adjustment.created`, `adjustment.updated`, Usage는 Both를 선택합니다. 생성 후 서명 secret을 `.env.local`의 `PADDLE_WEBHOOK_SECRET`에 저장합니다. 회사 PC에는 이 값이 아직 없습니다.
3. Sandbox Checkout → Checkout settings/configuration에서 기본 결제 링크를 설정합니다. 로컬 테스트에는 `http://localhost:43123/billing/checkout`을, 배포된 테스트에는 실제 HTTPS URL의 `/billing/checkout`을 사용합니다. **이 설정도 아직 완료하지 않았습니다.** localhost로는 Paddle 서버가 웹훅을 전달할 수 없으므로 외부에서 접근 가능한 테스트 배포가 필요합니다.
4. Vercel 연결/접근을 확보해 이 변경을 배포하고 서버 환경 변수를 설정합니다. **이번 인수인계 푸시와 Vercel 배포 성공 확인은 별개입니다.** 기존 Git 연동 자동 배포가 있으면 배포 결과를 확인합니다. 현재 공개 URL은 <https://color-of-apple.vercel.app/>이며 공식 도메인은 아직 구매하지 않았습니다. 테스트 서버에는 `PADDLE_ENVIRONMENT=sandbox`, 해당 서버 origin의 `BILLING_APP_URL`, 서버 전용 Paddle/Firebase 값이 필요합니다. 실제 키에 `NEXT_PUBLIC_`를 붙이지 않습니다. 새 테스트 도메인을 쓰면 Firebase Google 로그인 허용 도메인도 확인합니다.
5. Google로 앱에 로그인한 뒤 실제 Sandbox 테스트 결제를 수행합니다. 최초 성공, 갱신, 실패, 해지 예약, 만료, 전액·일부 환불, 중복 알림 및 웹훅 재전송을 확인합니다. **Paddle Checkout에서 결제 완료까지 진행하는 실제 종단 테스트는 아직 하지 않았습니다.** 테스트 구독 상태는 `/billing`에서 보고 실제 계정이 Free로 남는지도 확인합니다.
6. `firestore.rules` 변경은 로컬 파일만 수정했습니다. 실제 규칙 배포는 아직 하지 않았습니다. 유료 기능 운영 전에 배포하고 만료된 Pro 계정의 신규 저장을 서버 규칙으로 차단하는지 확인합니다.
7. [Paddle 요율 문의 초안](docs/paddle-fee-inquiry.md)을 **Paddle 가입 이메일**에서 `sellers@paddle.com`으로 보냅니다. 아직 발송하지 않았습니다. Gmail·Vercel 연결을 제안했지만 연결 완료는 확인되지 않았습니다. 예상 결제량은 미정으로 밝히고 월 100·500·1,000건은 견적 비교 시나리오로만 사용합니다. 월 **990원을 유지**하며 연간 요금으로 임의 변경하지 않습니다. 공식 표준은 5% + USD 0.50이고, USD 10 미만 상품의 별도 요율은 서면 승인 전까지 적용된 것으로 간주하지 않습니다.
8. Live 계정의 도메인·본인 확인과 상품/가격/웹훅 설정을 완료하고 실제 운영 조건을 검토합니다. **Live 키와 가격 ID는 Sandbox와 별도**이며 아직 준비하지 않았습니다. 테스트·심사·요율 확인 후 운영 활성화를 결정하기 전까지 `PADDLE_LIVE_ENABLED=false`를 유지합니다.

선물 후원(BIC 볼펜 1,000원·라떼 4,700원·빅맥 5,700원)은 여전히 준비 안내만 제공합니다. 순수 후원을 Paddle 상품으로 등록하지 않으며 별도 수납 제공자를 정해야 합니다.

관련 구현·운영 세부 사항은 [billing.md](docs/billing.md), 요율 문의 내용은 [paddle-fee-inquiry.md](docs/paddle-fee-inquiry.md), 환경 변수 이름은 [.env.example](.env.example)을 참고합니다.

### 인수인계 시 검증 결과

- `npm test`: **27개 파일, 157개 테스트 통과**.
- `npm run build` 및 TypeScript: 통과.
- 이번에 변경한 결제 관련 파일의 ESLint: 통과.
- 전체 `npm run lint`에는 기존 `tests/refresh-transition.test.ts:11`의 `react-hooks/globals` 오류 1개와 기존 경고 8개가 남아 있습니다. 결제 파일 오류는 아닙니다.
- 패키지 검사에서 취약점 19개(중간 3·높음 13·심각 3)가 보고되었습니다. 실제 운영 전 의존성 검토가 필요하며, 인수인계 중 임의로 `npm audit fix --force`를 실행하지 않았습니다.
- 위 결과는 자동 테스트·빌드·연결 검사입니다. 실제 Paddle 결제 완료와 외부 웹훅 전달까지 검증한 결과는 아닙니다.

집에서 새 Codex 대화를 열면 다음처럼 요청하면 됩니다.

> README의 2026-10-06 Paddle 인수인계를 읽고 현재 상태부터 이어서 작업해 줘. .env.local은 가져왔어. 월 990원 구독을 유지하고 Sandbox 웹훅·기본 결제 링크·Vercel 테스트 배포와 실제 Sandbox 결제부터 검증해 줘. Paddle 요율 문의는 초안을 사용하되 미정 판매량을 약속하지 말고, 실제 결제 운영은 테스트와 심사 완료 후 검토해 줘.

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

## Firebase 설정

Firebase 프로젝트는 `matchu-a1fbb`를 사용합니다.

1. Firebase Authentication에서 Google 로그인 제공업체를 활성화합니다.
2. Cloud Firestore 데이터베이스를 생성합니다.
3. Firebase CLI에 로그인하고 보안 규칙을 배포합니다.

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore --project matchu-a1fbb
```

팔레트 생성은 로그인과 횟수 제한 없이 사용할 수 있습니다. 파일 내보내기는 로그인 사용자에게 횟수 제한 없이 제공하며 브라우저에서 직접 생성합니다. 저장 프로젝트는 무료 계정 기준 `slot-1`부터 `slot-5`까지 최대 5개입니다. Firestore 콘솔 또는 신뢰할 수 있는 서버에서 사용자 문서의 `plan`을 `pro`로 설정하면 프로젝트 제한이 해제됩니다. 클라이언트에서는 `plan`을 변경할 수 없습니다.

## 쓰는 법

1. 무채색 작업대에서 HEX 하나를 고릅니다. MATCH 버튼만 그 색으로 바뀝니다.
2. MATCH를 누르면 팔레트 → 미리보기 배경 → 버튼·입력창 → 상태색 순으로 색이 퍼집니다.
3. 웹·앱·UI Kit 쇼케이스에서 결과를 확인합니다.
4. CSS / Tailwind / React Native / JSON / Figma Variables 형식으로 내보냅니다.
5. 공유 링크는 최종 컬러 토큰 스냅샷을 URL에 압축해 엔진이 바뀌어도 같은 HEX를 유지합니다.

## 디자인 원칙

Color is the result, not the decoration.

- 편집 도구 영역은 차가운 뉴트럴을 유지합니다.
- 결과 미리보기와 MATCH 버튼에만 생성된 색을 씁니다.
- 로고는 Color of Apple 옆에 작은 사과 심볼을 사용합니다.
- 폰트는 Paperlogy(헤드라인) + SUIT Variable(UI) + Geist Mono(HEX)입니다.

## 컬러 엔진

- 색공간: OKLCH (`culori`)
- 입력 HEX는 가장 가까운 Primary 단계에 고정
- 버튼색은 대비가 확보되는 Primary 600–800을 고르고, 위 글자색은 자동 선택
- Neutral / Secondary / Status는 별도 생성하고, 상태색은 메인 색에서 파생하지 않습니다
- 맞닿는 토큰 쌍만 WCAG 대비 검사 후 자동 보정
- 결과는 결정적입니다. `ENGINE_VERSION`이 JSON에 포함됩니다.
