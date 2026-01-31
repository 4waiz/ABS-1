"use client";

import * as React from "react";
import { BarChart3, Mic, NotebookPen, Sparkles, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const steps = [
  {
    title: "Welcome to Daily Recall",
    description: "A playful, local-first logbook for quick daily updates.",
    icon: Sparkles,
  },
  {
    title: "Log in under 60 seconds",
    description: "Type a short line, tag it, and hit add. Done.",
    icon: NotebookPen,
  },
  {
    title: "Standup + Weekly Review",
    description: "Instant summaries for standups and weekly recaps.",
    icon: Target,
  },
  {
    title: "Voice-to-text",
    description: "Tap the mic to speak. We convert it to a clean log entry.",
    icon: Mic,
  },
  {
    title: "Try it now",
    description: "We will focus the log input and highlight the mic button.",
    icon: BarChart3,
  },
];

export function TutorialDialog({
  open,
  onOpenChange,
  onTryNow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onTryNow: () => void;
}) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!open) {
      setStep(0);
    }
  }, [open]);

  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tutorial</DialogTitle>
          <DialogDescription>Get a quick walkthrough in less than a minute.</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-border bg-secondary text-secondary-foreground shadow-[2px_2px_0px_rgba(15,23,42,0.2)]">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">{current.title}</p>
              <p className="text-xs text-muted-foreground">{current.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <span
                key={`step-${index}`}
                className={cn(
                  "h-2 w-8 rounded-full border-2 border-border",
                  index === step ? "bg-primary" : "bg-white"
                )}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => {
                  const next = step + 1;
                  setStep(next);
                  if (next === steps.length - 1) {
                    onTryNow();
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                variant="accent"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
