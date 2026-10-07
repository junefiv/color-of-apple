import { PolicyDocumentView, type PolicyKind } from "@/components/billing/policy-document-view";

export type { PolicyKind };

export function PolicyDocument({ kind }: { kind: PolicyKind }) {
  return (
    <PolicyDocumentView
      kind={kind}
      operator={process.env.BILLING_OPERATOR_NAME}
      email={process.env.BILLING_SUPPORT_EMAIL}
    />
  );
}
