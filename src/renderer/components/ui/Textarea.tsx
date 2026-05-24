import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-[#0F5B59] transition-all disabled:bg-gray-50 disabled:text-gray-400 resize-y min-h-[100px] ${
            error ? "border-red-500 focus:ring-red-500/10 focus:border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="block mt-1 text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
