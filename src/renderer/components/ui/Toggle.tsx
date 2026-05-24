import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  className = ""
}) => {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? "bg-[#0F5B59]" : "bg-gray-200"}`} />
        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </label>
  );
};
