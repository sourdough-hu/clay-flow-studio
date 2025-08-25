import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MultiPhotoPicker from "@/components/MultiPhotoPicker";
import { getPieceById, upsertPiece } from "@/lib/storage";
import { Piece, SizeCategory, Stage, ClayType } from "@/types";

const sizes: SizeCategory[] = ["Tiny","Small","Medium","Large","Extra Large"];
const sizeTips: Record<SizeCategory, string> = {
  Tiny: "Small plate",
  Small: "Mug",
  Medium: "Bowl",
  Large: "Serving plate",
  "Extra Large": "Large vase",
};
const stages: Stage[] = ["throwing","trimming","drying","bisque_firing","glazing","glaze_firing","decorating","finished"];
const clayTypes: ClayType[] = ["Stoneware", "Porcelain", "Earthenware", "Terracotta", "Speckled Stoneware", "Recycled / Mixed", "Other"];

const PieceEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const piece = useMemo(() => (id ? getPieceById(id) : undefined), [id]);

  const [title, setTitle] = useState(piece?.title ?? "");
  const [photos, setPhotos] = useState<string[]>(piece?.photos ?? []);
  const [size, setSize] = useState<string>(piece?.size_category ?? "");
  const [stage, setStage] = useState<Stage>(piece?.current_stage ?? "throwing");
  const [location, setLocation] = useState(piece?.storage_location ?? "");
  const [tags, setTags] = useState((piece?.tags ?? []).join(", "));
  const [notes, setNotes] = useState(piece?.notes ?? "");
  const [techNotes, setTechNotes] = useState(piece?.technique_notes ?? "");
  const [startDate, setStartDate] = useState(() => piece?.start_date ? piece.start_date.slice(0,10) : "");
  const [description, setDescription] = useState(piece?.description ?? "");
  const [clayType, setClayType] = useState<string>(piece?.clay_type ?? "");
  const [claySubtype, setClaySubtype] = useState(piece?.clay_subtype ?? "");
  const [claySubtypeError, setClaySubtypeError] = useState("");

  if (!piece) return <main className="p-4">Piece not found.</main>;

  const onSave = () => {
    // Validate clay subtype if clay type is selected
    if (clayType && (!claySubtype.trim() || claySubtype.trim().length < 2)) {
      setClaySubtypeError("Please specify the clay subtype (e.g., Laguna B-Mix, Speckled).");
      return;
    }
    setClaySubtypeError("");
    const updated: Piece = {
      ...piece,
      title: title.trim() || piece.title,
      photos: photos,
      size_category: (size || undefined) as SizeCategory | undefined,
      current_stage: stage,
      storage_location: location || undefined,
      notes: notes || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      technique_notes: techNotes || undefined,
      start_date: startDate ? new Date(startDate).toISOString() : piece.start_date,
      description: description || undefined,
      clay_type: (clayType || undefined) as ClayType | undefined,
      clay_subtype: claySubtype.trim() || undefined,
    };
    upsertPiece(updated);
    navigate(`/piece/${piece.id}`);
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title={`Pottery Tracker — Edit ${piece.title}`} description={`Edit piece details for ${piece.title}.`} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title || piece.title}</h1>
        <Button variant="hero" onClick={onSave}>Save</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiPhotoPicker photos={photos} onChange={setPhotos} />
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
                {sizes.map((s) => (<SelectItem key={s} value={s} title={sizeTips[s]}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={clayType} onValueChange={setClayType}>
              <SelectTrigger><SelectValue placeholder="Clay Type" /></SelectTrigger>
              <SelectContent>
                {clayTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
            <div>
              <Input 
                placeholder="e.g., Laguna B-Mix 5, Speckled, Porcelain P300" 
                value={claySubtype} 
                onChange={(e) => setClaySubtype(e.target.value)}
              />
              {claySubtypeError && (
                <p className="text-sm text-destructive mt-1">{claySubtypeError}</p>
              )}
            </div>
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
