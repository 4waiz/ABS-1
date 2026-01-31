"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Smile, Trash2 } from "lucide-react";
import { parseISO } from "date-fns";

import { useLogStore } from "@/store/useLogStore";
import { isDayInRange, labelForDay, formatShortTime, formatFullDate } from "@/lib/date";
import type { DayRange, LogEntry, LogType } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const typeStyles: Record<LogType, string> = {
  did: "bg-primary text-primary-foreground",
  plan: "bg-secondary text-secondary-foreground",
  blocker: "bg-accent text-accent-foreground",
  note: "bg-muted text-muted-foreground",
};

function filterEntries(
  entries: LogEntry[],
  query: string,
  type: LogType | "all",
  range: DayRange,
  tag: string | null
) {
  const lower = query.toLowerCase();
  return entries.filter((entry) => {
    if (type !== "all" && entry.type !== type) return false;
    if (!isDayInRange(entry.day, range)) return false;
    if (tag && !entry.tags.includes(tag)) return false;
    if (
      lower &&
      !entry.text.toLowerCase().includes(lower) &&
      !entry.tags.some((t) => t.toLowerCase().includes(lower)) &&
      !entry.detail?.toLowerCase().includes(lower)
    ) {
      return false;
    }
    return true;
  });
}

function groupByDay(entries: LogEntry[]) {
  const grouped = new Map<string, LogEntry[]>();
  entries.forEach((entry) => {
    if (!grouped.has(entry.day)) grouped.set(entry.day, []);
    grouped.get(entry.day)?.push(entry);
  });
  grouped.forEach((list) => list.sort((a, b) => b.createdAt - a.createdAt));
  return Array.from(grouped.entries()).sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime());
}

export function Timeline({
  maxItemsPerDay,
  maxDays,
  compact = false,
}: {
  maxItemsPerDay?: number;
  maxDays?: number;
  compact?: boolean;
}) {
  const entries = useLogStore((state) => state.entries);
  const filters = useLogStore((state) => state.filters);
  const removeEntry = useLogStore((state) => state.removeEntry);

  const filtered = React.useMemo(
    () => filterEntries(entries, filters.query, filters.type, filters.range, filters.tag),
    [entries, filters]
  );

  const grouped = React.useMemo(() => {
    const all = groupByDay(filtered);
    return maxDays ? all.slice(0, maxDays) : all;
  }, [filtered, maxDays]);

  return (
    <div className="space-y-6">
      {grouped.length === 0 && (
        <Card className="cartoon-shadow">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No entries match this filter yet. Add a quick log to get started.
          </CardContent>
        </Card>
      )}
      {grouped.map(([day, dayEntries]) => {
        const visibleEntries = maxItemsPerDay
          ? dayEntries.slice(0, maxItemsPerDay)
          : dayEntries;
        return (
        <div key={day} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>{labelForDay(day)}</h3>
              <p className="text-xs text-muted-foreground">{formatFullDate(day)}</p>
            </div>
            <Badge variant="outline">{dayEntries.length} items</Badge>
          </div>
          <ul className={cn("space-y-3", compact && "space-y-2")}>
            <AnimatePresence initial={false}>
              {visibleEntries.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <Card className="cartoon-shadow">
                    <CardContent className={cn("flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between", compact && "p-4")}>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", typeStyles[entry.type])}>
                            {entry.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatShortTime(entry.createdAt)}</span>
                        </div>
                        <p className="text-sm font-medium">{entry.text}</p>
                        {entry.detail && (
                          <p className="text-xs text-muted-foreground">{entry.detail}</p>
                        )}
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {entry.minutes !== undefined && (
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-4 w-4" />
                            {entry.minutes} min
                          </span>
                        )}
                        {entry.mood !== undefined && (
                          <span className="flex items-center gap-1">
                            <Smile className="h-4 w-4" />
                            Energy {entry.mood}/5
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                          className="h-8 w-8"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {maxItemsPerDay && dayEntries.length > visibleEntries.length && (
            <p className="text-xs text-muted-foreground">
              Showing {visibleEntries.length} of {dayEntries.length} entries.
            </p>
          )}
        </div>
        );
      })}
    </div>
  );
}
