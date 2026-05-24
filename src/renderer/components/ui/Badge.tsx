import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "neutral",
  ...props
}) => {
  const baseStyle = "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border";
  
  const variants = {
    primary: "bg-teal-50 border-teal-200 text-[#0F5B59]",
    secondary: "bg-gray-100 border-gray-200 text-gray-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    neutral: "bg-gray-50 border-gray-200 text-gray-600"
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
