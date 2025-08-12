import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getPieces } from "@/lib/storage";
import { Piece, SizeCategory } from "@/types";
import { SEO } from "@/components/SEO";


const sizeOptions: SizeCategory[] = ["Tiny","Small","Medium","Large","Extra Large"];

const Gallery = () => {
  const [q, setQ] = useState("");
  const [size, setSize] = useState<string>("");
  const [tag, setTag] = useState<string>("");

  const finished = useMemo(() => {
    const items = getPieces().filter((p) => p.current_stage === "finished");
    const uniqueTags = Array.from(new Set(items.flatMap((p) => p.tags ?? []))).sort();
    return { items, uniqueTags };
  }, []);

  const filtered = useMemo(() => {
    return finished.items.filter((p) => {
      const matchQ = q
        ? (p.title + " " + (p.notes ?? "") + " " + (p.tags ?? []).join(",")).toLowerCase().includes(q.toLowerCase())
        : true;
      const matchSize = size ? p.size_category === size : true;
      const matchTag = tag ? (p.tags ?? []).includes(tag) : true;
      return matchQ && matchSize && matchTag;
    });
  }, [q, size, tag, finished.items]);

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Gallery" description="Browse your finished pieces in the gallery." />
      <div className="flex items-center justify-end">
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Input placeholder="Search titles, notes, tags" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Select onValueChange={setSize} value={size}>
            <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
            <SelectContent>
              {sizeOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setTag} value={tag}>
            <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              {finished.uniqueTags.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Link to="/new/piece?stage=finished" className="block">
        <Button variant="secondary" className="w-full h-11 justify-center rounded-lg text-secondary-foreground" aria-label="Add new">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Add new</span>
        </Button>
      </Link>
      <section className="space-y-3 pb-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No finished pieces yet — complete a piece to see it here.</p>
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
