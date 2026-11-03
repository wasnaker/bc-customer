"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  /** Teks kecil sekunder (mis. kode customer). */
  hint?: string;
}

export interface SearchableSelectFetchOptions {
  (search: string, signal?: AbortSignal): Promise<SearchableSelectOption[]>;
}

interface SearchableSelectProps {
  id: string;
  value: SearchableSelectOption | null;
  onSelect: (option: SearchableSelectOption | null) => void;
  fetchOptions: SearchableSelectFetchOptions;
  /** Label accessible (aria-label input). */
  ariaLabel: string;
  /** Teks di input bila belum ada pilihan. */
  placeholder: string;
  loadingText: string;
  emptyText: string;
  errorText: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/**
 * Combobox ringan (WAI-ARIA 1.2 pattern) untuk daftar panjang yang dicari
 * di server — dipakai pemilih customer (API cap limit 50, jadi Select biasa
 * tidak memadai). Hanya mengandalkan host Input, react-query, dan cn.
 */
export function SearchableSelect({
  id,
  value,
  onSelect,
  fetchOptions,
  ariaLabel,
  placeholder,
  loadingText,
  emptyText,
  errorText,
  disabled = false,
  invalid = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Debounce ketikan → query server.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const optionsQuery = useQuery({
    queryKey: ["customer", "searchable-select", id, debouncedQuery],
    queryFn: ({ signal }) => fetchOptions(debouncedQuery, signal),
    enabled: open,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  const options = useMemo(
    () => (open ? (optionsQuery.data ?? []) : []),
    [open, optionsQuery.data],
  );

  useEffect(() => {
    setHighlighted(0);
  }, [debouncedQuery, optionsQuery.dataUpdatedAt]);

  // Tutup saat klik di luar.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openListbox = useCallback(() => {
    setQuery("");
    setOpen(true);
  }, []);

  const selectOption = useCallback(
    (option: SearchableSelectOption) => {
      onSelect(option);
      setOpen(false);
      setQuery("");
    },
    [onSelect],
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          openListbox();
        } else {
          setHighlighted((i) => Math.min(i + 1, options.length - 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (open && options[highlighted]) {
          event.preventDefault();
          selectOption(options[highlighted]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
    }
  }

  // Scroll opsi ter-highlight ke dalam pandangan.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[highlighted] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const displayValue = open ? query : (value?.label ?? "");

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Input
        id={id}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-invalid={invalid}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onFocus={openListbox}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="h-9 w-full text-sm"
      />
      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-[var(--elevation-2)]"
        >
          {optionsQuery.isLoading ? (
            <li
              role="status"
              aria-live="polite"
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              {loadingText}
            </li>
          ) : optionsQuery.isError ? (
            <li role="alert" className="px-3 py-2 text-sm text-destructive">
              {errorText}
            </li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {emptyText}
            </li>
          ) : (
            options.map((option, index) => {
              const selected = value?.value === option.value;
              return (
                <li
                  key={option.value}
                  role="option"
                  id={`${id}-option-${option.value}`}
                  aria-selected={selected}
                  onMouseDown={(e) => {
                    // Cegah blur input sebelum click terproses.
                    e.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm",
                    index === highlighted
                      ? "bg-primary/10 text-primary"
                      : "text-foreground",
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {option.hint && (
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
