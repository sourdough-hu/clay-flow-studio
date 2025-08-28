import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPieces } from "@/lib/storage";
import { Piece } from "@/types";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilterBottomSheet, FilterValue } from "@/components/FilterBottomSheet";



const Pieces = () => {
  const [q, setQ] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);

  const filtered = useMemo(() => {
    const items = getPieces();
    return items.filter((p) => {
      if (p.current_stage === "finished") return false;
      
      // Search filter - include decoration fields
      const searchableText = [
        p.title,
        p.notes ?? "",
        (p.tags ?? []).join(","),
        p.glaze ?? "",
        p.carving ?? "",
        p.slip ?? "",
        p.underglaze ?? ""
      ].join(" ");
      
      const matchQ = q
        ? searchableText.toLowerCase().includes(q.toLowerCase())
        : true;
      
      // Active filters
      const matchFilters = activeFilters.every(filter => {
        switch (filter.type) {
          case "stage":
            return p.current_stage === filter.value;
          case "form":
            return p.form === filter.value;
          case "clayType":
            return p.clay_type === filter.value;
          default:
            return true;
        }
      });
      
      return matchQ && matchFilters;
    });
  }, [q, activeFilters]);

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Making" description="Track works in progress. Thumbnails, stage, and next checkpoint." />


      <div className="space-y-4">
        <Input placeholder="Search titles, notes, tags, decorations" value={q} onChange={(e) => setQ(e.target.value)} />
        <FilterBottomSheet activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
      </div>
      <Link to="/new/piece" className="block">
        <Button variant="secondary" className="w-full h-11 justify-center rounded-lg text-secondary-foreground" aria-label="Add new">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Add new</span>
        </Button>
      </Link>
      <section className="space-y-3 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No pieces found</p>
          </div>
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
                    {p.clay_type && (
                      <span>Clay: <span className="text-foreground font-medium">{p.clay_type}{p.clay_body_details && ` — ${p.clay_body_details}`}</span></span>
                    )}
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
