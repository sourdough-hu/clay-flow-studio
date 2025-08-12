import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPieces } from "@/lib/storage";
import { Piece, SizeCategory, Stage } from "@/types";
import { SEO } from "@/components/SEO";
import GreetingHeader from "@/components/GreetingHeader";

const sizeOptions: SizeCategory[] = ["Tiny","Small","Medium","Large","Extra Large"];
const stageOptions: Stage[] = ["throwing","trimming","drying","bisque_firing","glazing","glaze_firing","decorating"]; // no finished here

const Pieces = () => {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("");
  const [size, setSize] = useState<string>("");

  const filtered = useMemo(() => {
    const items = getPieces();
    return items.filter((p) => {
      if (p.current_stage === "finished") return false;
      const matchQ = q
        ? (p.title + " " + (p.notes ?? "") + " " + (p.tags ?? []).join(",")).toLowerCase().includes(q.toLowerCase())
        : true;
      const matchStage = stage ? p.current_stage === stage : true;
      const matchSize = size ? p.size_category === size : true;
      return matchQ && matchStage && matchSize;
    });
  }, [q, stage, size]);

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Making" description="Track works in progress. Thumbnails, stage, and next checkpoint." />
      <header className="pb-2">
        <GreetingHeader title="Making" />
      </header>
      <div className="flex items-center justify-end">
        <Link to="/new/piece" className="text-sm underline underline-offset-4 text-primary">New Piece</Link>
      </div>


      <div className="grid grid-cols-1 gap-2">
        <Input placeholder="Search titles, notes, tags" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Select onValueChange={setStage} value={stage}>
            <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              {stageOptions.map((s) => (
                <SelectItem key={s} value={s}>{(s.replace("_"," ").charAt(0).toUpperCase() + s.replace("_"," ").slice(1))}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSize} value={size}>
            <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
            <SelectContent>
              {sizeOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="space-y-3 pb-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pieces in progress — start something new.</p>
        ) : (
          filtered.map((p) => (
            <Link to={`/piece/${p.id}`} key={p.id} className="block">
              <Card>
                {p.photos?.[0] && (
                  <img src={p.photos[0]} alt={`${p.title} thumbnail`} loading="lazy" className="w-full aspect-video object-cover rounded-t-lg border-b" />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-3">
                    <span>Stage: <span className="text-foreground font-medium">{p.current_stage.replace("_"," ")}</span></span>
                    {p.next_reminder_at && (
                      <span>Next checkpoint: <span className="text-foreground font-medium">{new Date(p.next_reminder_at).toLocaleDateString()}</span></span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>
    </main>
  );
};

export default Pieces;
