import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function adminApp() {
  const name = "color-of-apple-billing";
  const existing = getApps().find(app => app.name === name);
  if (existing) return existing;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "matchu-a1fbb";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return initializeApp({
    projectId,
    credential: clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey }) : applicationDefault(),
  }, name);
}

export function getFirebaseAdminAuth() { return getAuth(adminApp()); }
export function getFirebaseAdminDb() { return getFirestore(adminApp()); }
