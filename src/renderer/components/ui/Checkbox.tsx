import React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={`h-4 w-4 text-[#0F5B59] focus:ring-teal-500/10 border-gray-300 rounded cursor-pointer transition-all ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
