import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${icon ? "pl-12 lg:pl-14" : "pl-4 lg:pl-6"} pr-4 lg:pr-6 py-3 lg:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm lg:text-base placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all ${
              error ? "border-red-500" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm lg:text-base text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
