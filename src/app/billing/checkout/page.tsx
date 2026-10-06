import { CheckoutReturn } from "@/components/billing/checkout-return";

export default async function CheckoutPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const receipt = query.transaction_id;
  const paymentLink = query._ptxn;
  const transactionId = typeof receipt === "string" ? receipt : typeof paymentLink === "string" ? paymentLink : null;
  return <CheckoutReturn transactionId={transactionId} paymentLink={typeof paymentLink === "string" && !receipt} />;
}
