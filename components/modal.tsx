"use client";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ open, onClose, title, children, size = "md" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: keyof typeof sizes }) {
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; if (open) document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className={cn("w-full rounded-lg bg-white p-6 shadow-xl", sizes[size])} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
