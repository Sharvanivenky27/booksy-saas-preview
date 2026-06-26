"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-brand-700">BookEase</h1>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">
            Create your business account
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
