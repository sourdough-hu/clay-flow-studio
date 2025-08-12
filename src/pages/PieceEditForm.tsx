import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CameraCapture from "@/components/CameraCapture";
import { getPieceById, upsertPiece } from "@/lib/storage";
import { Piece, SizeCategory, Stage } from "@/types";

const sizes: SizeCategory[] = ["Tiny","Small","Medium","Large","Extra Large"];
const stages: Stage[] = ["throwing","trimming","drying","bisque_firing","glazing","glaze_firing","finished"];

const PieceEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const piece = useMemo(() => (id ? getPieceById(id) : undefined), [id]);

  const [title, setTitle] = useState(piece?.title ?? "");
  const [photo, setPhoto] = useState<string | null>(piece?.photos?.[0] ?? null);
  const [size, setSize] = useState<string>(piece?.size_category ?? "");
  const [stage, setStage] = useState<Stage>(piece?.current_stage ?? "throwing");
  const [location, setLocation] = useState(piece?.storage_location ?? "");
  const [tags, setTags] = useState((piece?.tags ?? []).join(", "));
  const [notes, setNotes] = useState(piece?.notes ?? "");
  const [techNotes, setTechNotes] = useState(piece?.technique_notes ?? "");
  const [startDate, setStartDate] = useState(() => piece?.start_date ? piece.start_date.slice(0,10) : "");
  const [description, setDescription] = useState(piece?.description ?? "");

  if (!piece) return <main className="p-4">Piece not found.</main>;

  const onSave = () => {
    const updated: Piece = {
      ...piece,
      title: title.trim() || piece.title,
      photos: photo ? [photo] : [],
      size_category: (size || undefined) as SizeCategory | undefined,
      current_stage: stage,
      storage_location: location || undefined,
      notes: notes || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      technique_notes: techNotes || undefined,
      start_date: startDate ? new Date(startDate).toISOString() : piece.start_date,
      description: description || undefined,
    };
    upsertPiece(updated);
    navigate(`/piece/${piece.id}`);
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title={`Pottery Tracker — Edit ${piece.title}`} description={`Edit piece details for ${piece.title}.`} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Piece</h1>
        <Button variant="hero" onClick={onSave}>Save</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thumbnail</CardTitle>
        </CardHeader>
        <CardContent>
          <CameraCapture value={photo} onChange={setPhoto} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input placeholder="Storage location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Textarea placeholder="Technique notes" value={techNotes} onChange={(e) => setTechNotes(e.target.value)} />
          <Textarea placeholder="Write a short story about this piece…" value={description} onChange={(e) => setDescription(e.target.value)} />
        </CardContent>
      </Card>
    </main>
  );
};

export default PieceEditForm;
