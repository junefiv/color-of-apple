# 글로벌 구독과 선물 후원 결제 도입안

2026-10-06 기준, 한국 소재 수취 사업자를 전제로 한다. 아래는 도입 설계이며 현재 SDK, checkout API, webhook 또는 실결제는 구현되어 있지 않다.

## 월 990원에 맞는 제공자 선택

월 990원을 유지하려면 건당 USD 0.50이 붙는 MoR 표준 요율보다 **국내 PG + 해외 PayPal 소액 결제 요율**을 우선 검토한다. 아직 제공자를 확정하거나 실결제를 연동한 것은 아니다.

| 후보 | 공개 요율 | 적용 범위와 제약 |
| --- | --- | --- |
| 페이플(Payple) | 국내 카드 1.0~2.9%, 수수료 VAT 별도 | 한국 사업자등록 필수, 가입비 220,000원. 공개 가입 화면에 해외 구독 업종 불가로 명시되어 있으므로 국내 구독 후보로 검토 |
| 토스페이먼츠 | 국내 일반 카드 3.4%, 수수료 VAT 별도 | 가입비 220,000원, 연관리비 110,000원, 계약별 상이. 자동결제는 국내 발급 카드만 지원 |
| PayPal 소액 결제 | 해외 6% + USD 0.05, 디지털 상품 해외 5.5% + USD 0.05 | 한국 계정 기준 사전 신청·승인 필요. 해당 구독/후원에 적용되는 요율과 구독 API 적용 여부를 확인. 환전·인출 비용 별도 |
| Paddle 표준 | 5% + USD 0.50 | 판매세 대행의 장점이 있지만 990원 월별 결제에서는 고정 수수료 비중이 큼 |

