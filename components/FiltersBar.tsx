"use client";

import * as React from "react";
import { Filter, Search, SlidersHorizontal, Tag } from "lucide-react";

import { useLogStore } from "@/store/useLogStore";
import { cn } from "@/lib/utils";
import type { DayRange, LogType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const typeFilters: Array<{ value: LogType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "did", label: "Did" },
  { value: "plan", label: "Plan" },
  { value: "blocker", label: "Blocker" },
  { value: "note", label: "Note" },
];

const rangeFilters: Array<{ value: DayRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7" },
  { value: "thisWeek", label: "This week" },
  { value: "all", label: "All" },
];

export function FiltersBar({ compact = false }: { compact?: boolean }) {
  const entries = useLogStore((state) => state.entries);
  const filters = useLogStore((state) => state.filters);
  const setFilters = useLogStore((state) => state.setFilters);
  const clearFilters = useLogStore((state) => state.clearFilters);

  const topTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [entries]);

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(event) => setFilters({ query: event.target.value })}
            placeholder="Search entries, tags, or blockers"
            className="pl-11"
          />
        </div>
        <Button variant="outline" onClick={clearFilters} className="shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          Reset
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {typeFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setFilters({ type: filter.value })}
            className={cn(
              "rounded-full border-2 border-border px-3 py-1 text-xs font-semibold shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
              filters.type === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-white text-muted-foreground"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Range</span>
        {rangeFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setFilters({ range: filter.value })}
            className={cn(
              "rounded-full border-2 border-border px-3 py-1 text-xs shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
              filters.range === filter.value
                ? "bg-secondary text-secondary-foreground"
                : "bg-white text-muted-foreground"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {!compact && topTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {topTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setFilters({ tag: filters.tag === tag ? null : tag })
              }
              className={cn(
                "rounded-full border-2 border-border px-3 py-1 text-xs shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
                filters.tag === tag
                  ? "bg-accent text-accent-foreground"
                  : "bg-white text-muted-foreground"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
