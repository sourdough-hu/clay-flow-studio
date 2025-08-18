import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, addDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { SEO } from "@/components/SEO";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBottomSheet, FilterValue } from "@/components/FilterBottomSheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getPieces, upsertPiece } from "@/lib/storage";
import { suggestNextStep, stageOrder } from "@/lib/stage";
import type { Piece } from "@/types";
import { Plus } from "lucide-react";

type RangeKey = "today" | "3" | "7" | "all";

const rangeOptions: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "3", label: "Next 3 days" },
  { key: "7", label: "Next 7 days" },
  { key: "all", label: "All" },
];

function mapActionToType(action?: string): string {
  const a = (action || "").toLowerCase();
  if (a.includes("trimm")) return "Trim";
  if (a.includes("glaze") && a.includes("fire")) return "Glaze fire";
  if (a.includes("glaze")) return "Glaze";
  if (a.includes("bisque")) return "Bisque fire";
  if (a.includes("throw")) return "Throw";
  if (a.includes("dry")) return "Dry";
  if (a.includes("pickup") || a.includes("pick up")) return "Pickup";
  return "Task";
}

function formatDueLabel(due: Date) {
  return format(due, "PPP");
}

const Tasks = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [range, setRange] = useState<RangeKey>("7");
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);

  const [pieces, setPieces] = useState<Piece[]>(() => getPieces());

  type TaskItem = { piece: Piece; due: Date; action: string; type: string };
  const allTasks = useMemo<TaskItem[]>(() => {
    return pieces
      .filter((p) => p.next_reminder_at)
      .map((p) => {
        const due = new Date(p.next_reminder_at!);
        const action = p.next_step ?? "Next step";
        const type = mapActionToType(action);
        return { piece: p, due, action, type };
      })
      .sort((a, b) => +a.due - +b.due);
  }, [pieces]);

  const now = new Date();
  const overdue = useMemo(() => {
    let o = allTasks.filter((t) => t.due < now);
    if (query.trim()) {
      const q = query.toLowerCase();
      o = o.filter((t) => t.piece.title.toLowerCase().includes(q));
    }
    if (typeFilter !== "All") {
      o = o.filter((t) => t.type === typeFilter);
    }
    // Apply active filters
    if (activeFilters.length > 0) {
      o = o.filter((t) => {
        return activeFilters.every(filter => {
          switch (filter.type) {
            case "stage":
              return t.piece.current_stage === filter.value;
            case "size":
              return t.piece.size_category === filter.value;
            case "clayType":
              return t.piece.clay_type === filter.value;
            default:
              return true;
          }
        });
      });
    }
    return o;
  }, [allTasks, now, query, typeFilter, activeFilters]);

  const filteredUpcoming = useMemo(() => {
    let upcoming = allTasks.filter((t) => t.due >= now);

    // Range filter
    if (range === "today") {
      upcoming = upcoming.filter((t) =>
        isWithinInterval(t.due, { start: startOfDay(now), end: endOfDay(now) })
      );
    } else if (range === "3" || range === "7") {
      const days = Number(range);
      const end = endOfDay(addDays(now, days));
      upcoming = upcoming.filter((t) => t.due <= end);
    }
    // else "all" keeps all upcoming

    // Search and type filter
    if (query.trim()) {
      const q = query.toLowerCase();
      upcoming = upcoming.filter((t) => t.piece.title.toLowerCase().includes(q));
    }
    if (typeFilter !== "All") {
      upcoming = upcoming.filter((t) => t.type === typeFilter);
    }
    // Apply active filters
    if (activeFilters.length > 0) {
      upcoming = upcoming.filter((t) => {
        return activeFilters.every(filter => {
          switch (filter.type) {
            case "stage":
              return t.piece.current_stage === filter.value;
            case "size":
              return t.piece.size_category === filter.value;
            case "clayType":
              return t.piece.clay_type === filter.value;
            default:
              return true;
          }
        });
      });
    }
    return upcoming;
  }, [allTasks, now, query, range, typeFilter, activeFilters]);

  // Dialog state for advancing stage
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Piece | null>(null);
  const [nextStage, setNextStage] = useState<string>("");
  const [reminder, setReminder] = useState<string>(""); // ISO string from datetime-local

  function openAdvanceDialog(piece: Piece) {
    setSelected(piece);
    // Pre-fill suggestion from current stage
    const suggestion = suggestNextStep(piece.current_stage);
    const defaultNext = suggestion.next_step?.replace("Move to ", "").replace(" ", "_") || "";
    setNextStage(defaultNext);
    // Default reminder: suggested next_reminder_at or keep current due
    const due = piece.next_reminder_at ? new Date(piece.next_reminder_at) : addDays(new Date(), 1);
    const suggested = suggestion.next_reminder_at ? new Date(suggestion.next_reminder_at) : due;
    const pad = (n: number) => String(n).padStart(2, "0");
    const localISO = `${suggested.getFullYear()}-${pad(suggested.getMonth() + 1)}-${pad(suggested.getDate())}T${pad(suggested.getHours())}:${pad(suggested.getMinutes())}`;
    setReminder(localISO);
    setOpen(true);
  }

  function handleSnooze(piece: Piece) {
    const due = piece.next_reminder_at ? new Date(piece.next_reminder_at) : new Date();
    const newDue = addDays(due, 1);
    const updated: Piece = { ...piece, next_reminder_at: newDue.toISOString() };
    upsertPiece(updated);
    setPieces(getPieces());
    toast({ title: "Snoozed", description: `Reminder moved to ${formatDueLabel(newDue)}` });
  }

  function handleConfirmAdvance() {
    if (!selected) return;
    const chosenStage = (nextStage as any) || selected.current_stage;
    const when = reminder ? new Date(reminder) : null;

    let updated: Piece = { ...selected };
    // If chosenStage is same as current.next, we can move one step; else set directly
    updated.current_stage = chosenStage;
    const suggestion = suggestNextStep(chosenStage as any);
    updated.next_step = suggestion.next_step;
    updated.next_reminder_at = when ? when.toISOString() : suggestion.next_reminder_at ?? null;
    updated.stage_history = [...(updated.stage_history ?? []), { stage: selected.current_stage, date: new Date().toISOString() }];

    upsertPiece(updated);
    setPieces(getPieces());
    setOpen(false);
    toast({ title: "Stage advanced", description: `${selected.title} → ${String(chosenStage).replace(/_/g, " ")}` });
  }

  const types = useMemo(() => ["All", ...Array.from(new Set(allTasks.map((t) => t.type)))], [allTasks]);

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Tasks" description="View and manage your pottery tasks." />



      <section aria-label="Filters" className="grid gap-3">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-md border p-1">
            {rangeOptions.map((opt) => (
              <Button
                key={opt.key}
                size="sm"
                variant={range === opt.key ? "default" : "ghost"}
                onClick={() => setRange(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by piece title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FilterBottomSheet activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
      </section>

      {overdue.length > 0 && (
        <section aria-label="Overdue" className="space-y-2">
          <h2 className="text-sm font-medium text-destructive">Overdue</h2>
          <ul className="space-y-2">
            {overdue.map((t) => (
              <TaskRow key={t.piece.id} item={t} onDone={() => openAdvanceDialog(t.piece)} onSnooze={() => handleSnooze(t.piece)} />
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Upcoming" className="space-y-2 pb-8">
        <h2 className="text-sm font-medium text-muted-foreground">Upcoming</h2>
        {filteredUpcoming.length === 0 ? (
          <div className="space-y-3">
            <Link to="/start-new" className="block">
              <Button variant="secondary" className="w-full h-11 justify-center rounded-lg text-secondary-foreground" aria-label="Add new">
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Add new</span>
              </Button>
            </Link>
            {activeFilters.length > 0 && (
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => setActiveFilters([])}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredUpcoming.map((t) => (
              <TaskRow key={t.piece.id} item={t} onDone={() => openAdvanceDialog(t.piece)} onSnooze={() => handleSnooze(t.piece)} />
            ))}
          </ul>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advance stage?</DialogTitle>
            <DialogDescription>
              Choose the next stage and when to be reminded.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="stage">Next stage</Label>
              <Select value={nextStage} onValueChange={setNextStage}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stageOrder.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="when">Reminder</Label>
              <Input id="when" type="datetime-local" value={reminder} onChange={(e) => setReminder(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAdvance}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

function TaskRow({ item, onDone, onSnooze }: { item: { piece: Piece; due: Date; action: string; type: string }; onDone: () => void; onSnooze: () => void; }) {
  const thumb = item.piece.photos?.[0] || "/placeholder.svg";
  return (
    <li className="rounded-md border bg-card text-card-foreground">
      <div className="flex items-center gap-3 p-3">
        <img
          src={thumb}
          alt={`${item.piece.title} thumbnail`}
          loading="lazy"
          className="h-12 w-12 rounded object-cover border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium text-card-foreground truncate">{item.type} — {item.piece.title}</p>
              <p className="text-sm text-card-foreground/80 truncate">{item.action}</p>
            </div>
            <div className="ml-3 shrink-0 text-sm font-medium text-card-foreground/80">{formatDueLabel(item.due)}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-3 pb-3">
        <Button variant="secondary" size="lg" onClick={onSnooze}>Snooze +1 day</Button>
        <Button size="lg" onClick={onDone}>Done</Button>
      </div>
    </li>
  );
}

export default Tasks;

