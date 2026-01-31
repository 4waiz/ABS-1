export type LogType = "did" | "plan" | "blocker" | "note";

export interface LogEntry {
  id: string;
  text: string;
  type: LogType;
  tags: string[];
  minutes?: number;
  mood?: number;
  detail?: string;
  createdAt: number;
  day: string;
}

export type DayRange = "today" | "yesterday" | "last7" | "thisWeek" | "all";

export interface FiltersState {
  query: string;
  type: LogType | "all";
  range: DayRange;
  tag: string | null;
}

export interface SettingsState {
  voiceEnabled: boolean;
  voiceLanguage: string;
}
