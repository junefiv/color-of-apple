# Paddle 구독 연동과 선물 후원

2026-10-07 작업 상태. 한국 소재 **사업자등록이 없는 개인 개발자**가 월 **990원** SaaS 구독을 글로벌로 판매하는 방향이다. 실행 순서와 중단 지점은 [README 인수인계](../README.md)에 기록한다.

## 현재 상태

Paddle Node SDK, Paddle.js, Firebase Admin SDK와 checkout/confirm/status/portal/webhook API를 구현했다. Sandbox 상품·가격·키·웹훅·기본 결제 링크와 Vercel 환경 변수를 설정하고 재배포했다. 앱 Google 로그인 후 실제 Sandbox Checkout에서 KRW 990 테스트 결제를 완료했다. Paddle 서버가 보낸 구독 생성·활성화·거래 완료·해지 예약 알림은 Delivered이며 Firestore 처리 기록과 앱 상태를 확인했다. 실제 사용자 plan은 free로 유지됐다. 정상 서명의 비권한 이벤트 요청은 HTTP 200, 서명 없는 요청과 변조 요청은 HTTP 400으로 확인했다. Live 결제와 선물 수납은 활성화하지 않았다.

최초 검증 거래는 `txn_01m48xvcxegej0ay8p80wc1yve`(completed), 구독은 `sub_01m48xx4ghpmz0ynews3nzgeb3`이다. 최초 고객 포털 해지 예약과 결제 완료 알림 Replay를 확인했다. Replay 당시 이벤트 4개가 유지돼 중복 기록이 생기지 않았다.

2026-10-07 회사 재개 검증에서 Firestore 규칙 게시(10:47 KST)와 실제 클라이언트 권한 시나리오 8개를 확인했다. 전체 157개 테스트와 빌드도 통과했다. 실제 Sandbox 500원 일부 환불 승인 시 권한 유지, 추가 490원 승인으로 누적 전액 환불 시 `paymentRevoked=true`를 확인했다. 별도 테스트 거래 `txn_01m4a1hp480exrf5vrhdvybmpw`는 최초 카드 거절 시 구독이 생성되지 않았고, 동일 거래 재시도 완료 후 구독 `sub_01m4a1q0ngr8te7hhg0c2p46xr`가 생성됐다. 인증된 공개 status/confirm API도 정상 Sandbox Pro를 반환했으며 실제 사용자 plan은 Free를 유지했다.

11:35 KST 실제 자동 갱신 거래 `txn_01m4a3dqhaxj7ha1a0ep86kdqj`가 990원으로 완료됐다. 실제 웹훅이 이용 기간을 `2026-11-07T02:35:00Z`로 연장하고 `paymentRevoked=false`로 이전 전액 환불 후 테스트 권한을 복구했다. 원래 구독의 해당 기간 종료 해지 예약을 복원했고 `nextBilledAt=null`과 서버 `cancelAt` 반영을 확인했다.

11:40 KST 별도 구독의 실제 갱신 거래 `txn_01m4a3px94nwcv80pger3sr0sh`는 카드 인증 실패(`authentication_failed`)로 `past_due`가 됐다. 구독의 `subscription.past_due` 웹훅이 처리됐고 기존 `paidThrough=2026-11-07T02:05:09.278381Z`가 연장되지 않았다. 인증된 status/confirm API는 HTTP 200, past_due, 기존 기간 내 테스트 Pro를 반환했다. 검증을 위해 청구일을 앞당겨 기존 영수증의 기간이 실패 시각 이후까지 남은 조건이다. 이후 즉시 해지했고 `subscription.canceled` 처리와 API의 canceled/Free 및 다음 청구 없음도 확인했다. 기간 만료 권한 판정은 자동 테스트와 실제 게시된 규칙으로 확인했지만, Paddle의 실제 시간 경과에 따른 기간 종료는 아직 검증하지 않았다.

