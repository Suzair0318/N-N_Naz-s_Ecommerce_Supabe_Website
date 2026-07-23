"use client";

import { cn } from "@/lib/utils";

interface SizeOption {
  size: string;
  disabled?: boolean;
}

interface SizeSelectorProps {
  options: SizeOption[];
  selected?: string;
  onSelect?: (size: string) => void;
}

export function SizeSelector({
  options,
  selected,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected === opt.size;
        return (
          <button
            key={opt.size}
            type="button"
            disabled={opt.disabled}
            onClick={() => onSelect?.(opt.size)}
            className={cn(
              "min-w-[3rem] border px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-charcoal bg-charcoal text-white"
                : "border-border bg-white text-charcoal hover:border-charcoal",
              opt.disabled &&
                "cursor-not-allowed border-border text-muted-foreground line-through opacity-50 hover:border-border"
            )}
          >
            {opt.size}
          </button>
        );
      })}
    </div>
  );
}
