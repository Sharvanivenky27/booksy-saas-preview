"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  "Real-time appointment scheduling",
  "Customer profile management",
  "Multi-location support",
  "Staff and service management",
  "Business performance analytics",
];

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(
        typeof json.error === "string"
          ? json.error
          : "Login failed. Please try again."
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[480px] flex-col bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-12 relative overflow-hidden flex-shrink-0">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-700/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-800/40 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">BookEase</span>
        </Link>

        {/* Middle content */}
        <div className="relative flex-1 flex flex-col justify-center py-12">
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Everything you need to manage your bookings
          </h2>
          <p className="text-brand-300 text-sm mb-8 leading-relaxed">
            The all-in-one platform for service businesses. Schedule appointments,
            manage customers, and grow your business.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-brand-200 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-amber-400 text-sm">★</span>
            ))}
          </div>
          <p className="text-sm text-brand-100 italic mb-4 leading-relaxed">
            &ldquo;BookEase transformed how we manage our salon. Scheduling used to take
            hours — now it&apos;s effortless.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              JR
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Jamie Rivera</p>
              <p className="text-xs text-brand-400">Owner, Luna Hair &amp; Beauty Studio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-brand-700">BookEase</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Sign in to your BookEase account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {serverError && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-600 font-medium hover:underline">
              Create one free
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              Multi-tenant · Secure · Service businesses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
