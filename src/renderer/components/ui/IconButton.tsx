import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "active";
  size?: "sm" | "md";
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className = "",
  variant = "ghost",
  size = "md",
  ...props
}) => {
  const baseStyle = "flex items-center justify-center rounded transition-all focus:outline-none transition-colors duration-150 cursor-pointer";
  
  const variants = {
    primary: "bg-[#0F5B59] hover:bg-[#0c4a48] text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
    danger: "text-red-500 hover:bg-red-50",
    ghost: "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
    active: "bg-teal-50 text-[#0F5B59] hover:bg-teal-100/70"
  };

  const sizes = {
    sm: "p-1.5 w-7 h-7",
    md: "p-2 w-9 h-9"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
