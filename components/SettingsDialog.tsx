"use client";

import * as React from "react";
import { Settings2, Sparkles } from "lucide-react";

import { useLogStore } from "@/store/useLogStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const languages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
];

export function SettingsDialog({
  onOpenTutorial,
  triggerClassName,
}: {
  onOpenTutorial: () => void;
  triggerClassName?: string;
}) {
  const settings = useLogStore((state) => state.settings);
  const setSettings = useLogStore((state) => state.setSettings);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <Settings2 className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Control voice input and revisit the tutorial anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-border bg-white p-4 shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
            <div>
              <p className="text-sm font-semibold">Enable voice input</p>
              <p className="text-xs text-muted-foreground">Turn on speech-to-text for logging.</p>
            </div>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(checked) => setSettings({ voiceEnabled: checked })}
            />
          </div>
          <div className="rounded-2xl border-2 border-border bg-white p-4 shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
            <p className="text-sm font-semibold">Voice language</p>
            <p className="text-xs text-muted-foreground">Pick the language for recognition.</p>
            <select
              value={settings.voiceLanguage}
              onChange={(event) => setSettings({ voiceLanguage: event.target.value })}
              className="mt-3 w-full rounded-full border-2 border-border bg-white px-4 py-2 text-sm shadow-[2px_2px_0px_rgba(15,23,42,0.2)]"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-border bg-white p-4 shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
            <div>
              <p className="text-sm font-semibold">Need a refresher?</p>
              <p className="text-xs text-muted-foreground">Replay the in-app walkthrough.</p>
            </div>
            <Button variant="accent" size="sm" onClick={onOpenTutorial}>
              <Sparkles className="h-4 w-4" />
              Tutorial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
