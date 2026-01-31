"use client";

import * as React from "react";
import { CalendarDays, ClipboardCheck, Trophy } from "lucide-react";
import { endOfWeek, format, parseISO, startOfWeek, subDays } from "date-fns";

import { useLogStore } from "@/store/useLogStore";
import type { LogEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function inWeek(entry: LogEntry, mode: "thisWeek" | "last7") {
  const today = new Date();
  if (mode === "last7") {
    const start = subDays(today, 6);
    return parseISO(entry.day) >= start;
  }
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  const date = parseISO(entry.day);
  return date >= start && date <= end;
}

function sumMinutes(entries: LogEntry[]) {
  return entries.reduce((sum, entry) => sum + (entry.minutes ?? 0), 0);
}

export function WeeklyReview() {
  const entries = useLogStore((state) => state.entries);
  const [mode, setMode] = React.useState<"thisWeek" | "last7">("thisWeek");

  const weekEntries = React.useMemo(
    () => entries.filter((entry) => inWeek(entry, mode)),
    [entries, mode]
  );

  const totals = React.useMemo(() => {
    const totalMinutes = sumMinutes(weekEntries);
    const did = weekEntries.filter((entry) => entry.type === "did");
    const plans = weekEntries.filter((entry) => entry.type === "plan");
    const blockers = weekEntries.filter((entry) => entry.type === "blocker");
    const notes = weekEntries.filter((entry) => entry.type === "note");

    const tagCounts = new Map<string, number>();
    weekEntries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      totalMinutes,
      did,
      plans,
      blockers,
      notes,
      topTags,
    };
  }, [weekEntries]);

  const weekLabel = React.useMemo(() => {
    if (mode === "last7") {
      return `Last 7 days - ${format(subDays(new Date(), 6), "MMM d")} to ${format(new Date(), "MMM d")}`;
    }
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return `Week of ${format(start, "MMM d")}`;
  }, [mode]);

  const reviewText = React.useMemo(() => {
    return [
      `Weekly Review (${weekLabel})`,
      "",
      "Wins:",
      totals.did.length ? totals.did.slice(0, 5).map((entry) => `- ${entry.text}`).join("\n") : "- (none yet)",
      "",
      "Next up:",
      totals.plans.length ? totals.plans.slice(0, 5).map((entry) => `- ${entry.text}`).join("\n") : "- (none yet)",
      "",
      "Blockers:",
      totals.blockers.length ? totals.blockers.slice(0, 5).map((entry) => `- ${entry.text}`).join("\n") : "- (none yet)",
      "",
      `Highlights: ${totals.notes.length} notes, ${totals.totalMinutes} minutes logged`,
      `Focus tags: ${totals.topTags.join(", ") || "(none yet)"}`,
    ].join("\n");
  }, [totals, weekLabel]);

  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card className="cartoon-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Weekly Review Generator
        </CardTitle>
        <CardDescription>
          A ready-to-send recap from your logs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={mode === "thisWeek" ? "secondary" : "outline"}
            onClick={() => setMode("thisWeek")}
          >
            <CalendarDays className="h-4 w-4" />
            This week
          </Button>
          <Button
            variant={mode === "last7" ? "secondary" : "outline"}
            onClick={() => setMode("last7")}
          >
            <CalendarDays className="h-4 w-4" />
            Last 7 days
          </Button>
          <Badge variant="outline">{weekLabel}</Badge>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">{totals.did.length} wins</Badge>
            <Badge variant="outline">{totals.plans.length} next</Badge>
            <Badge variant="outline">{totals.blockers.length} blockers</Badge>
            <Badge variant="outline">{totals.totalMinutes} min logged</Badge>
          </div>
          <div className="rounded-2xl border-2 border-border bg-white p-4 text-xs leading-relaxed text-muted-foreground shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
            {reviewText.split("\n").map((line, index) => (
              <p key={`${line}-${index}`}>{line || "\u00A0"}</p>
            ))}
          </div>
        </div>
        <Button onClick={handleCopy} className="w-full">
          <ClipboardCheck className="h-4 w-4" />
          {copied ? "Copied" : "Copy weekly review"}
        </Button>
      </CardContent>
    </Card>
  );
}
