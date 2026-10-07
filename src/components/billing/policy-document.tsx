import Link from "next/link";
import { SiteHeader } from "@/components/brand/site-header";

export type PolicyKind = "terms" | "privacy" | "refund-policy";

const documents: Record<PolicyKind, { title: string; sections: [string, string][] }> = {
  terms: { title: "이용약관 / Terms of service", sections: [
    ["서비스 / Service", "Color of Apple은 기준색으로 UI 팔레트를 생성하고 컬러북을 저장·공유·다운로드하는 웹 서비스입니다. Free는 저장 슬롯 5개를 제공하며, Pro는 유료 이용 기간 동안 무제한 저장을 제공합니다. 팔레트 생성, 공유, 다운로드의 기본 제공 범위는 플랜 비교표에서 확인할 수 있습니다. / Color of Apple generates UI color palettes and lets you save, share and download colorbooks. Free includes five storage slots; Pro includes unlimited storage during your paid access period."],
    ["Pro 구독 / Pro subscription", "기준 가격은 세금을 포함한 월 KRW 990이며 매월 자동 갱신됩니다. 실제 청구 금액·통화·갱신 조건은 결제창과 영수증에서 확인해 주세요. 결제와 판매 관련 세금 처리는 Merchant of Record인 Paddle이 담당합니다. 결제에는 Paddle 구매자 약관도 적용됩니다. / The base price is KRW 990 per month including tax, renewing automatically each month. Review the amount, currency and renewal terms at checkout. Paddle acts as Merchant of Record and handles payment and sales taxes. Paddle Buyer Terms also apply."],
    ["해지와 데이터 / Cancellation and data", "구독 관리에서 다음 갱신을 해지할 수 있습니다. 해지 예약 후에는 결제한 이용 기간이 끝날 때까지 Pro를 이용할 수 있습니다. Free로 돌아가도 기존 컬러북은 자동 삭제되지 않으며 열람·수정·삭제할 수 있습니다. 새 저장에는 Free 슬롯 제한이 적용됩니다. 결제 실패 후에는 결제가 확인된 기간까지만 Pro 권한을 제공합니다. / Cancel future renewals in subscription settings. Pro lasts through your paid period after scheduled cancellation. Existing colorbooks are kept and remain accessible, editable and removable; new saves use the Free slot limit. Access after a failed renewal is limited to the paid period."],
    ["계정과 이용 / Accounts and use", "저장·공유·다운로드 및 구독에는 Google 계정 로그인이 필요합니다. 계정과 공유 링크는 사용자가 관리해야 하며, 타인의 권리를 침해하거나 서비스의 정상 운영을 방해하는 이용은 허용되지 않습니다. / A Google account is required for saving, sharing, downloading and subscribing. You are responsible for your account and shared links. Do not infringe others' rights or disrupt the service."],
    ["선물 후원 / Gifts", "선물 후원은 실제 물품이나 기프티콘 제공 또는 Pro 구독과 별개입니다. Paddle Pro 결제에서는 선물 후원을 받지 않습니다. / Gifts do not provide physical products, vouchers or Pro access. Gifts are not processed through the Paddle Pro checkout."],
  ] },
  "refund-policy": { title: "환불 정책 / Refund policy", sections: [
    ["환불 요청 / Request a refund", "Paddle에서 결제한 구독의 환불·청약철회 요청은 Paddle.net 또는 결제 확인 이메일의 지원 링크에서 접수할 수 있습니다. 문의할 때 결제 영수증의 거래 번호와 결제 이메일을 사용해 주세요. / Request a refund or withdrawal through Paddle.net or the support link in your payment confirmation email. Use the transaction reference and billing email from your receipt."],
    ["적용 기준 / Applicable policy", "Paddle의 환불 정책과 구매자 거주 국가에 적용되는 소비자 권리에 따라 처리됩니다. 국가별 철회 기간과 예외가 다르며, 모든 결제에 일률적으로 환불 불가 조건을 적용하지 않습니다. 아래 Paddle 공식 환불 정책에서 현재 기준을 확인해 주세요. / Requests are handled under Paddle's Refund Policy and applicable consumer rights in your country. Withdrawal periods and exceptions vary by country. See Paddle's current policy below."],
    ["구독 해지와 환불 / Cancellation and refunds", "다음 자동 갱신 해지는 과거 결제의 자동 환불과 다릅니다. 환불을 원하면 별도로 요청해야 합니다. 현재 이용 기간 결제가 전액 환불되거나 차지백 처리되면 해당 결제에 따른 Pro 권한은 중단됩니다. 일부 환불은 Pro 권한을 자동 중단하지 않습니다. 기존 컬러북은 삭제하지 않습니다. / Canceling future renewals does not automatically refund previous payments. Request a refund separately. A full refund or chargeback of your current period ends the associated Pro access; a partial refund does not automatically end access. Existing colorbooks are kept."],
  ] },
  privacy: { title: "개인정보 처리방침 / Privacy notice", sections: [
    ["처리하는 정보와 목적 / Data and purpose", "Google 로그인에서 제공되는 사용자 식별자, 이름, 이메일, 프로필 이미지와 사용자가 저장한 컬러북을 계정 인증·저장·공유 기능에 사용합니다. 구독 이용자의 Paddle 고객·구독·거래 식별자, 구독 상태, 결제된 이용 기간 및 환불 상태를 구독 관리와 권한 확인에 사용합니다. / We use your Google account identifier, name, email, profile image and saved colorbooks to provide account and storage features. Paddle customer, subscription and transaction identifiers, subscription status, paid access periods and refund status are used to manage subscriptions and access."],
    ["처리 업체 / Providers", "Firebase Authentication·Cloud Firestore가 계정과 저장 데이터를, Vercel이 웹 서비스 호스팅을, Paddle이 결제 및 판매 관련 세금 처리를 담당합니다. 결제 시 인증된 이메일을 Paddle 고객 생성에 사용합니다. 카드 번호는 Color of Apple 서버에 저장하지 않습니다. 각 업체의 처리 위치 및 개인정보 정책은 해당 업체의 공식 안내를 확인해 주세요. / Firebase Authentication and Cloud Firestore provide account and storage services; Vercel hosts the app; Paddle handles payments and sales taxes. Your verified email is used to create a Paddle customer. Color of Apple does not store card numbers. See each provider's policy for processing locations and practices."],
    ["분석과 공유 / Analytics and sharing", "Firebase Analytics로 생성·저장·다운로드 등 기능 사용 이벤트를 분석합니다. 분석 이벤트에 이메일, 사용자 ID, 프로젝트 제목이나 전체 공유 데이터를 넣지 않습니다. 공유 링크에는 팔레트 데이터가 포함되므로 링크를 전달받은 사람이 내용을 볼 수 있습니다. / Firebase Analytics measures feature usage such as generation, saves and downloads. Our product events do not include email, user ID, project title or the complete shared payload. Shared links contain palette data that recipients can view."],
    ["보유·삭제·문의 / Retention, deletion and contact", "계정과 저장 데이터는 기능 제공에 필요한 동안 보유하며, 컬러북은 사용자가 삭제할 수 있습니다. 계정 데이터 열람·정정·삭제는 아래 문의 연락처로 요청해 주세요. 결제 기록은 분쟁 처리와 법적 의무에 필요한 기간 보관될 수 있으며, Paddle에 보관된 결제 데이터 요청은 Paddle에도 접수할 수 있습니다. / Account and saved data are retained while needed to provide the service; you can delete colorbooks. Contact us below to request access, correction or deletion of account data. Payment records may be retained for disputes and legal obligations. Requests for data held by Paddle can also be made to Paddle."],
  ] },
};

