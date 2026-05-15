"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      const data = await res.json();
      if (!data.success) return null;
      return data.data as User;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user: user ?? null,
    loading: isLoading,
    logout: () => logoutMutation.mutate(),
    refetch: () => queryClient.invalidateQueries({ queryKey: ["currentUser"] }),
  };
}
