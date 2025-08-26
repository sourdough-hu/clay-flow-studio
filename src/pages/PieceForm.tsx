import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece, PotteryForm, Stage, ClayType, Inspiration } from "@/types";
import { upsertPiece, getInspirations } from "@/lib/storage";
import { suggestNextStep } from "@/lib/stage";
import { SEO } from "@/components/SEO";
import MultiPhotoPicker from "@/components/MultiPhotoPicker";
import { Camera, ImageIcon, X } from "lucide-react";
import { getThumbnailUrl } from "@/lib/photos";
import { useAuth } from "@/contexts/AuthContext";

const forms: PotteryForm[] = ["Mug / Cup", "Bowl", "Vase", "Plate", "Pitcher", "Teapot", "Sculpture", "Others"];
const stages: Stage[] = ["throwing", "trimming", "drying", "bisque_firing", "glazing", "glaze_firing", "finished"];
const clayTypes: ClayType[] = ["Stoneware", "Porcelain", "Earthenware", "Terracotta", "Speckled Stoneware", "Nerikomi", "Recycled / Mixed", "Others"];

const PieceForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState<string>("");
  const [formDetails, setFormDetails] = useState("");
  const [stage, setStage] = useState<Stage>(() => {
    const s = (searchParams.get("stage") || "").toLowerCase();
    const allowed = ["throwing", "trimming", "drying", "bisque_firing", "glazing", "glaze_firing", "finished"] as const;
    return (allowed as readonly string[]).includes(s) ? (s as Stage) : "throwing";
  });
  const [clayType, setClayType] = useState<string>("");
  const [clayBodyDetails, setClayBodyDetails] = useState("");
  const [glaze, setGlaze] = useState("");
  const [carving, setCarving] = useState("");
  const [slip, setSlip] = useState("");
  const [underglaze, setUnderglaze] = useState("");
  const [notes, setNotes] = useState("");
  
  const { isAuthenticated } = useAuth();

  const handleSignInClick = () => {
    window.location.href = '/auth';
  };

  const onSubmit = () => {
    if (!title.trim()) return;
    
    const id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const piece: Piece = {
      id,
      title: title.trim(),
      photos,
      start_date: new Date().toISOString(),
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
      stage_history: [],
      ...suggestNextStep(stage),
    };
    upsertPiece(piece);
    navigate(`/piece/${id}`);
  };


  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — New Piece" description="Log a new pottery piece with stage and details." />
      <h1 className="text-xl font-semibold">Log a New Piece</h1>
      
      {/* Title and Photos Section */}
      <Card className="overflow-visible relative">{/* Ensure card doesn't clip badges */}
        <CardContent className="pt-6 space-y-4">
          <Input 
            placeholder="Title (required)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <MultiPhotoPicker 
            photos={photos} 
            onChange={setPhotos}
            maxPhotos={10}
            showButtons={false}
          />
        </CardContent>
      </Card>

      {/* Section 2: About */}
      <Card>
        <CardHeader>
          <CardTitle className="section-header">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Form Row */}
          <div className="flex items-start gap-4">
            <div className="w-20 field-label pt-2">Form</div>
            <div className="flex-1 space-y-2">
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
                  placeholder="Form details (optional)" 
                  value={formDetails} 
                  onChange={(e) => setFormDetails(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Stage Row */}
          <div className="flex items-center gap-4">
            <div className="w-20 field-label">Stage</div>
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
          <div className="flex items-start gap-4">
            <div className="w-20 field-label pt-2">Clay Body</div>
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
                placeholder="Specific clay body (optional) — e.g., B-Mix" 
                value={clayBodyDetails} 
                onChange={(e) => setClayBodyDetails(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Decoration */}
      <Card>
        <CardHeader>
          <CardTitle className="section-header decoration-section-title">Decoration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 decoration-section">
           <div className="flex items-center gap-4">
            <div className="w-20 field-label">Glaze</div>
            <div className="flex-1">
              <Input 
                placeholder="Glaze details" 
                value={glaze} 
                onChange={(e) => setGlaze(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 field-label">Carving</div>
            <div className="flex-1">
              <Input 
                placeholder="Carving details" 
                value={carving} 
                onChange={(e) => setCarving(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 field-label">Slip</div>
            <div className="flex-1">
              <Input 
                placeholder="Slip details" 
                value={slip} 
                onChange={(e) => setSlip(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 field-label">Underglaze</div>
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

      {/* Section 4: Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="section-header">Notes</CardTitle>
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

      {/* Section 5: Inspirations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspirations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in to link inspirations with this piece.
              </p>
              <Button onClick={handleSignInClick} variant="hero">
                Sign in to enable linking
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You can link inspirations after saving this piece.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        variant="hero" 
        onClick={onSubmit} 
        disabled={!title.trim()}
        className="w-full"
      >
        Save Piece
      </Button>
    </main>
  );
};

export default PieceForm;