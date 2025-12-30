import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-1 font-medium rounded-full";

    const variants = {
      primary: "bg-violet-600/30 text-violet-300 border border-violet-500/30",
      secondary: "bg-white/10 text-gray-300 border border-white/20",
      success: "bg-green-600/30 text-green-300 border border-green-500/30",
      warning: "bg-yellow-600/30 text-yellow-300 border border-yellow-500/30",
      outline: "bg-transparent text-gray-300 border border-white/30",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-2 text-base",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
