import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookEase — Appointment Booking Platform",
  description:
    "Multi-tenant appointment booking for dental, salon, physiotherapy, automotive, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
