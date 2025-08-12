import { useEffect, useMemo, useState } from "react";
import { getInspirations, getPiecesForInspiration, getPieces, getInspirationsForPiece } from "@/lib/storage";
import { SEO } from "@/components/SEO";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Piece } from "@/types";

const Inspirations = () => {
  const items = useMemo(() => getInspirations(), []);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [link, setLink] = useState<string>("All");
  const [pieceId, setPieceId] = useState<string>("");

  const pieces = useMemo(() => getPieces(), []);
  function getPieceUpdatedAt(p: Piece): number {
    const dates: string[] = [];
    if (p.stage_history && p.stage_history.length > 0) dates.push(p.stage_history[p.stage_history.length - 1].date);
    if (p.history && p.history.length > 0) dates.push(p.history[p.history.length - 1].date);
    if (p.start_date) dates.push(p.start_date);
    return dates.length ? Math.max(...dates.map((d) => +new Date(d))) : 0;
  }
  const pieceOptions = useMemo(() => {
    return [...pieces].sort((a, b) => getPieceUpdatedAt(b) - getPieceUpdatedAt(a));
  }, [pieces]);

  const linkCountById = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((ins) => {
      map.set(ins.id, getPiecesForInspiration(ins.id).length);
    });
    return map;
  }, [items]);

  const inspIdsForSelectedPiece = useMemo(() => {
    if (!pieceId) return null;
    return new Set(getInspirationsForPiece(pieceId).map((i) => i.id));
  }, [pieceId]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((ins) => {
        const text = `${ins.note ?? ""} ${(ins.tags ?? []).join(",")} ${ins.link_url ?? ""}`.toLowerCase();
        return text.includes(qq);
      });
    }

    if (link === "Linked") {
      list = list.filter((ins) => (linkCountById.get(ins.id) ?? 0) > 0);
    } else if (link === "Unlinked") {
      list = list.filter((ins) => (linkCountById.get(ins.id) ?? 0) === 0);
    }

    if (pieceId && inspIdsForSelectedPiece) {
      list = list.filter((ins) => inspIdsForSelectedPiece.has(ins.id));
    }

    return list;
  }, [items, q, link, pieceId, linkCountById, inspIdsForSelectedPiece]);

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Inspirations" description="Browse your inspiration library." />
      {/* Filters */}
      <div className="grid grid-cols-1 gap-2">
        <Input placeholder="Search titles, notes, tags" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Select value={link} onValueChange={setLink}>
            <SelectTrigger><SelectValue placeholder="Linked" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Linked">Linked</SelectItem>
              <SelectItem value="Unlinked">Unlinked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pieceId} onValueChange={setPieceId}>
            <SelectTrigger disabled={link === "Unlinked"}><SelectValue placeholder="All Pieces" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Pieces</SelectItem>
              {pieceOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add new bar */}
      <Link to="/new/inspiration" className="block">
        <Button variant="secondary" className="w-full h-11 justify-center rounded-lg text-secondary-foreground" aria-label="Add new">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Add new</span>
        </Button>
      </Link>

      <section className="space-y-3 pb-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inspirations match your filters.</p>
        ) : (
          <div className="columns-2 gap-3 [column-fill:_balance]">
            {filtered.map((ins) => (
              <Link to={`/inspiration/${ins.id}`} key={ins.id} className="block mb-3 break-inside-avoid">
                <Card>
                  {(ins.photos?.[0] || ins.image_url) && (
                    <img src={ins.photos?.[0] ?? ins.image_url!} alt={ins.note ? `${ins.note.slice(0,40)} thumbnail` : "Inspiration thumbnail"} className="w-full object-cover rounded-lg" loading="lazy" />
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Inspirations;
