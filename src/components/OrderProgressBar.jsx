import { CheckCircle, Circle, Package, Truck, MapPin, Home, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "confirmado", label: "Confirmado", icon: ClipboardList, description: "Pedido recibido" },
  { key: "preparando", label: "Preparando", icon: Package, description: "Preparando tu pedido" },
  { key: "enviado", label: "Enviado", icon: Truck, description: "En camino al courier" },
  { key: "en_camino", label: "En camino", icon: MapPin, description: "Fuera para entrega" },
  { key: "entregado", label: "Entregado", icon: Home, description: "¡Paquete entregado!" },
];

const STATUS_ORDER = ["confirmado", "preparando", "enviado", "en_camino", "entregado"];

export default function OrderProgressBar({ status }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="w-full py-6">
      {/* Desktop progress */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border z-0" />
        {/* Active line */}
        <div
          className="absolute top-6 left-0 h-0.5 bg-primary z-0 transition-all duration-700 ease-in-out"
          style={{ width: currentIndex === 0 ? "0%" : `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-background border-primary text-primary ring-4 ring-primary/20 scale-110",
                  !isCompleted && !isCurrent && "bg-background border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-sm font-semibold transition-colors",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-xs mt-0.5 transition-colors",
                  isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile progress */}
      <div className="sm:hidden flex flex-col space-y-0">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isLast = idx === STEPS.length - 1;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-background border-primary text-primary ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-background border-border text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                {!isLast && (
                  <div className={cn(
                    "w-0.5 h-8 mt-1 transition-colors",
                    isCompleted ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
              <div className="pt-2 pb-6">
                <p className={cn(
                  "text-sm font-semibold",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-xs mt-0.5",
                  isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}