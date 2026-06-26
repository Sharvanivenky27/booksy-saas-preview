"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, MapPin, BarChart3 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BUSINESS_TYPES = [
  { value: "DENTAL", label: "🦷 Dental" },
  { value: "SALON", label: "✂️ Salon / Beauty" },
  { value: "PHYSIOTHERAPY", label: "🏃 Physiotherapy" },
  { value: "AUTOMOTIVE", label: "🔧 Automotive Repair" },
  { value: "OTHER", label: "📋 Other" },
];

const HIGHLIGHTS = [
  { icon: CalendarDays, text: "Appointment scheduling & reminders" },
  { icon: Users, text: "Customer profile management" },
  { icon: MapPin, text: "Multi-location support" },
  { icon: BarChart3, text: "Business performance analytics" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(
        typeof json.error === "string"
          ? json.error
          : "Registration failed. Please try again."
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
            Grow your service business with confidence
          </h2>
          <p className="text-brand-300 text-sm mb-8 leading-relaxed">
            Join hundreds of businesses who use BookEase to streamline scheduling,
            delight customers, and drive growth.
          </p>
          <div className="space-y-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <h.icon className="h-4 w-4 text-brand-300" />
                </div>
                <span className="text-sm text-brand-200">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Setup steps */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">
            Get started in 3 steps
          </p>
          <div className="space-y-2.5">
            {[
              "Create your account",
              "Add your services & staff",
              "Start booking clients",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm text-brand-200">
                <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-8">
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
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Get started for free — no credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Smith"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                autoComplete="organization"
                placeholder="My Dental Clinic"
                error={errors.businessName?.message}
                {...register("businessName")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="businessType-trigger">Business Type</Label>
              <Select
                value={businessType}
                onValueChange={(val) => {
                  setBusinessType(val);
                  setValue(
                    "businessType",
                    val as RegisterInput["businessType"]
                  );
                }}
              >
                <SelectTrigger id="businessType-trigger">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-xs text-red-600">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            {serverError && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              By creating an account you agree to our{" "}
              <span className="text-gray-500">Terms of Service</span> and{" "}
              <span className="text-gray-500">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
