import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece, SizeCategory, Stage } from "@/types";
import { upsertPiece } from "@/lib/storage";
import { suggestNextStep } from "@/lib/stage";
import { SEO } from "@/components/SEO";

const sizes: SizeCategory[] = ["Tiny","Small","Medium","Large","Extra Large"];
const stages: Stage[] = ["throwing","trimming","drying","bisque_firing","glazing","glaze_firing","finished"];

const PieceForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState("");
  const [size, setSize] = useState<string>("");
  const [stage, setStage] = useState<Stage>("throwing");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [techNotes, setTechNotes] = useState("");

  const onSubmit = () => {
    if (!title.trim()) return;
    const id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const piece: Piece = {
      id,
      title: title.trim(),
      photos: photos.split(",").map((s) => s.trim()).filter(Boolean),
      start_date: new Date().toISOString(),
      size_category: (size || undefined) as SizeCategory | undefined,
      current_stage: stage,
      storage_location: location || undefined,
      notes: notes || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      technique_notes: techNotes || undefined,
      stage_history: [],
      ...suggestNextStep(stage),
    };
    upsertPiece(piece);
    navigate(`/piece/${id}`);
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — New Piece" description="Log a new pottery piece with stage and details." />
      <h1 className="text-xl font-semibold">Log New Piece</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title (required)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Photo URLs (comma separated)" value={photos} onChange={(e) => setPhotos(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                {stages.map((s) => (<SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Storage location (shelf, board, etc.)" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Textarea placeholder="Technique notes" value={techNotes} onChange={(e) => setTechNotes(e.target.value)} />
          <Button variant="hero" onClick={onSubmit} disabled={!title.trim()}>Save Piece</Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default PieceForm;
