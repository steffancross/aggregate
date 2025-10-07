// https://github.com/shadcn-ui/ui/issues/948#issuecomment-2679374754
// brought the code from above and vibecoded the create new option part so don't really know how this comp works :))
"use client";

import { useState, useCallback, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  allowAdd?: boolean;
}

export function MultiSelect({
  options: initialOptions,
  selected,
  onChange,
  placeholder = "Select options...",
  emptyText = "No options found.",
  className,
  allowAdd = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [internalOptions, setInternalOptions] = useState(initialOptions);
  console.log(internalOptions);

  const handleSelect = useCallback(
    (value: string) => {
      const updatedSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      onChange(updatedSelected);
    },
    [selected, onChange],
  );

  const handleCreateNew = useCallback(() => {
    if (searchValue.trim() && allowAdd) {
      const newValue = searchValue.trim();
      const newLabel = searchValue.trim();

      const existingOption = internalOptions.find(
        (option) => option.value.toLowerCase() === newValue.toLowerCase(),
      );

      if (!existingOption) {
        const newOption = { value: newValue, label: newLabel };
        setInternalOptions((prev) => [...prev, newOption]);
      }
      handleSelect(newValue);
      setSearchValue("");
    }
  }, [searchValue, allowAdd, internalOptions, handleSelect]);

  const selectedLabels = useMemo(
    () =>
      selected
        .map((value) => {
          const option = internalOptions.find(
            (option) => option.value === value,
          );
          return option ? option.label : value; // Fallback to value if not found
        })
        .join(", "),
    [selected, internalOptions],
  );

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) return internalOptions;
    return internalOptions.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [internalOptions, searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {selected.length > 0 ? selectedLabels : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search options..."
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
                  value={option.value}
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
            {allowAdd && searchValue.trim() && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateNew}
                  className="text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create &quot;{searchValue}&quot;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
