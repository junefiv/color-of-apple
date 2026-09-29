import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6ZQzybz17pa9iNfQdbzqjCeL_2S7m4Ps",
  authDomain: "matchu-a1fbb.firebaseapp.com",
  projectId: "matchu-a1fbb",
  storageBucket: "matchu-a1fbb.firebasestorage.app",
  messagingSenderId: "9496934240",
  appId: "1:9496934240:web:994a5b468fddbd4e6b5005",
  measurementId: "G-FK961ZKLHF",
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function getFirebaseApp() {
  app ??= getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth() {
  auth ??= getAuth(getFirebaseApp());
  return auth;
}

export function getFirebaseDb() {
  firestore ??= getFirestore(getFirebaseApp());
  return firestore;
}
