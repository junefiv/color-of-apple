"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { ensureUserProfile, subscribeUserProfile, type UserProfile } from "@/lib/firebase/data";
import { useRefresh } from "@/components/refresh-provider";
import { useMatchuStore } from "@/lib/store";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { runRefresh } = useRefresh();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void = () => undefined;
    const unsubscribeAuth = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      unsubscribeProfile();
      setUser(nextUser);
      setProfile(null);

      if (!nextUser) {
        setLoading(false);
        return;
      }

      try {
        await ensureUserProfile(nextUser);
        unsubscribeProfile = subscribeUserProfile(nextUser.uid, setProfile);
      } catch {
        setProfile({
          displayName: nextUser.displayName,
          email: nextUser.email,
          photoURL: nextUser.photoURL,
          plan: "free",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    signIn: () => runRefresh(useMatchuStore.getState().locale === "ko" ? "로그인 중…" : "Signing in…", async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(getFirebaseAuth(), provider);
      await ensureUserProfile(credential.user);
      return credential.user;
    }),
    signOut: () => runRefresh(useMatchuStore.getState().locale === "ko" ? "로그아웃 중…" : "Signing out…", () => firebaseSignOut(getFirebaseAuth())),
  }), [loading, profile, runRefresh, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