| 설정 | Sandbox |
| --- | --- |
| Product | `pro_01m483wmpr2hbjdmrf2vv51grx` |
| Price | `pri_01m483zd2z7qgjwjcjq7e6qacj` |
| 월 가격 | KRW 990, tax mode `internal`(세금 포함), 무료 체험 없음, 수량 1 |
| API 키 만료 | 2026-11-05 |
| 웹훅 | `ntfset_01m48xen1z65jd7qytd213e907`, `https://color-of-apple.vercel.app/api/billing/webhook`, Active, 12개 이벤트, Usage Both |
| 기본 결제 링크 | `https://color-of-apple.vercel.app/billing/checkout`, Sandbox 설정 저장 완료 |

## 서버와 권한

### Live 준비 상태 — 2026-10-07

사용자가 판매자 심사 정보를 제출했고 Paddle은 `We're reviewing your details`로 검토 중이다. 도메인 `color-of-apple.vercel.app`은 Checkout 및 Apple Pay 승인을 받았다. Live 상품 `pro_01m4a4h941cfsmnvz8mhv9hmfj`, 가격 `pri_01m4a4k5y9kgr2ecwn2j34w9hz`와 최소 권한 API 키(2026-11-05 만료), 클라이언트 토큰, 웹훅을 생성했다. 키는 Git에서 제외된 `.env.paddle-live.local`에 별도 보관하며 활성 Sandbox `.env.local`은 유지한다. Live API 가격 조회와 로컬 SDK 웹훅 서명·변조 거부 검증은 성공했다.

Live 웹훅 `ntfset_01m4aah3ct49rknm2endnjnqxn`은 기존 `/api/billing/webhook` URL, 이벤트 12개, Usage Both이며 **Inactive**다. 기본 결제 링크는 `/billing/checkout`으로 저장했다. 실제 전환 시 Vercel의 API 키·클라이언트 토큰·가격·웹훅 secret과 환경을 함께 교체하고 기존 Sandbox 목적지를 비활성화한 뒤 Live 목적지를 활성화한다. Live 서버 알림 전달은 아직 검증하지 않았다. 실제 고객 결제와 Live 사용자 권한 변경은 아직 활성화하지 않았다.

Vercel 로그인 후 Production Secret에 전환 대기용 `PADDLE_LIVE_API_KEY`, `PADDLE_LIVE_CLIENT_TOKEN`, `PADDLE_LIVE_WEBHOOK_SECRET`, `PADDLE_LIVE_PRO_MONTHLY_PRICE_ID`를 등록하고 저장 성공 및 네 변수의 등록을 확인했다. 앱은 이 별도 이름을 읽지 않으므로 현재 Sandbox 동작은 유지한다. 최종 전환 시 각각 기존 일반 이름의 변수에 연결하고 `PADDLE_ENVIRONMENT=production`, `PADDLE_LIVE_ENABLED=true`와 함께 재배포해야 한다. 현재 저장만으로 결제가 Live로 전환되지는 않는다.

사용자가 정산 설정을 저장했고 성공 메시지, `Individual / Sole Proprietorship`, Payoneer 선택을 확인했다. 추가 신분증·주소 문서 제출 후 Sumsub 프로필 인증이 완료됐으며 Paddle 대시보드를 새로고침해 **02 Verify your account — Complete**를 확인했다. `Set up your live account`, `Test and go live`는 In progress이며 운영 설정 연결·Live 서버 알림 및 실제 결제 검증은 남아 있다. 현재 앱은 Sandbox 상태다. 요율 문의 답변은 아직 확인되지 않았다.

