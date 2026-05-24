import React from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className = ""
}) => {
  return (
    <div className={`bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex items-start justify-between ${className}`}>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
          {title}
        </span>
        <span className="text-xl font-bold text-gray-900 tracking-tight block">
          {value}
        </span>
        {description && (
          <span className="text-[10px] text-gray-500 mt-1 block">
            {description}
          </span>
        )}
      </div>
      {icon && (
        <div className="p-2 bg-teal-50 text-[#0F5B59] rounded-lg">
          {icon}
        </div>
      )}
    </div>
  );
};
