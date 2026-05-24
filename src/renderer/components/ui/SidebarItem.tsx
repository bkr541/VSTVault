import React from "react";

export interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  active = false,
  count,
  onClick,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
        active
          ? "bg-[#F3F4F6] text-[#0F5B59] font-semibold"
          : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-gray-900"
      } ${className}`}
    >
      <div className="flex items-center space-x-2.5 truncate">
        <span className={`flex-shrink-0 ${active ? "text-[#0F5B59]" : "text-[#9CA3AF]"}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      {count !== undefined && (
        <span
          className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
            active ? "bg-[#E8F3F2] text-[#0F5B59]" : "bg-transparent text-[#9CA3AF]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
