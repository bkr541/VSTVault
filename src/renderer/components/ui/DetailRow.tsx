import React from "react";

export interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  icon,
  className = ""
}) => {
  return (
    <div className={`flex items-start justify-between py-2.5 border-b border-gray-50 text-xs ${className}`}>
      <span className="text-gray-400 font-semibold tracking-wide uppercase flex items-center space-x-1.5 flex-shrink-0 mr-4">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span>{label}</span>
      </span>
      <span className="text-gray-800 font-medium text-right break-all">
        {value}
      </span>
    </div>
  );
};
