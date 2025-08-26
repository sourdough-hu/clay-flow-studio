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
  const [selectedInspirations, setSelectedInspirations] = useState<string[]>([]);
  
  const inspirations = getInspirations();

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
      inspiration_links: selectedInspirations.length > 0 ? selectedInspirations : undefined,
      stage_history: [],
      ...suggestNextStep(stage),
    };
    upsertPiece(piece);
    navigate(`/piece/${id}`);
  };

  const toggleInspiration = (inspirationId: string) => {
    setSelectedInspirations(prev => 
      prev.includes(inspirationId) 
        ? prev.filter(id => id !== inspirationId)
        : [...prev, inspirationId]
    );
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — New Piece" description="Log a new pottery piece with stage and details." />
      <h1 className="text-xl font-semibold">Log New Piece</h1>
      
      {/* Section 1: Required */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Title (required)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </CardContent>
      </Card>

      {/* Photo Section */}
      <Card>
        <CardContent className="pt-6">
          <MultiPhotoPicker 
            label="Add photos" 
            photos={photos} 
            onChange={setPhotos}
            maxPhotos={20}
          />
        </CardContent>
      </Card>

      {/* Section 2: About */}
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

      {/* Section 3: Decoration */}
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

      {/* Section 4: Notes */}
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

      {/* Section 5: Inspirations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspirations</CardTitle>
        </CardHeader>
        <CardContent>
          {inspirations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inspirations available. Create some first!</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select inspirations to link with this piece:</p>
              <div className="grid grid-cols-3 gap-3">
                {inspirations.map((inspiration) => (
                  <div
                    key={inspiration.id}
                    className={`relative aspect-square rounded-md border-2 cursor-pointer transition-all ${
                      selectedInspirations.includes(inspiration.id)
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onClick={() => toggleInspiration(inspiration.id)}
                  >
                    <img
                      src={getThumbnailUrl(inspiration.photos, inspiration.image_url)}
                      alt="Inspiration"
                      className="w-full h-full object-cover rounded-md"
                    />
                    {selectedInspirations.includes(inspiration.id) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                    {inspiration.note && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-md">
                        {inspiration.note.length > 30 ? `${inspiration.note.slice(0, 30)}...` : inspiration.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedInspirations.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedInspirations.length} inspiration{selectedInspirations.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
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