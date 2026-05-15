"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AntIcon from "@/components/AntIcon";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile-only logo */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <AntIcon size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">DYM AntWork</h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Task System</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
      <p className="text-slate-500 mt-1 mb-8">Sign in to your account to continue</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@dymvietnam.net"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="h-11 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-600/25 transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        No account?{" "}
        <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
