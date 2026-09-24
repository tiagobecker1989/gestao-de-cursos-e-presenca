import { CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  situacao: "APROVADO" | "RECUPERACAO" | string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ situacao, showIcon = true, className }: StatusBadgeProps) {
  const isAprovado = situacao === "APROVADO";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all",
        isAprovado
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
        className
      )}
    >
      {showIcon &&
        (isAprovado ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        ))}
      {isAprovado ? "Aprovado" : "Recuperação"}
    </span>
  );
}
