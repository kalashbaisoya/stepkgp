import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "link" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "clay-btn clay-primary hover:bg-brand-hover",
  secondary: "clay-btn clay-plain",
  dark: "clay-btn clay-dark",
  ghost: "rounded-[0.875rem] text-foreground hover:bg-muted transition-colors",
  destructive: "clay-btn bg-status-danger text-white [--clay-ink:#fff]",
  link: "text-brand underline-offset-4 hover:underline p-0 h-auto",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Base button primitive. Clay: soft, rounded, lifts on hover, presses on click. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        variant !== "link" && sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
