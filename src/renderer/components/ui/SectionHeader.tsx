import React from "react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-100 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div className="mt-3 md:mt-0 flex items-center space-x-2">{action}</div>}
    </div>
  );
};
