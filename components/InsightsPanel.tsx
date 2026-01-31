"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { addDays, format, subDays } from "date-fns";

import { useLogStore } from "@/store/useLogStore";
import { dayKey } from "@/lib/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function buildChartData(entries: { day: string; minutes?: number }[]) {
  const start = subDays(new Date(), 6);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));

  return days.map((date) => {
    const day = dayKey(date);
    const daily = entries.filter((entry) => entry.day === day);
    return {
      day: format(date, "EEE"),
      count: daily.length,
      minutes: daily.reduce((sum, entry) => sum + (entry.minutes ?? 0), 0),
    };
  });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { minutes: number; count: number } }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-2xl border-2 border-border bg-white/90 p-3 text-xs shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">{data.count} entries</p>
      <p className="text-muted-foreground">{data.minutes} minutes</p>
    </div>
  );
}

export function InsightsPanel({ compact = false }: { compact?: boolean }) {
  const entries = useLogStore((state) => state.entries);
  const data = React.useMemo(() => buildChartData(entries), [entries]);

  return (
    <Card className="cartoon-shadow">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Weekly Momentum
        </CardTitle>
        {!compact && (
          <CardDescription>
            Track how many highlights you captured each day.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={compact ? "h-44" : "h-64"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="count" fill="rgba(45, 212, 191, 0.8)" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
