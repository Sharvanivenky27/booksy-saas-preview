"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  UserCog,
  MapPin,
  Settings,
  BookOpen,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/services", icon: Scissors, label: "Services" },
  { href: "/staff", icon: UserCog, label: "Staff" },
  { href: "/locations", icon: MapPin, label: "Locations" },
];

// Not yet built. Listed (rather than linked) so the sidebar never
// points at a route that 404s/renders blank.
const PLACEHOLDER_ITEMS = [
  { label: "Calendar", icon: CalendarDays },
  { label: "Settings", icon: Settings },
  { label: "Payments" },
  { label: "AI Receptionist" },
  { label: "Inventory" },
  { label: "Marketing" },
  { label: "Loyalty" },
];

interface SidebarProps {
  businessName?: string;
  userName?: string;
  userRole?: string;
}

function formatRole(role?: string) {
  if (!role) return "Member";
  const map: Record<string, string> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    STAFF: "Staff",
  };
  return map[role] ?? role.charAt(0) + role.slice(1).toLowerCase();
}

export function Sidebar({ businessName = "My Business", userName = "User", userRole }: SidebarProps) {
  const pathname = usePathname();
  const { mobileOpen, closeMobile } = useSidebar();
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // Mobile drawer: trap focus, close on Escape, and lock body scroll while open.
  // Only engages below the lg breakpoint, where the drawer behaves like an overlay.
  useEffect(() => {
    if (!mobileOpen || typeof window === "undefined" || window.innerWidth >= 1024) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMobile();
        return;
      }
      if (e.key !== "Tab" || !asideRef.current) return;

      const focusable = asideRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        ref={asideRef}
        role="navigation"
        aria-label="Main"
        aria-modal={mobileOpen ? "true" : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 min-h-screen bg-brand-950 text-white flex flex-col transition-transform duration-200 ease-in-out",
          "lg:static lg:z-auto lg:w-60 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-base font-bold text-white leading-none">BookEase</span>
              <p className="text-xs text-brand-300 mt-0.5 truncate">{businessName}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeMobile}
            className="lg:hidden text-brand-400 hover:text-white p-1 -mr-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  active
                    ? "bg-brand-700 text-white"
                    : "text-brand-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
              </Link>
            );
          })}

        {/* Placeholders */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] uppercase tracking-widest text-brand-500 font-semibold">
            Coming Soon
          </p>
        </div>
        {PLACEHOLDER_ITEMS.map((item) => (
          <div
            key={item.label}
            aria-disabled="true"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-brand-600 cursor-default select-none"
          >
            {item.icon ? (
              <item.icon className="h-4 w-4 flex-shrink-0" />
            ) : (
              <span className="h-4 w-4 rounded bg-brand-800 flex-shrink-0" />
            )}
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-[10px] uppercase tracking-wide text-brand-700 flex-shrink-0">
              Soon
            </span>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <p className="text-xs text-brand-400">{formatRole(userRole)}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-brand-400 hover:text-white transition-colors rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      </aside>
    </>
  );
}