출처: [Payple 가입/요율/제한](https://payple.kr/onboarding/), [토스 요율](https://www.tosspayments.com/about/fee), [토스 자동결제 제한](https://docs.tosspayments.com/guides/v2/billing/integration), [한국 PayPal 소액 요율](https://www.paypal.com/kr/business/paypal-business-fees), [Paddle 요율](https://www.paddle.com/pricing).

단순 비교 예시로 USD 1 = KRW 1,400을 가정하면, 990원 결제에서 Paddle 표준 수수료 차감 후 약 241원, PayPal 해외 소액 6% 요율 차감 후 약 861원이 남는다. 국내 토스 일반 카드 3.4%에 수수료 VAT 10%를 포함하면 약 953원이 남는다. 이는 현재 환율/실제 정산 견적이 아니며 판매 관련 세금, 환전·인출, 가입·연관리비, 서버비를 제외한 건별 계산이다. PayPal 실제 checkout은 지원 통화의 고정 가격을 별도로 정해야 한다.

한국 PayPal 계정 사이의 국내 거래는 지원되지 않는다. 따라서 PayPal 하나로 국내와 해외를 모두 처리하는 설계는 사용하지 않는다. [국내 거래 제한](https://www.paypal.com/kr/digital-wallet/system-enhancement-faq?locale.x=ko_KR), [PayPal 정기결제](https://www.paypal.com/kr/business/accept-payments/checkout/recurring).

국내 PG와 PayPal은 MoR 판매세 대행을 전제하지 않는다. 해외 소비자 판매세 신고·납부와 증빙 관리 비용을 함께 비교한다. 소액 요율 승인이 안 되면 공개 표준 요율로 다시 계산하며, 해외 연간 결제 또는 MoR 저가 상품 협상안을 검토한다.

## 판매세 대행이 필요한 대안

- 판매세 대행이 필요하면 Paddle을 검토한다. 소프트웨어 판매자의 지원 제외 국가에 한국은 포함되지 않으며, 실제 가입은 사업자·상품 심사를 거친다. [판매자 지원 국가](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle)
- 대안은 Lemon Squeezy다. 한국이 지원 국가에 명시되어 있다. [지원 국가](https://docs.lemonsqueezy.com/help/getting-started/supported-countries)
- Merchant of Record는 해외 소비자 판매에 대한 판매세/VAT 처리 부담을 줄인다. 한국 사업자의 소득·법인세 등 전체 세무를 대신한다는 의미는 아니다. [Paddle 판매 국가 및 세금](https://developer.paddle.com/concepts/sell/supported-countries-locales/)
- Paddle 표준 수수료는 거래당 5% + USD 0.50이다. 월 990원은 고정 수수료 비중이 크므로 저가 상품 요율 협의 또는 연간 결제를 검토한다. 기존 표시 가격은 아직 변경하지 않는다. KRW 지원 여부와 별도로 최소 결제금액·정산통화를 실제 승인 계정에서 확인한다. [요율](https://www.paddle.com/pricing), [통화 API](https://developer.paddle.com/api-reference/currencies/list-currencies/)

## Pro 구독 연결 (Paddle 후보 기준)

1. 승인 계정에서 Pro 상품과 월/연 가격을 생성하고 sandbox와 production 설정을 분리한다. 서버 전용 API 키와 webhook secret은 클라이언트에 노출하지 않는다.
2. `/api/billing/checkout`에서 Firebase ID token을 검증한다. 서버의 허용된 price ID만 사용하며 클라이언트 금액을 신뢰하지 않는다. 서버에서 인증된 uid와 checkout 주문을 연결한다. 사용자 구독이 이미 존재하면 중복 구독 대신 구독 관리 화면으로 보낸다.
3. 모달의 플랜 결제하기를 hosted checkout에 연결한다. 국가, 통화, 세금, 최종 결제금액은 checkout에서 확정한다. 화면 언어만으로 구매자 국가를 정하지 않는다.
4. `/api/billing/webhook`은 raw body의 서명을 검증하고 event ID를 저장해 중복 처리를 방지한다. provider customer/subscription ID와 uid의 서버 측 연결을 확인하고 공급자 API의 현재 상태 및 이벤트 발생 시각으로 순서 역전을 처리한다. [서명 검증](https://developer.paddle.com/webhooks/about/signature-verification/)
5. 검증된 유료 구독 상태를 Admin SDK로 기록한다. 서버 전용 구독 문서에 provider, customerId, subscriptionId, status, priceId, currentPeriodEnd, scheduledChange, lastEventAt을 관리하고 `users/{uid}.plan`에 권한을 반영한다. 클라이언트가 plan을 변경할 수 없는 기존 Firestore 규칙을 유지한다.
6. 해지 예약은 paid period 종료 시까지 권한을 유지한다. 즉시 해지·환불·연체 시 권한 정책은 출시 전에 확정한다. Free로 돌아가도 기존 컬러북을 자동 삭제하지 않으며 새 저장 제한과 충돌하지 않도록 확인한다. [권한 부여 웹훅 가이드](https://developer.paddle.com/build/subscriptions/provision-access-webhooks/)
7. 결제 완료 화면은 서버 반영 상태를 조회한다. 브라우저 성공 callback만으로 Pro로 바꾸지 않는다. 구독 관리에서 해지·결제수단 변경·청구 내역을 제공한다.

실결제 전에 sandbox로 성공, 갱신, 실패, 해지 예약, 기간 만료, 환불, 중복/역순 webhook 및 다른 uid의 구독 접근 차단을 확인한다.

## 선물 후원 연결

볼펜·라떼·빅맥은 후원금을 친숙하게 표현하는 선택 항목이다. 실제 물품이나 기프티콘을 제공하지 않으며 구독이나 Pro 권한과 연결하지 않는다. 브랜드의 공식 판매 또는 제휴로 표현하지 않는다.

Paddle은 실질적인 소프트웨어/서비스 판매가 없는 donation을 금지한다. 따라서 선물 이름을 붙인 후원을 Paddle 구독 상품으로 등록하지 않는다. [허용 사용 정책](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle)

후원 수납을 승인하는 별도 결제 제공자를 선정한다. 국내 PG(예: Toss Payments)에 개발자 자발적 후원 모델, 국내·해외 카드 수납 및 정산 가능 여부를 확인한다. Toss의 해외 결제는 별도 계약과 카드사 승인이 필요하고 원화로 결제된다. [해외 결제 안내](https://docs.tosspayments.com/resources/glossary/international-payment)

해외 후원 링크를 빨리 열려면 Ko-fi와 PayPal도 검토할 수 있다. Ko-fi는 연결된 PayPal/Stripe로 직접 수납한다. 한국 수취 계정과 한국 구매자의 지원 범위는 별도로 확인해야 하며 Pro의 MoR와 같은 세금 대행을 전제하지 않는다. [Ko-fi 결제 안내](https://help.ko-fi.com/hc/en-us/articles/360013140633-Supporter-payments-FAQ)

PayPal로 직접 해외 선물 후원을 받는 경우, 디지털 상품 5.5% 요율을 순수 후원에 임의 적용하지 않는다. 일반 해외 소액 6% 요율의 승인 및 후원 수납 허용 여부를 확인하고, 국내 후원은 PG의 해당 모델 승인 후 연결한다.

카드는 운영자가 지정한 고정 KRW 금액(BIC 볼펜 1,000원, 스타벅스 카페라떼 4,700원, 빅맥 5,700원)이다. 공식 판매가 또는 국가별 가격 데이터는 아니다. 국가별 상품가를 적용하려면 국가·통화·품목 규격·가격 확인일이 있는 서버 가격표가 필요하다. 환율 환산만으로 현지 상품가라고 표시하지 않는다.

후원 checkout 서버는 gift ID로 금액을 결정하고 일회성 주문을 만든다. 승인된 결제의 서버 검증·중복 방지 후에만 완료를 표시하며 구독 문서나 plan은 변경하지 않는다. 로그인 없이 받는 경우 임의 uid를 신뢰하지 않는다. 영수증, 취소·환불 및 연락처는 제공자 승인 조건에 맞춘다.
