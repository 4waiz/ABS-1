"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Clock3, Sparkles, Tag, Zap } from "lucide-react";

import { useLogStore } from "@/store/useLogStore";
import { dayKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VoiceButton } from "@/components/voice/VoiceButton";
import type { LogType } from "@/types";

const typeOptions: { value: LogType; label: string; tone: string }[] = [
  { value: "did", label: "Did", tone: "bg-primary text-primary-foreground" },
  { value: "plan", label: "Plan", tone: "bg-secondary text-secondary-foreground" },
  { value: "blocker", label: "Blocker", tone: "bg-accent text-accent-foreground" },
  { value: "note", label: "Note", tone: "bg-muted text-muted-foreground" },
];

const quickTags = ["Build", "Code", "Meeting", "Study", "Review", "Design"];

function parseTags(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function LogComposer({
  compact = false,
  highlightVoice = false,
}: {
  compact?: boolean;
  highlightVoice?: boolean;
}) {
  const addEntry = useLogStore((state) => state.addEntry);
  const settings = useLogStore((state) => state.settings);
  const [text, setText] = React.useState("");
  const [type, setType] = React.useState<LogType>("did");
  const [tags, setTags] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [minutes, setMinutes] = React.useState<number | "">("");
  const [mood, setMood] = React.useState<number>(3);
  const [detail, setDetail] = React.useState("");
  const [showDetails, setShowDetails] = React.useState(false);
  const [dayChoice, setDayChoice] = React.useState<"today" | "yesterday">("today");
  const voiceTargetRef = React.useRef<"main" | "tags" | "detail">("main");
  const voiceBaseRef = React.useRef("");

  const day = React.useMemo(() => {
    if (dayChoice === "yesterday") {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return dayKey(date);
    }
    return dayKey(new Date());
  }, [dayChoice]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const mergedTags = Array.from(
      new Set([...parseTags(tags), ...selectedTags])
    );
    addEntry({
      text,
      type,
      tags: mergedTags,
      minutes: minutes === "" ? undefined : minutes,
      mood,
      detail: detail.trim() ? detail : undefined,
      day,
    });
    setText("");
    setTags("");
    setSelectedTags([]);
    setMinutes("");
    setDetail("");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleVoiceStart = (target: "main" | "tags" | "detail") => {
    voiceTargetRef.current = target;
    if (target === "main") voiceBaseRef.current = text;
    if (target === "tags") voiceBaseRef.current = tags;
    if (target === "detail") voiceBaseRef.current = detail;
  };

  const applyVoiceText = (incoming: string, finalize: boolean) => {
    const nextValue = `${voiceBaseRef.current} ${incoming}`.trim();
    if (voiceTargetRef.current === "main") {
      setText(nextValue);
      if (finalize && !voiceBaseRef.current && ["did", "plan", "blocker"].includes(type)) {
        addEntry({
          text: nextValue,
          type,
          tags: Array.from(new Set([...parseTags(tags), ...selectedTags])),
          minutes: minutes === "" ? undefined : minutes,
          mood,
          detail: detail.trim() ? detail : undefined,
          day,
        });
        setText("");
      }
      return;
    }
    if (voiceTargetRef.current === "tags") {
      setTags(nextValue);
      return;
    }
    setDetail(nextValue);
  };

  return (
    <Card className="cartoon-shadow">
      <CardHeader className={cn("pb-4", compact && "pb-2")}>
        <CardTitle className={cn("flex items-center gap-2", compact ? "text-xl" : "text-2xl")}>
          <Sparkles className="h-6 w-6 text-accent" />
          Log your day in under 60 seconds
        </CardTitle>
        {!compact && (
          <CardDescription>
            Capture a quick note, label it, and move on. Your future self will thank you.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={cn(
                "rounded-full border-2 border-border px-4 py-1 text-sm font-semibold transition shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
                type === option.value ? option.tone : "bg-white text-muted-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="log-input"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="What did you work on?"
              className="flex-1"
              autoFocus
              onFocus={() => {
                voiceTargetRef.current = "main";
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
            <VoiceButton
              enabled={settings.voiceEnabled}
              language={settings.voiceLanguage}
              onStart={() => handleVoiceStart("main")}
              onPartial={(value) => applyVoiceText(value, false)}
              onFinal={(value) => applyVoiceText(value, true)}
              highlight={highlightVoice}
            />
          </div>
          <Button onClick={handleSubmit} className="sm:w-auto" disabled={!text.trim()}>
            <Zap className="h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setDayChoice("today")}
            className={cn(
              "flex items-center gap-1 rounded-full border-2 border-border px-3 py-1 shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
              dayChoice === "today" ? "bg-primary text-primary-foreground" : "bg-white"
            )}
          >
            <CalendarCheck className="h-4 w-4" />
            Today
          </button>
          <button
            type="button"
            onClick={() => setDayChoice("yesterday")}
            className={cn(
              "flex items-center gap-1 rounded-full border-2 border-border px-3 py-1 shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
              dayChoice === "yesterday" ? "bg-secondary text-secondary-foreground" : "bg-white"
            )}
          >
            <CalendarCheck className="h-4 w-4" />
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="ml-auto rounded-full border-2 border-border bg-white px-3 py-1 shadow-[2px_2px_0px_rgba(15,23,42,0.2)]"
          >
            {showDetails ? "Hide details" : "Add details"}
          </button>
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border-2 border-border px-3 py-1 text-xs font-semibold shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-muted-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="Tags (comma separated)"
                onFocus={() => {
                  voiceTargetRef.current = "tags";
                }}
              />
              <VoiceButton
                enabled={settings.voiceEnabled}
                language={settings.voiceLanguage}
                onStart={() => handleVoiceStart("tags")}
                onPartial={(value) => applyVoiceText(value, false)}
                onFinal={(value) => applyVoiceText(value, true)}
                label="Voice tags"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Textarea
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                placeholder="Extra context (optional)"
                className="min-h-[80px]"
                onFocus={() => {
                  voiceTargetRef.current = "detail";
                }}
              />
              <VoiceButton
                enabled={settings.voiceEnabled}
                language={settings.voiceLanguage}
                onStart={() => handleVoiceStart("detail")}
                onPartial={(value) => applyVoiceText(value, false)}
                onFinal={(value) => applyVoiceText(value, true)}
                label="Voice note"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={minutes}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "") {
                      setMinutes("");
                      return;
                    }
                    const parsed = Number(value);
                    if (!Number.isNaN(parsed)) setMinutes(parsed);
                  }}
                  placeholder="Minutes"
                  className="w-28"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Energy</span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 border-border text-sm shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
                      mood === value
                        ? "bg-accent text-accent-foreground"
                        : "bg-white"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {(selectedTags.length > 0 || tags.trim()) && (
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...selectedTags, ...parseTags(tags)])).map(
              (tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
