import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "glass";
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "rounded-2xl overflow-hidden";

    const variants = {
      default: "bg-gradient-to-b from-white/5 to-white/0 border border-white/10",
      hover: "bg-gradient-to-b from-white/5 to-white/0 border border-white/10 hover:border-violet-500/60 transition-all cursor-pointer",
      glass: "bg-white/10 backdrop-blur-lg border border-white/20",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={variant === "hover" ? { y: -5 } : undefined}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export default Card;
