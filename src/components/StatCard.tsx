import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "sky" | "emerald" | "amber" | "indigo" | "rose";
}

const variantStyles = {
  sky: "bg-sky-50 text-sky-600 border-sky-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "sky",
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div
        className={cn(
          "w-12 h-12 rounded-xl border flex items-center justify-center shadow-inner",
          variantStyles[variant]
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
