"use client";

import { Bell, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { openMobile } = useSidebar();

  return (
    <header className="h-16 border-b border-gray-200 bg-white/95 backdrop-blur-sm flex items-center px-4 sm:px-6 lg:px-8 gap-3 flex-shrink-0 sticky top-0 z-30">
      <button
        onClick={openMobile}
        className="lg:hidden -ml-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 truncate tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <button
          disabled
          aria-label="Notifications (coming soon)"
          title="Notifications (coming soon)"
          className="relative p-2 text-gray-300 rounded-lg cursor-not-allowed opacity-40"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
