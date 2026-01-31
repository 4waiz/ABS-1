"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Menu,
  Mic,
  PencilLine,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";
import { subDays } from "date-fns";

import { useLogStore } from "@/store/useLogStore";
import { dayKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogComposer } from "@/components/LogComposer";
import { FiltersBar } from "@/components/FiltersBar";
import { Timeline } from "@/components/Timeline";
import { StandupPanel } from "@/components/StandupPanel";
import { WeeklyReview } from "@/components/WeeklyReview";
import { InsightsPanel } from "@/components/InsightsPanel";
import { WebGLStage } from "@/components/WebGLStage";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageGrid } from "@/components/layout/PageGrid";
import { TutorialDialog } from "@/components/TutorialDialog";
import { SettingsDialog } from "@/components/SettingsDialog";

const views = [
  { id: "log", label: "Log", icon: PencilLine },
  { id: "recall", label: "Recall", icon: ClipboardList },
  { id: "standup", label: "Standup", icon: Mic },
  { id: "review", label: "Review", icon: Trophy },
  { id: "insights", label: "Insights", icon: BarChart3 },
] as const;

type ViewId = (typeof views)[number]["id"];

function useStats() {
  const entries = useLogStore((state) => state.entries);
  return React.useMemo(() => {
    const today = dayKey(new Date());
    const todayEntries = entries.filter((entry) => entry.day === today);
    const minutes = todayEntries.reduce((sum, entry) => sum + (entry.minutes ?? 0), 0);

    const days = new Set(entries.map((entry) => entry.day));
    let streak = 0;
    let cursor = new Date();
    while (days.has(dayKey(cursor))) {
      streak += 1;
      cursor = subDays(cursor, 1);
    }

    return {
      todayCount: todayEntries.length,
      minutes,
      streak,
    };
  }, [entries]);
}

