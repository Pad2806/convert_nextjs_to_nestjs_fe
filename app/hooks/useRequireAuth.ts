"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type RequireAuthOptions = {
  roles?: string[];
};

export function useRequireAuth(options?: RequireAuthOptions) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const allowedRoles = options?.roles;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      const next = encodeURIComponent(location.pathname);
      router.push(`/login?next=${next}`);
      return;
    }

    if (
      allowedRoles &&
      session?.user?.role &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.push("/403");
    }
  }, [status, session, allowedRoles, router]);

  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user as {
      id: string;
      role: string;
      clinic_id?: string;
      name?: string;
      email?: string;
    } | null,
  };
}
