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
import { Piece, PotteryForm, Stage, ClayType } from "@/types";

const forms: PotteryForm[] = ["Mug / Cup", "Bowl", "Vase", "Plate", "Pitcher", "Teapot", "Sculpture", "Others"];
const stages: Stage[] = ["throwing","trimming","drying","bisque_firing","glazing","glaze_firing","finished"];
const clayTypes: ClayType[] = ["Stoneware", "Porcelain", "Earthenware", "Terracotta", "Speckled Stoneware", "Nerikomi", "Recycled / Mixed", "Others"];

const PieceEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const piece = useMemo(() => (id ? getPieceById(id) : undefined), [id]);

  const [title, setTitle] = useState(piece?.title ?? "");
  const [photos, setPhotos] = useState<string[]>(piece?.photos ?? []);
  const [form, setForm] = useState<string>(piece?.form ?? "");
  const [formDetails, setFormDetails] = useState(piece?.form_details ?? "");
  const [stage, setStage] = useState<Stage>(piece?.current_stage ?? "throwing");
  const [clayType, setClayType] = useState<string>(piece?.clay_type ?? "");
  const [clayBodyDetails, setClayBodyDetails] = useState(piece?.clay_body_details ?? "");
  const [glaze, setGlaze] = useState(piece?.glaze ?? "");
  const [carving, setCarving] = useState(piece?.carving ?? "");
  const [slip, setSlip] = useState(piece?.slip ?? "");
  const [underglaze, setUnderglaze] = useState(piece?.underglaze ?? "");
  const [notes, setNotes] = useState(piece?.notes ?? "");

  if (!piece) return <main className="p-4">Piece not found.</main>;

  const onSave = () => {
    const updated: Piece = {
      ...piece,
      title: title.trim() || piece.title,
      photos: photos,
      form: (form || undefined) as PotteryForm | undefined,
      form_details: form === "Others" ? formDetails.trim() || undefined : undefined,
      current_stage: stage,
      clay_type: (clayType || undefined) as ClayType | undefined,
      clay_body_details: clayBodyDetails.trim() || undefined,
      glaze: glaze.trim() || undefined,
      carving: carving.trim() || undefined,
      slip: slip.trim() || undefined,
      underglaze: underglaze.trim() || undefined,
      notes: notes.trim() || undefined,
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

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiPhotoPicker photos={photos} onChange={setPhotos} maxPhotos={20} />
        </CardContent>
      </Card>

      {/* Required */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Row */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Form</div>
            <div className="flex-1">
              <Select value={form} onValueChange={setForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form === "Others" && (
                <Input 
                  placeholder="Details (optional)" 
                  value={formDetails} 
                  onChange={(e) => setFormDetails(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          {/* Stage Row */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Stage</div>
            <div className="flex-1">
              <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s} value={s}>
                      {(s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clay Body Row */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Clay Body</div>
            <div className="flex-1 space-y-2">
              <Select value={clayType} onValueChange={setClayType}>
                <SelectTrigger>
                  <SelectValue placeholder="Clay Type" />
                </SelectTrigger>
                <SelectContent>
                  {clayTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                placeholder="e.g., B-Mix" 
                value={clayBodyDetails} 
                onChange={(e) => setClayBodyDetails(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decoration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decoration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Glaze</div>
            <div className="flex-1">
              <Input 
                placeholder="Glaze details" 
                value={glaze} 
                onChange={(e) => setGlaze(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Carving</div>
            <div className="flex-1">
              <Input 
                placeholder="Carving details" 
                value={carving} 
                onChange={(e) => setCarving(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Slip</div>
            <div className="flex-1">
              <Input 
                placeholder="Slip details" 
                value={slip} 
                onChange={(e) => setSlip(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-foreground">Underglaze</div>
            <div className="flex-1">
              <Input 
                placeholder="Underglaze details" 
                value={underglaze} 
                onChange={(e) => setUnderglaze(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Add your notes and technique details here..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default PieceEditForm;