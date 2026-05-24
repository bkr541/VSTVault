import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  triggerLabel?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onChange,
  triggerLabel,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-between items-center w-full rounded border border-gray-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500/10 cursor-pointer"
      >
        <span className="flex items-center space-x-2">
          {activeOption?.icon}
          <span>{triggerLabel || activeOption?.label || "Select..."}</span>
        </span>
        <ChevronDown size={16} className="ml-2 text-gray-400" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border border-gray-100 ring-1 ring-black/5 divide-y divide-gray-100 z-50">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                  opt.value === selectedValue
                    ? "bg-teal-50 text-[#0F5B59] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.icon && <span className="mr-2 text-gray-400">{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
