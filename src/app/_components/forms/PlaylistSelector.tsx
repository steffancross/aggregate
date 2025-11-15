"use client";

import { useState, useCallback, useMemo } from "react";
import { Check } from "lucide-react";

import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

export type Option = {
  value: number;
  label: string;
};

interface PlaylistTrackSelectorProps {
  options: Option[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function PlaylistSelector({
  options: initialOptions,
  selected,
  onChange,
  placeholder = "Search",
  emptyText = "No playlists found.",
  className,
}: PlaylistTrackSelectorProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSelect = useCallback(
    (value: number) => {
      const updatedSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      onChange(updatedSelected);
    },
    [selected, onChange],
  );

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) return initialOptions;
    return initialOptions.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [initialOptions, searchValue]);

  return (
    <div className={cn("w-full", className)}>
      <Command className="rounded-lg border" shouldFilter={false}>
        <CommandInput
          placeholder={placeholder}
          className="h-9"
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value.toString()}
                onSelect={() => handleSelect(option.value)}
              >
                {option.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
