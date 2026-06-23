import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex flex-col items-center justify-center text-white px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          MVP — Multi-tenant Booking Platform
        </div>
        <h1 className="text-6xl font-bold mb-4 tracking-tight">BookEase</h1>
        <p className="text-xl text-brand-200 mb-2">
          Appointment booking for dental, salon, physiotherapy, automotive &
          more.
        </p>
        <p className="text-brand-300 mb-10 text-sm">
          Multi-tenant · Staff scheduling · Service catalog · Customer management
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-brand-900 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-3xl w-full">
        {[
          { icon: "🦷", label: "Dental" },
          { icon: "✂️", label: "Salon" },
          { icon: "🏃", label: "Physiotherapy" },
          { icon: "🔧", label: "Automotive" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium text-brand-200">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-xs text-brand-400">
        Payments · AI Receptionist · Inventory · Marketing · Loyalty —{" "}
        <span className="italic">coming soon</span>
      </div>
    </main>
  );
}
