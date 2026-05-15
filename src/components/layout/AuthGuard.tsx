"use client";

import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/ui/PageLoader";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader fullScreen />;
  }

  return <>{children}</>;
}
