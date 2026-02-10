import React, { InputHTMLAttributes, forwardRef } from "react";
import { LucideIcon } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon: Icon, containerClassName, ...props }, ref) => {
    return (
      <div className={`space-y-2 ${containerClassName || ""}`}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
            border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all
            ${Icon ? "pl-10" : ""}
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}`}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