function useTopTags() {
  const entries = useLogStore((state) => state.entries);
  return React.useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [entries]);
}

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export function AppShell() {
  const stats = useStats();
  const topTags = useTopTags();
  const [activeView, setActiveView] = React.useState<ViewId>("log");
  const [tutorialOpen, setTutorialOpen] = React.useState(false);
  const [highlightVoice, setHighlightVoice] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("dailyRecall_seen_tutorial");
    if (!seen) {
      setTutorialOpen(true);
    }
  }, []);

  const handleTutorialChange = (open: boolean) => {
    setTutorialOpen(open);
    if (!open && typeof window !== "undefined") {
      window.localStorage.setItem("dailyRecall_seen_tutorial", "true");
      setHighlightVoice(false);
    }
  };

  const focusLogInput = () => {
    setActiveView("log");
    setHighlightVoice(true);
    setTimeout(() => {
      const input = document.getElementById("log-input") as HTMLInputElement | null;
      input?.focus();
    }, 200);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="py-4">
        <PageContainer>
          <div className="cartoon-card relative bg-white/95 p-4">
            <WebGLStage className="pointer-events-none absolute right-6 top-4 -z-10 hidden h-24 w-24 lg:block" />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/awaiz-ahmed/"
                  target="_blank"
                  rel="noreferrer"
                  className="sticker inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Made by Awaiz
                </a>
                <div>
                  <h1 className="text-2xl md:text-3xl">Daily Recall</h1>
                  <p className="text-xs text-muted-foreground">Zero-stress progress logs for fast updates.</p>
                </div>
              </div>
              <nav className="hidden flex-wrap items-center gap-2 md:flex">
                {views.map((view) => {
                  const Icon = view.icon;
                  const isActive = activeView === view.id;
                  return (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => setActiveView(view.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border-2 border-border px-3 py-2 text-xs font-semibold shadow-[2px_2px_0px_rgba(15,23,42,0.2)] transition",
                        isActive ? "bg-secondary text-secondary-foreground" : "bg-white text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {view.label}
                    </button>
                  );
                })}
              </nav>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Local-first</Badge>
                <div className="hidden sm:flex">
                  <SettingsDialog onOpenTutorial={() => handleTutorialChange(true)} />
                </div>
                <Button variant="accent" size="sm" onClick={() => setActiveView("standup")}
                >
                  <Mic className="h-4 w-4" />
                  Standup
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Menu className="h-4 w-4" />
                      Menu
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <div className="space-y-3">
                      {views.map((view) => {
                        const Icon = view.icon;
                        const isActive = activeView === view.id;
                        return (
                          <button
                            key={view.id}
                            type="button"
                            onClick={() => setActiveView(view.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-full border-2 border-border px-4 py-2 text-sm font-semibold shadow-[2px_2px_0px_rgba(15,23,42,0.2)]",
                              isActive ? "bg-secondary text-secondary-foreground" : "bg-white text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {view.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" onClick={() => handleTutorialChange(true)}>
                        Tutorial
                      </Button>
                      <SettingsDialog onOpenTutorial={() => handleTutorialChange(true)} triggerClassName="w-full" />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Idea credit: <span className="font-semibold text-foreground">Aahil</span>. Built for Awaiz Builds Softwares.
              </span>
              <button
                type="button"
                onClick={() => handleTutorialChange(true)}
                className="rounded-full border-2 border-border bg-white px-3 py-1 text-xs font-semibold shadow-[2px_2px_0px_rgba(15,23,42,0.2)]"
              >
                Tutorial
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      <main className="flex-1 py-6">
        <PageContainer className="space-y-6">
          <AnimatePresence mode="wait">
            {activeView === "log" && (
              <motion.div key="log" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PageGrid>
                  <div className="space-y-6 md:col-span-6 lg:col-span-7">
                    <Card className="cartoon-shadow">
                      <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Today logged</p>
                            <p className="text-lg font-semibold">{stats.todayCount} entries</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Timer className="h-5 w-5 text-accent" />
                          <div>
                            <p className="text-xs text-muted-foreground">Minutes captured</p>
                            <p className="text-lg font-semibold">{stats.minutes} min</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Consistency streak</p>
                            <p className="text-lg font-semibold">{stats.streak} days</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <LogComposer highlightVoice={highlightVoice} />
                  </div>
                  <div className="space-y-6 md:col-span-6 lg:col-span-5">
                    <StandupPanel compact defaultSnappy />
                    <InsightsPanel compact />
                  </div>
                </PageGrid>
              </motion.div>
            )}

            {activeView === "recall" && (
              <motion.div key="recall" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PageGrid>
                  <div className="space-y-6 md:col-span-6 lg:col-span-5">
                    <Card className="cartoon-shadow">
                      <CardContent className="p-4 text-sm">
                        <p className="font-semibold">Recall cockpit</p>
                        <p className="text-xs text-muted-foreground">
                          Filter by type, range, or tags to surface the right updates fast.
                        </p>
                      </CardContent>
                    </Card>
                    <FiltersBar />
                    <div className="cartoon-card flex flex-wrap gap-2 p-4 text-xs">
                      <span className="font-semibold">Top tags</span>
                      {topTags.length === 0 && <span className="text-muted-foreground">Add tags to see focus areas.</span>}
                      {topTags.map((tag) => (
                        <Badge key={tag} variant="outline">#{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6 md:col-span-6 lg:col-span-7">
                    <Timeline />
                  </div>
                </PageGrid>
              </motion.div>
            )}

            {activeView === "standup" && (
              <motion.div key="standup" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PageGrid>
                  <div className="space-y-6 md:col-span-6 lg:col-span-7">
                    <StandupPanel />
                  </div>
                  <div className="space-y-6 md:col-span-6 lg:col-span-5">
                    <Card className="cartoon-shadow">
                      <CardContent className="p-4 text-sm">
                        <p className="font-semibold">Standup checklist</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <li>- 1 win from yesterday</li>
                          <li>- 1 goal for today</li>
                          <li>- 1 blocker or ask</li>
                          <li>- Optional: shoutout a teammate</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <InsightsPanel compact />
                  </div>
                </PageGrid>
              </motion.div>
            )}

            {activeView === "review" && (
              <motion.div key="review" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PageGrid>
                  <div className="space-y-6 md:col-span-6 lg:col-span-7">
                    <WeeklyReview />
                  </div>
                  <div className="space-y-6 md:col-span-6 lg:col-span-5">
                    <InsightsPanel compact />
                    <Card className="cartoon-shadow">
                      <CardContent className="p-4 text-sm">
                        <p className="font-semibold">Review ritual</p>
                        <p className="text-xs text-muted-foreground">
                          What felt easy? What felt sticky? Capture one tweak for next week.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </PageGrid>
              </motion.div>
            )}

            {activeView === "insights" && (
              <motion.div key="insights" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PageGrid>
                  <div className="space-y-6 md:col-span-6 lg:col-span-7">
                    <InsightsPanel />
                    <Timeline compact maxDays={2} maxItemsPerDay={4} />
                  </div>
                  <div className="space-y-6 md:col-span-6 lg:col-span-5">
                    <Card className="cartoon-shadow">
                      <CardContent className="p-4 text-sm">
                        <p className="font-semibold">Momentum notes</p>
                        <p className="text-xs text-muted-foreground">
                          Your highest streak is {stats.streak} days. Keep the rhythm with 1 note per day.
                        </p>
                      </CardContent>
                    </Card>
                    <StandupPanel compact defaultSnappy />
                  </div>
                </PageGrid>
              </motion.div>
            )}
          </AnimatePresence>
        </PageContainer>
      </main>

      <footer className="py-4">
        <PageContainer>
          <div className="cartoon-card flex flex-col gap-2 bg-white/95 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <a
                href="https://awaiz-builds.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground"
              >
                Made by Awaiz Ahmed for Awaiz Builds Project
              </a>
              <span className="text-muted-foreground">Saved locally in your browser - no backend needed.</span>
            </div>
            <span className="text-muted-foreground">Idea presented by Aahil</span>
          </div>
        </PageContainer>
      </footer>

      <TutorialDialog
        open={tutorialOpen}
        onOpenChange={handleTutorialChange}
        onTryNow={focusLogInput}
      />
    </div>
  );
}
