import type React from "react";
import { Inter } from "next/font/google";
import "../../../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function PublishedQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-slate-50 ${inter.className}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">{children}</div>
    </div>
  );
}
