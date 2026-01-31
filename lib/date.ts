import {
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  subDays,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import type { DayRange } from "@/types";

export function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function labelForDay(day: string) {
  const date = parseISO(day);
  const now = new Date();
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, subDays(now, 1))) return "Yesterday";
  return format(date, "EEE, MMM d");
}

export function isDayInRange(day: string, range: DayRange) {
  if (range === "all") return true;
  const date = startOfDay(parseISO(day));
  const today = startOfDay(new Date());

  if (range === "today") return isSameDay(date, today);
  if (range === "yesterday") return isSameDay(date, subDays(today, 1));
  if (range === "last7") {
    const start = subDays(today, 6);
    return (isAfter(date, start) || isSameDay(date, start)) && (isBefore(date, today) || isSameDay(date, today));
  }

  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  return (isAfter(date, start) || isSameDay(date, start)) && (isBefore(date, end) || isSameDay(date, end));
}

export function formatShortTime(timestamp: number) {
  return format(new Date(timestamp), "p");
}

export function formatFullDate(day: string) {
  return format(parseISO(day), "EEEE, MMMM d");
}
