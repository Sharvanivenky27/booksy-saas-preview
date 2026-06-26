import Link from "next/link";
import {
  CalendarDays,
  Users,
  BarChart3,
  Shield,
  Zap,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description:
      "Real-time availability, zero double-bookings, and automated reminders that keep your calendar full.",
    iconColor: "text-brand-600",
    iconBg: "bg-brand-50",
  },
  {
    icon: Users,
    title: "Customer Profiles",
    description:
      "Build rich customer histories with notes, preferences, and booking patterns — all in one place.",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Track revenue, occupancy, and staff performance. Know what's working at a glance.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
  {
    icon: MapPin,
    title: "Multi-Location",
    description:
      "Manage multiple locations from one dashboard. Each branch has its own data — one login.",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    icon: Shield,
    title: "Secure & Isolated",
    description:
      "Multi-tenant architecture means your data is always completely isolated from other businesses.",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    icon: Zap,
    title: "Up in Minutes",
    description:
      "No setup fees, no technical knowledge required. Add services, staff, and start booking today.",
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
  },
];

const INDUSTRIES = [
  {
    emoji: "✂️",
    title: "Salons & Spas",
    description: "Chair-by-chair scheduling, stylist profiles, and client color notes.",
  },
  {
    emoji: "🦷",
    title: "Dental Clinics",
    description: "Patient management, appointment reminders, and chair availability.",
  },
  {
    emoji: "🏃",
    title: "Physiotherapy",
    description: "Session tracking, therapist scheduling, and patient progress notes.",
  },
  {
    emoji: "🔧",
    title: "Automotive",
    description: "Bay scheduling, technician assignment, and service history by vehicle.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up in 30 seconds. Set up your business name, type, and basic details.",
  },
  {
    number: "02",
    title: "Configure your services",
    description:
      "Add your services, staff members, and locations. Customize pricing and durations.",
  },
  {
    number: "03",
    title: "Start taking bookings",
    description:
      "Your dashboard goes live immediately. Create bookings, track status, grow your business.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">BookEase</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-300 hover:text-white transition-colors px-4 py-2 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-white text-brand-900 px-4 py-2 rounded-lg hover:bg-brand-50 transition-colors"
            >
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-brand-200 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            Multi-tenant booking platform for service businesses
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            The booking platform{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-cyan-300">
              your business deserves
            </span>
          </h1>
          <p className="text-xl text-brand-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop juggling spreadsheets and phone calls. BookEase gives you
            appointment scheduling, customer management, and business
            insights — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors text-base shadow-lg"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto pt-10 border-t border-white/10">
            {[
              { value: "10K+", label: "Bookings managed" },
              { value: "500+", label: "Businesses onboarded" },
              { value: "4", label: "Industries supported" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-brand-300 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Built for the way you work
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              From solo practitioners to multi-location businesses, BookEase scales to fit your operation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 p-6 hover:border-brand-100 hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Industry-ready
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Made for your industry
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Pre-configured for the unique workflows of each service vertical.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-brand-100 transition-all text-center group"
              >
                <div className="text-4xl mb-4 inline-block group-hover:scale-110 transition-transform duration-200">
                  {ind.emoji}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{ind.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{ind.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Simple by design
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Up and running in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white text-2xl font-bold mb-6 shadow-lg">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to grow your business?
          </h2>
          <p className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of businesses already using BookEase to streamline their appointments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
            >
              Get started — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Already have an account?
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-brand-200 text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Set up in minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Cancel any time
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <CalendarDays className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">BookEase</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-brand-400">
              <Link href="/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Get Started
              </Link>
            </div>
            <p className="text-xs text-brand-600">
              © {new Date().getFullYear()} BookEase. All rights reserved.
            </p>
          </div>
          <p className="text-center text-xs text-brand-700 mt-6">
            Payments · AI Receptionist · Inventory · Marketing · Loyalty —{" "}
            <span className="italic">coming soon</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