- 서버는 Firebase ID token의 서명·만료·폐기 상태와 인증된 이메일을 확인한다. 요청 body의 uid·이메일·가격은 사용하지 않는다.
- `POST /api/billing/checkout`은 서버 가격 ID를 조회해 KRW 990·월 주기·세금 포함·무료 체험 없음 조건을 검증한다. 계정별 Firestore 트랜잭션 lease로 동시 생성 요청을 막고 진행 중 거래를 재사용한다. 기존 구독이 있으면 고객 포털을 제공한다.
- 서버에서 생성한 Paddle 고객 ID → Firebase uid와 checkout attempt를 저장한다. 브라우저에서 보낼 수 있는 `custom_data`만으로 권한을 부여하지 않는다.
- `POST /api/billing/confirm`은 서버 고객/거래/구독 연결과 Paddle API 결제 완료 상태를 확인한다. `checkout.completed` 이벤트는 확인 요청을 시작하는 신호일 뿐이다.
- `GET /api/billing/status`는 Paddle 현재 구독과 최근 완료 거래를 확인해 누락된 갱신 알림을 보정한다. `POST /api/billing/portal`은 로그인 사용자 소유 구독의 Paddle 포털 세션을 만든다.
- `POST /api/billing/webhook`은 변형하지 않은 raw body와 Paddle 서명을 공식 SDK로 검증한다. event ID로 중복을 막고 Paddle API의 현재 구독/거래 정보와 시각으로 이벤트 순서 역전을 처리한다.
- 저장 위치는 `billing/{sandbox|production}/accounts`, `customers`, `subscriptions`, `events`이다. 기존 Firestore 규칙에서 이 경로는 클라이언트에 공개하지 않는다.
- **Sandbox는 `users` 문서를 변경하지 않는다.** Production만 Admin SDK로 `plan`과 `proExpiresAt`을 기록한다. 클라이언트는 이 필드를 변경할 수 없다.
- 결제가 완료된 이용 기간에만 권한을 준다. 해지 예약은 유료 기간 종료까지 유지하며, 즉시 해지·일시 정지는 권한을 중단한다. 실패한 갱신은 유료 기간을 연장하지 않는다. 현재 결제의 전액 환불·차지백은 권한을 중단하고 일부 환불은 유지한다. 이전 기간 환불은 이후 정상 갱신 권한을 취소하지 않는다.
- Firestore 규칙과 클라이언트 모두 만료 시각을 확인한다. 관리자가 기존 방식으로 부여한 `proExpiresAt` 필드 없는 Pro는 유지한다. Free 전환 시 기존 컬러북을 삭제하지 않는다.

웹훅 설정에서는 `transaction.completed`, 모든 `subscription.*`, `adjustment.created`, `adjustment.updated`를 구독한다. Usage는 Both로 설정해 플랫폼 이벤트와 시뮬레이션을 테스트한다. 배포한 서버에서 정상 수신되는지 확인하고 실패 알림 재전송도 검증해야 한다. 아직 별도 정기 전체 계정 재동기화 작업은 없다. 구독 관리 조회 시 보정과 웹훅만 구현한 상태다.

## 환경 변수와 실행

필요한 이름은 [`.env.example`](../.env.example)에 있다. 실제 값은 로컬 `.env.local` 또는 배포 서버의 환경 변수에만 저장한다. Node.js 22 이상이 필요하다. API 키·웹훅 secret·Firebase private key에는 `NEXT_PUBLIC_`를 사용하지 않는다.

```powershell
node scripts/check-billing.mjs
npm run dev
```

`PADDLE_ENVIRONMENT=sandbox`가 기본이며 Live는 `production`을 사용한다. Live를 켜려면 `PADDLE_LIVE_ENABLED=true`와 운영자 이름·문의 이메일도 필요하다. 이 스위치는 SDK 설정 완료나 Paddle 계정 심사 승인을 자동 검증하지 않으므로, 실제 심사·요율·테스트 확인을 별도로 완료해야 한다.

`BILLING_APP_URL`은 끝 슬래시와 경로 없는 origin이다. Sandbox 로컬은 `http://localhost:43123`, 배포는 실제 HTTPS origin을 사용한다. Production에서 localhost는 허용하지 않는다. Paddle가 호출할 웹훅은 외부 접근 가능한 서버에 있어야 한다.

