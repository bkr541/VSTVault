import React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-gray-200 rounded-lg max-w-md mx-auto ${className}`}>
      <div className="p-3 bg-teal-50 text-[#0F5B59] rounded-full mb-4">
        {icon || <FolderOpen size={24} />}
      </div>
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-4 max-w-xs">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