export function PolicyDocument({ kind }: { kind: PolicyKind }) {
  const content = documents[kind];
  const operator = process.env.BILLING_OPERATOR_NAME;
  const email = process.env.BILLING_SUPPORT_EMAIL;
  return <div className="min-h-dvh bg-background text-foreground"><SiteHeader />
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <article className="rounded-2xl border bg-card px-5 py-7 text-card-foreground sm:px-10 sm:py-10">
      <h1 className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">{content.title}</h1>
      {!operator || !email ? <p className="mt-4 rounded-xl border p-3 text-sm">출시 전 검토용 초안입니다. 운영자와 고객 문의 연락처 확정 후 게시합니다. / Prelaunch draft pending operator identity and support contact.</p> : <p className="mt-4 text-sm">운영자 / Operator: {operator} · 문의 / Contact: <a className="underline" href={`mailto:${email}`}>{email}</a></p>}
      {content.sections.map(([title, body]) => <section key={title} className="mt-9"><h2 className="text-lg font-semibold leading-relaxed">{title}</h2>{body.split(" / ").map((paragraph, index) => <p key={index} lang={index === 0 ? "ko" : "en"} className={`mt-3 whitespace-pre-wrap break-words text-base leading-8 ${index === 0 ? "text-card-foreground" : "text-muted-foreground"}`}>{paragraph}</p>)}</section>)}
      <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t pt-6 text-sm leading-6 underline underline-offset-4" aria-label="Legal policies">
        <Link href="/pricing">플랜 / Plans</Link><Link href="/terms">약관 / Terms</Link><Link href="/privacy">개인정보 / Privacy</Link><Link href="/refund-policy">환불 / Refunds</Link>
        <a href="https://www.paddle.com/legal/buyer-terms">Paddle Buyer Terms</a><a href="https://www.paddle.com/legal/refund-policy">Paddle Refund Policy</a><a href="https://paddle.net">Paddle support</a>
        {kind === "privacy" ? <><a href="https://firebase.google.com/support/privacy">Firebase Privacy</a><a href="https://vercel.com/legal/privacy-policy">Vercel Privacy</a><a href="https://www.paddle.com/legal/privacy">Paddle Privacy</a></> : null}
      </nav>
      </article>
    </main>
  </div>;
}
