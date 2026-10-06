import nextEnv from "@next/env";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

nextEnv.loadEnvConfig(process.cwd());
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  console.log("Firebase Admin: configuration missing");
  process.exitCode = 1;
} else {
  try {
    const app = initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey }) });
    await getFirestore(app).collection("billing").doc("sandbox").collection("accounts").limit(1).get();
    console.log("Firebase Admin: authenticated successfully");
  } catch (error) {
    console.log(`Firebase Admin: failed (${error.code ?? "unknown"}); credentials are not printed`);
    process.exitCode = 1;
  }
}
try {
  const sandbox = process.env.PADDLE_ENVIRONMENT !== "production";
  const paddle = new Paddle(process.env.PADDLE_API_KEY, { environment: sandbox ? Environment.sandbox : Environment.production });
  const price = await paddle.prices.get(process.env.PADDLE_PRO_MONTHLY_PRICE_ID);
  const valid = price.status === "active" && price.unitPrice.currencyCode === "KRW" && price.unitPrice.amount === "990"
    && price.billingCycle?.interval === "month" && price.billingCycle.frequency === 1 && !price.trialPeriod
    && price.taxMode === "internal" && price.quantity.minimum === 1 && price.quantity.maximum === 1;
  console.log(`Paddle: ${sandbox ? "sandbox" : "production"} price ${valid ? "verified (KRW 990/month, tax included, quantity 1)" : "invalid"}`);
  if (!valid) process.exitCode = 1;
} catch (error) {
  console.log(`Paddle: failed (${error.code ?? "unknown"}); credentials are not printed`);
  process.exitCode = 1;
}
