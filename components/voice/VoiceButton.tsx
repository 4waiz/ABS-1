"use client";

import * as React from "react";
import { Mic, MicOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSpeechToText } from "@/hooks/useSpeechToText";

export function VoiceButton({
  enabled,
  language,
  onPartial,
  onFinal,
  onStart,
  onStop,
  className,
  size = "sm",
  label = "Voice input",
  hideIfUnsupported = false,
  highlight = false,
}: {
  enabled: boolean;
  language: string;
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  className?: string;
  size?: "sm" | "md";
  label?: string;
  hideIfUnsupported?: boolean;
  highlight?: boolean;
}) {
  const { supported, listening, toggle } = useSpeechToText({
    lang: language,
    enabled,
    onPartial,
    onFinal,
    onStart,
    onEnd: onStop,
  });

  if (!supported && hideIfUnsupported) return null;

  const isDisabled = !enabled || !supported;

  return (
    <button
      type="button"
      onClick={() => (!isDisabled ? toggle() : undefined)}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border-2 border-border bg-white text-foreground shadow-[2px_2px_0px_rgba(15,23,42,0.2)] transition",
        size === "sm" ? "h-10 w-10" : "h-11 w-11",
        listening && "text-accent",
        isDisabled && "cursor-not-allowed opacity-60",
        highlight && "ring-2 ring-accent ring-offset-2",
        className
      )}
      aria-pressed={listening}
      aria-label={label}
      title={isDisabled ? "Voice not supported in this browser." : label}
    >
      {listening && (
        <span className="absolute inset-0 rounded-full border-2 border-accent/60 animate-pulse" />
      )}
      {isDisabled ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
