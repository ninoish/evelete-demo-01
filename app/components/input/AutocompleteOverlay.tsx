import React, { useEffect, useMemo, useRef, useState } from "react";

type Candidate = { label: string; value: string; alias?: string };

type AutocompleteOverlayProps = {
  value: string | null; // 確定値 (候補クリックでのみ変更)
  onChange: (newValue: string | null) => void;
  candidates: Candidate[];
  prioritizedValues?: string[];
  placeholder?: string;
  id?: string; // aria 識別子用
  disabled?: boolean;
  buttonStyle?: object;
};

export function AutocompleteOverlay({
  value,
  onChange,
  candidates,
  placeholder = "Search...",
  id = "autocomplete",
  disabled,
  prioritizedValues = [],
  buttonStyle
}: AutocompleteOverlayProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sort = (cs: Candidate[]) => {
    return cs.sort((a, b) => {
      if (prioritizedValues?.length) {
        const aIsPriority = prioritizedValues.includes(a.value);
        const bIsPriority = prioritizedValues.includes(b.value);
        if (aIsPriority && bIsPriority) {
          return -1;
        }
        if (aIsPriority) {
          return -1;
        }
        if (bIsPriority) {
          return 1;
        }
      }
      return a.label > b.label ? 1 : -1;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return sort(candidates);
    }
    return sort(
      candidates.filter((c) => {
        return (
          c.label.toLowerCase().includes(q) ||
          c.alias?.toLowerCase().includes(q)
        );
      }),
    );
  }, [candidates, query]);

  // open 時にフォーカス & query 初期化
  useEffect(() => {
    if (!open) {
      return;
    }
    const selected = candidates.find((c) => c.value === value)?.label;
    setQuery(selected ?? "");
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Esc で閉じる (Enter は無視: クリック確定のみ)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSelect = (c: Candidate) => {
    onChange(c.value); // 値は候補クリックでのみ確定
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    console.log("cleared");
  };

  const selectedLabel = value
    ? candidates.find((c) => c.value === value)?.label || placeholder
    : placeholder;

  return (
    <div className="w-full">
      <div className="relative">
        <button
          type="button"
          className={`w-full text-left rounded-2xl border px-4 py-3 bg-white shadow-sm hover:shadow transition ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
          style={{...buttonStyle || {}}}
          onClick={() => {
            if (!disabled) {
              // TODO: ブラウザバックで閉じられるようにしたい。
              setOpen(true);
            }
          }}
          onFocus={() => !disabled && setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={`${id}-dialog`}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className={value ? "text-gray-900" : "text-gray-400"}>
              {selectedLabel}
            </span>
          </div>
        </button>
        {value && (
          <button
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 z-10"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>
      {/* オーバーレイ */}
      {open && (
        <div
          id={`${id}-dialog`}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-white"
          onClick={() => setOpen(false)}
        >
          {/* 上部: 入力 */}
          <div
            className="sticky top-0 bg-white border-b"
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor={`${id}-input`} className="sr-only">
              Search
            </label>
            <div className="flex gap-2 items-center p-4">
              <input
                ref={inputRef}
                id={`${id}-input`}
                className="rounded flex-1 px-4 py-2 text-lg outline-none"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // クリックのみで確定させたいので Enter は何もしない
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              />
              <button
                type="button"
                className="rounded-lg border px-3 py-2"
                onClick={() => {
                  setOpen(false);
                  onChange(null);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* 下部: 候補 (flex-wrap, 下部のみスクロール) */}
          <div
            className="p-4 overflow-y-auto"
            style={{ height: "calc(100vh - 72px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No matches
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {filtered.map((c) => (
                <button
                  key={c.value}
                  className={`px-4 py-2 rounded-xl border bg-white hover:bg-gray-100 ${prioritizedValues.includes(c.value) ? "border-emerald-400" : ""}`}
                  onClick={() => handleSelect(c)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
