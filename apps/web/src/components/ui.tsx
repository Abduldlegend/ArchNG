import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import type { RequestStatus } from "../data";

export function Icon({
  name,
  className,
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span aria-hidden="true" className={cn("material-symbols-outlined", filled && "ms-fill", className)}>
      {name}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "danger" | "quiet";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta text-white border border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark",
  secondary:
    "bg-card text-ink border border-hairline-strong hover:bg-surface-low hover:border-ink",
  ghost: "bg-transparent text-ink border border-transparent hover:text-terracotta",
  dark: "bg-ink text-white border border-ink hover:bg-stone hover:border-stone",
  danger: "bg-danger text-white border border-danger hover:bg-[#911b12] hover:border-[#911b12]",
  quiet: "bg-sand text-stone border border-transparent hover:bg-hairline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-body-sm",
  md: "h-11 px-5 text-label",
  lg: "h-12 px-6 text-label",
};

function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

export function LinkButton({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-caps uppercase tracking-[0.09em] text-stone-soft", className)}>
      {children}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "verified" | "warning" | "danger" | "terracotta";
  className?: string;
}) {
  const tones = {
    neutral: "bg-sand text-stone border-hairline",
    verified: "bg-verified-soft text-verified border-verified/25",
    warning: "bg-warning-soft text-warning border-warning/25",
    danger: "bg-danger-soft text-danger border-danger/20",
    terracotta: "bg-terracotta-soft text-terracotta border-terracotta/20",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-caps uppercase tracking-[0.07em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ label = "ARCON Verified", className }: { label?: string; className?: string }) {
  return (
    <Badge tone="verified" className={cn("normal-case tracking-normal", className)}>
      <Icon name="verified" filled className="text-[14px]" />
      {label}
    </Badge>
  );
}

export function StatusPill({ status }: { status: RequestStatus }) {
  const tone =
    status === "Accepted" || status === "Completed"
      ? "verified"
      : status === "Declined" || status === "Cancelled"
        ? "danger"
        : status === "Requested"
          ? "warning"
          : "neutral";

  return (
    <Badge tone={tone}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-body-sm transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-hairline-strong bg-card text-stone hover:border-ink hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-center justify-between gap-3">
        <span className="text-caps uppercase tracking-[0.09em] text-stone-soft">
          {label}
          {required && <span className="ml-1 text-terracotta">*</span>}
        </span>
        {hint && <span className="text-[11px] text-stone-soft">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-body-sm text-danger">{error}</span>}
    </label>
  );
}

const controlClasses =
  "w-full rounded-lg border border-hairline-strong bg-card text-ink text-body placeholder:text-stone/50 transition-colors hover:border-stone-soft focus:border-ink focus:outline-none focus-visible:outline-none";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, "h-12 px-4", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClasses, "min-h-32 px-4 py-3", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        className={cn(controlClasses, "h-12 appearance-none pl-4 pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone"
      />
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-hairline bg-card", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-5", className)}>
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-3 block">{eyebrow}</Eyebrow>}
        <h2 className="font-serif text-headline-lg text-ink">{title}</h2>
        {description && <p className="mt-3 text-body text-stone">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: Array<{ id: string; label: string; count?: number }>;
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar flex gap-1 overflow-x-auto border-b border-hairline", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "relative shrink-0 px-4 py-3 text-label transition-colors",
              active ? "text-ink" : "text-stone hover:text-ink",
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span className={cn("ml-2 text-body-sm tnum", active ? "text-terracotta" : "text-stone-soft")}>
                {item.count}
              </span>
            )}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-terracotta" />}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-body-sm tnum",
                done && "border-verified bg-verified text-white",
                active && "border-terracotta bg-terracotta text-white",
                !done && !active && "border-hairline-strong bg-card text-stone",
              )}
            >
              {done ? <Icon name="check" className="text-[16px]" /> : index + 1}
            </span>
            <span className={cn("text-body-sm", active || done ? "text-ink" : "text-stone")}>{step}</span>
            {index < steps.length - 1 && <span className="hidden h-px w-8 bg-hairline-strong sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sand", className)}>
      <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-panel border border-hairline bg-card shadow-lift sm:rounded-panel",
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-serif text-headline-sm text-ink">{title}</h3>
            {subtitle && <p className="mt-1 text-body-sm text-stone">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-surface-low hover:text-ink"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-hairline bg-surface-low px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "search_off",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-panel border border-dashed border-hairline-strong bg-card px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-stone">
        <Icon name={icon} className="text-[24px]" />
      </span>
      <h3 className="mt-5 font-serif text-headline-sm text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-body text-stone">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card">
      <div className="shimmer aspect-[4/5] w-full" />
      <div className="space-y-3 p-5">
        <div className="shimmer h-4 w-2/3 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="shimmer h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function Crosshairs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      <span className="absolute left-5 top-4 font-mono text-xs text-stone-soft/70">+</span>
      <span className="absolute right-5 top-4 font-mono text-xs text-stone-soft/70">+</span>
      <span className="absolute bottom-4 left-5 font-mono text-xs text-stone-soft/70">+</span>
      <span className="absolute bottom-4 right-5 font-mono text-xs text-stone-soft/70">+</span>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-ink/10 bg-ink px-5 py-3 text-center text-body-sm text-white shadow-lift md:bottom-8 md:left-auto md:right-8 md:translate-x-0 md:text-left"
    >
      {message}
    </div>
  );
}
