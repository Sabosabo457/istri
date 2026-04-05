"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";

export function useAdmin(redirectIfNotAdmin = true) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 認証の読み込みが終わった時点で判定を行う
    if (!authLoading) {
      const adminUidsString = process.env.NEXT_PUBLIC_ADMIN_UIDS || "";
      console.log("Admin Check - adminUids:", adminUidsString); // デバッグ用ログ
      console.log("Admin Check - currentUser UID:", user?.uid); // デバッグ用ログ

      const adminUids = adminUidsString.split(",").map(u => u.trim()).filter(Boolean);
      const check = user && adminUids.includes(user.uid);
      
      setIsAdmin(!!check);
      setLoading(false); // 必ずここで loading を解除

      if (redirectIfNotAdmin && !check) {
        console.warn("Unauthorized access attempt to admin area. Redirecting...");
        router.push("/");
      }
    }
  }, [user, authLoading, router, redirectIfNotAdmin]);

  return { isAdmin, loading };
}
