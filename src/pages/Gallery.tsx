import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getPieces } from "@/lib/storage";
import { Piece } from "@/types";
import { SEO } from "@/components/SEO";
import { FilterBottomSheet, FilterValue } from "@/components/FilterBottomSheet";


const Gallery = () => {
  const [q, setQ] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);

  const finished = useMemo(() => {
    return getPieces().filter((p) => p.current_stage === "finished");
  }, []);

  const filtered = useMemo(() => {
    return finished.filter((p) => {
      // Search filter
      const matchQ = q
        ? (p.title + " " + (p.notes ?? "") + " " + (p.tags ?? []).join(",")).toLowerCase().includes(q.toLowerCase())
        : true;
      
      // Active filters
      const matchFilters = activeFilters.every(filter => {
        switch (filter.type) {
          case "stage":
            return p.current_stage === filter.value;
          case "size":
            return p.form === filter.value;
          case "clayType":
            return p.clay_type === filter.value;
          default:
            return true;
        }
      });
      
      return matchQ && matchFilters;
    });
  }, [q, activeFilters, finished]);

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Gallery" description="Browse your finished pieces in the gallery." />

      <div className="space-y-4">
        <Input placeholder="Search titles, notes, tags" value={q} onChange={(e) => setQ(e.target.value)} />
        <FilterBottomSheet activeFilters={activeFilters} onFiltersChange={setActiveFilters} hideStage={true} />
      </div>
      <Link to="/new/piece?stage=finished" className="block">
        <Button variant="secondary" className="w-full h-11 justify-center rounded-lg text-secondary-foreground" aria-label="Add new">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Add new</span>
        </Button>
      </Link>
      <section className="space-y-3 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              {activeFilters.length > 0 ? "No pieces match your filters." : "No finished pieces yet — complete a piece to see it here."}
            </p>
            {activeFilters.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setActiveFilters([])}>
                Clear all filters
              </Button>
            )}
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
                  {(p.tags && p.tags.length > 0) && (
                    <div>Tags: <span className="text-foreground font-medium">{p.tags.join(", ")}</span></div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>
    </main>
  );
};

export default Gallery;