Vercel의 Node 24 배포에서 Firebase Admin → `jwks-rsa` → `jose` 로딩이 `ERR_REQUIRE_ESM`으로 실패해 결제 API가 HTTP 500을 반환했다. [Vercel 공식 설정](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration)에 따라 서버 환경 변수 `NODE_OPTIONS=--experimental-require-module`을 등록하고 재배포해 해결했다. Paddle/Firebase/Billing 변수 12개와 이 옵션을 Vercel의 Production 환경에 Secret 유형으로 저장했다. 여기서 Production은 Vercel 배포 환경이며, 결제 제공자는 `PADDLE_ENVIRONMENT=sandbox`, `PADDLE_LIVE_ENABLED=false`이다. Preview 환경에는 아직 등록하지 않았다. 공개 운영자 이름 `GIT_IN`은 사용자 지정 Sandbox 초안이며 Live 심사 정보와의 적합성은 운영 전 확인한다.

Firebase의 `private_key_id`는 비밀 키가 아니다. 서비스 계정 JSON의 `client_email`, `private_key`를 사용한다. `private_key`는 `-----BEGIN PRIVATE KEY-----`로 시작하는 전체 PEM 문자열이며 `\n` 줄바꿈을 유지한다. [Firebase Admin 공식 설정](https://firebase.google.com/docs/admin/setup).

## 앱 화면

플랜 비교 모달에는 가격·갱신·해지 조건과 약관 링크를 표시한다. Sandbox 표시와 실제 권한이 바뀌지 않는 안내를 구분한다. 기존 컬러북 정리하기 흐름은 그대로 제공한다. `/pricing`은 공개 비교, `/billing`은 구독 관리, `/billing/checkout`은 결제 링크와 완료 확인 화면이다.

약관·개인정보·환불 페이지는 현재 Sandbox 초안이며 운영자 표기는 `GIT_IN`이다. 실제 운영 전에 신원·연락처·정책 내용과 처리 업체를 확인해야 한다. 환불은 [Paddle 현재 환불 정책](https://www.paddle.com/legal/refund-policy)과 해당 국가 소비자 권리에 따라 처리하며 일률적인 환불 불가 정책을 넣지 않는다.

## 요율 협의

공개 표준은 거래당 **5% + USD 0.50**이다. 매월 결제와 갱신마다 적용된다. [공식 요율](https://www.paddle.com/pricing)은 USD 10 미만 상품에 대해 별도 요율 문의를 허용하지만, 낮은 가격이라고 자동 인하되는 것은 아니다.

문의는 [paddle-fee-inquiry.md](paddle-fee-inquiry.md)의 내용으로 **2026-10-07 10:55 KST에 발송했다.** 발신자는 `dasawafa@gmail.com`, 수신자는 `sellers@paddle.com`이며 Gmail 보낸편지함에서 확인했다. 답변과 요율 승인은 대기 중이다. 실제 판매량은 미정이며 100·500·1,000건은 견적 비교 시나리오다. 매월 요율, 최소 수수료/거래량/약정, 세금 기준, 환전·정산·환불·차지백 비용과 한국 개인 판매자의 심사 가능 여부를 서면으로 확인한다. [판매자 지원 연락처](https://www.paddle.com/help/start/intro-to-paddle/how-do-i-contact-support).

월 990원 가격을 연간 가격으로 임의 변경하지 않는다. 실제 요율 승인이나 순수익을 확정한 것으로 표현하지 않는다.

## 선물 후원

BIC 볼펜 1,000원, 스타벅스 카페라떼 4,700원, 빅맥 5,700원은 운영자가 정한 고정 일회성 후원 금액이다. 실제 상품·기프티콘을 제공하거나 브랜드 공식 판매·제휴를 의미하지 않는다. 구독/Pro 권한을 부여하지 않으며 현재 결제 버튼은 준비 안내만 표시한다.

소프트웨어·서비스 판매가 없는 donation은 [Paddle 허용 사용 정책](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle)에 따라 Paddle 상품으로 등록하지 않는다. 한국 소재 개인의 국내·해외 후원 수납을 승인하는 별도 제공자 검토가 남아 있다.
