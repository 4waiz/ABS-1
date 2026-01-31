"use client";

import * as React from "react";
import { Clipboard, Mic, Wand2 } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";

import { useLogStore } from "@/store/useLogStore";
import { dayKey } from "@/lib/date";
import type { LogEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function entriesForDay(entries: LogEntry[], day: string) {
  return entries.filter((entry) => entry.day === day);
}

function formatList(entries: LogEntry[]) {
  return entries.map((entry) => `- ${entry.text}`).join("\n") || "- (none yet)";
}

export function StandupPanel({
  compact = false,
  defaultSnappy = false,
}: {
  compact?: boolean;
  defaultSnappy?: boolean;
}) {
  const entries = useLogStore((state) => state.entries);
  const today = dayKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);
  const [snappy, setSnappy] = React.useState(defaultSnappy);

  const maxItems = snappy ? 2 : 5;

  const yesterdayEntries = entriesForDay(entries, yesterday).filter((entry) => entry.type === "did" || entry.type === "note");
  const todayEntries = entriesForDay(entries, today).filter((entry) => entry.type === "plan");
  const blockerCutoff = subDays(new Date(), 6);
  const blockers = entries.filter((entry) => entry.type === "blocker" && parseISO(entry.day) >= blockerCutoff);

  const standupText = React.useMemo(() => {
    return `Standup - ${format(new Date(), "MMM d")}` +
      `\n\nYesterday:\n${formatList(yesterdayEntries.slice(0, maxItems))}` +
      `\n\nToday:\n${formatList(todayEntries.slice(0, maxItems))}` +
      `\n\nBlockers:\n${formatList(blockers.slice(0, maxItems))}`;
  }, [yesterdayEntries, todayEntries, blockers, maxItems]);

  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(standupText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card className="cartoon-shadow">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Standup Mode
        </CardTitle>
        {!compact && (
          <CardDescription>
            Automatic standup summary, formatted for a quick update.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold">Yesterday</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {yesterdayEntries.length === 0 && <li>- (none yet)</li>}
              {yesterdayEntries.slice(0, maxItems).map((entry) => (
                <li key={entry.id}>- {entry.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Today</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {todayEntries.length === 0 && <li>- (none yet)</li>}
              {todayEntries.slice(0, maxItems).map((entry) => (
                <li key={entry.id}>- {entry.text}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Blockers</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {blockers.length === 0 && <li>- (none yet)</li>}
              {blockers.slice(0, maxItems).map((entry) => (
                <li key={entry.id}>- {entry.text}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} variant="secondary">
            <Clipboard className="h-4 w-4" />
            {copied ? "Copied" : "Copy update"}
          </Button>
          <Button variant="outline" onClick={() => setSnappy((prev) => !prev)}>
            <Wand2 className="h-4 w-4" />
            {snappy ? "Expand" : "Keep it snappy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
