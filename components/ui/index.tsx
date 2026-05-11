import React, { forwardRef, type HTMLAttributes } from "react";
export { Modal } from "@/components/modal";
import { cn } from "@/lib/utils";

// --- CARD ---
export const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { header?: React.ReactNode; footer?: React.ReactNode }
>(({ className, header, footer, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm transition-shadow duration-200 hover:shadow-md",
      className
    )}
    {...props}
  >
    {header && <div className="border-b border-gray-100 px-6 py-4">{header}</div>}
    <div className={(!header && !footer) ? "p-6" : ""}>{children}</div>
    {footer && <div className="border-t border-gray-100 px-6 py-4">{footer}</div>}
  </div>
));
Card.displayName = "Card";

// --- BUTTON ---
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "danger" | "success";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
    icon?: React.ReactNode;
  }
>(
  ({ className, variant = "default", size = "md", loading, icon, children, ...props }, ref) => {
    const sizeClasses: Record<string, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-9 w-9 p-0",
    };
    const variantClasses: Record<string, string> = {
      default:
        "bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] text-white shadow-sm hover:shadow-md hover:from-[#152d4a] hover:to-[#1d4ed8] active:scale-[0.98]",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900",
      ghost:
        "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      danger:
        "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
      success:
        "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700",
    };
    const disabledClass = props.disabled
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "";
    const spinner = loading
      ? <svg className="animate-spin h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
      : null;
    const iconEl = icon && !loading ? <span className={cn(size === "sm" ? "mr-1.5" : "mr-2")}>{icon}</span> : null;
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none",
          sizeClasses[size],
          variantClasses[variant],
          disabledClass,
          className
        )}
        {...props}
      >
        {spinner}{iconEl}{children}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- INPUT ---
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }>(
  ({ className, icon, ...props }, ref) => (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>}
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
          "transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
          "invalid:border-red-300 invalid:focus:border-red-500 invalid:focus:ring-red-200",
          icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";

// --- TEXTAREA ---
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
        "transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20",
        "resize-none",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// --- LABEL ---
export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-semibold text-gray-700", className)} {...props} />
  )
);
Label.displayName = "Label";

// --- SELECT ---
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900",
        "transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20",
        "cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-no-repeat bg-[right_0.75rem_center]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// --- TABLE ---
export const Table = ({ className, header, footer, ...props }: HTMLAttributes<HTMLTableElement> & { header?: React.ReactNode; footer?: React.ReactNode }) => (
  <div className="overflow-hidden rounded-xl border border-gray-200">
    {header && <div className="border-b border-gray-100 bg-[#F8FAFC] px-5 py-3">{header}</div>}
    <table className={cn("w-full text-sm", className)} {...props} />
    {footer && <div className="border-t border-gray-100 bg-[#F8FAFC] px-5 py-3">{footer}</div>}
  </div>
);

export const Th = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("bg-[#F8FAFC] px-5 py-3.5 text-left font-semibold text-gray-600 uppercase tracking-wider text-[11px] border-b border-gray-200", className)} {...props} />
);

export const Td = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-5 py-3.5 border-b border-gray-100 text-gray-700 last:text-right", className)} {...props} />
);

// --- BADGE ---
export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement> & { variant?: "blue" | "green" | "red" | "amber" | "purple" | "gray" }>(
  ({ className, variant = "gray", ...props }, ref) => {
    const variants: Record<string, string> = {
      blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
      green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
      red: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
      amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
      purple: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
      gray: "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20",
    };
    return (
      <span ref={ref} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", variants[variant], className)} {...props} />
    );
  }
);
Badge.displayName = "Badge";

// --- SIDEBAR NAV ITEMS ---
export const SidebarNav = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <nav className={cn("flex-1 overflow-y-auto px-3 py-4 space-y-0.5", className)} {...props}>
    {children}
  </nav>
);

export const SidebarItem = forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean; icon?: React.ReactNode }
>(({ className, active, icon, children, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
      active
        ? "bg-[#1E3A5F] text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      className
    )}
    {...props}
  >
    {icon && (active
      ? React.cloneElement(icon as React.ReactElement, { className: cn("h-4 w-4 shrink-0 opacity-100") })
      : React.cloneElement(icon as React.ReactElement, { className: cn("h-4 w-4 shrink-0 opacity-60", active && "opacity-100") })
    )}
    {children}
  </a>
));
SidebarItem.displayName = "SidebarItem";

// --- SEPARATOR ---
export const Separator = ({ className, ...props }: HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn("border-gray-200", className)} {...props} />
);

// --- AVATAR ---
export const Avatar = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg"; initials?: string; src?: string }
>(({ className, size = "md", initials, src, ...props }, ref) => {
  const sizes: Record<string, string> = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white font-semibold uppercase shrink-0",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? <img src={src} alt="" className="rounded-full w-full h-full object-cover" /> : initials}
    </div>
  );
});
Avatar.displayName = "Avatar";

// --- STAT CARD ---
export const StatCard = ({ title, value, change, icon, trend = "up", color = "blue" }: {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "amber" | "red" | "purple";
}) => {
  const colors: Record<string, { bg: string; iconBg: string; iconBorder: string; trendUp: string; trendDown: string }> = {
    blue:   { bg: "bg-blue-50 border-blue-100", iconBg: "bg-blue-100", iconBorder: "border-blue-200", trendUp: "text-green-600", trendDown: "text-red-600" },
    green:  { bg: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", iconBorder: "border-emerald-200", trendUp: "text-green-600", trendDown: "text-red-600" },
    amber:  { bg: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", iconBorder: "border-amber-200", trendUp: "text-green-600", trendDown: "text-red-600" },
    red:    { bg: "bg-red-50 border-red-100", iconBg: "bg-red-100", iconBorder: "border-red-200", trendUp: "text-green-600", trendDown: "text-red-600" },
    purple: { bg: "bg-violet-50 border-violet-100", iconBg: "bg-violet-100", iconBorder: "border-violet-200", trendUp: "text-green-600", trendDown: "text-red-600" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={cn("rounded-xl border p-5 transition-all duration-200 hover:shadow-md", c.bg, c.iconBorder)}>
      <div className="flex items-center justify-between">
        <div className={cn("rounded-lg p-2", c.iconBg)}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5", trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            {trend === "up" ? "↑" : "↓"} {change}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
      </div>
    </div>
  );
};

// --- ALERT ---
export const Alert = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { variant?: "info" | "success" | "warning" | "error" | "destructive" }
>(({ className, variant = "info", children, ...props }, ref) => {
  const variants: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    error: "bg-red-50 border-red-200 text-red-700",
    destructive: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div ref={ref} className={cn("rounded-lg border p-4 text-sm", variants[variant], className)} role="alert" {...props}>
      {children}
    </div>
  );
});
Alert.displayName = "Alert";