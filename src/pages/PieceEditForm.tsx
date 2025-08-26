import { useMemo, useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import LinkedItemsPod from "@/components/LinkedItemsPod";
import { syncLinksAfterPieceSave, getInspirationsForPiece } from "@/lib/supabase-links";
import { useToast } from "@/hooks/use-toast";

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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInspirationIds, setSelectedInspirationIds] = useState<Set<string>>(new Set());
  const [originalInspirationIds, setOriginalInspirationIds] = useState<Set<string>>(new Set());
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load linked inspirations when editing starts
  useEffect(() => {
    const loadLinkedInspirations = async () => {
      if (!isAuthenticated || !piece) return;
      
      try {
        const linkedInspirations = await getInspirationsForPiece(piece.id);
        const linkedIds = new Set(linkedInspirations.map(insp => insp.id));
        setOriginalInspirationIds(linkedIds);
        setSelectedInspirationIds(linkedIds);
      } catch (error) {
        console.error('Failed to load linked inspirations:', error);
      }
    };

    if (isEditing) {
      loadLinkedInspirations();
    }
  }, [isEditing, isAuthenticated, piece?.id]);

  if (!piece) return <main className="p-4">Piece not found.</main>;

  const computeDiff = () => {
    const toLink = Array.from(selectedInspirationIds).filter(id => !originalInspirationIds.has(id));
    const toUnlink = Array.from(originalInspirationIds).filter(id => !selectedInspirationIds.has(id));
    return { toLink, toUnlink };
  };

  const syncLinks = async () => {
    if (!isAuthenticated) return;
    const { toLink, toUnlink } = computeDiff();
    await syncLinksAfterPieceSave(piece.id, toLink, toUnlink);
  };

  const onSave = async () => {
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
    
    // Save piece first
    upsertPiece(updated);
    
    // Sync links if authenticated and editing
    if (isEditing && isAuthenticated) {
      try {
        await syncLinks();
        toast({
          title: "Piece updated",
          description: "Links synchronized successfully",
        });
      } catch (error: any) {
        const message = error?.message || 'Unknown error';
        toast({
          title: "Piece updated",
          description: `But linking failed: ${message}`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Piece updated",
      });
    }
    
    navigate(`/piece/${piece.id}`);
  };

  const toggleInspiration = (id: string) => {
    setSelectedInspirationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title={`Pottery Tracker — Edit ${piece.title}`} description={`Edit piece details for ${piece.title}.`} />
      
      <h1 className="text-xl font-semibold">Edit Piece</h1>
      
      {/* Title and Photos Section */}
      <Card className="overflow-visible relative">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">Edit name</label>
            <Input 
              placeholder="Title (required)" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>
          <MultiPhotoPicker 
            photos={photos} 
            onChange={setPhotos}
            maxPhotos={20}
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
      <LinkedItemsPod 
        mode="inspirations" 
        itemId={piece.id}
        isEditing={isEditing}
        selectedIds={selectedInspirationIds}
        onToggleSelection={toggleInspiration}
      />

      {/* Edit Inspirations Controls */}
      {isAuthenticated && !isEditing && (
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(true)}
          className="w-full"
        >
          Edit Linked Inspirations
        </Button>
      )}

      {isAuthenticated && isEditing && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              setSelectedInspirationIds(originalInspirationIds);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            variant="hero" 
            onClick={() => setIsEditing(false)}
            className="flex-1"
          >
            Done
          </Button>
        </div>
      )}

      {/* Save Button */}
      <Button 
        variant="hero" 
        onClick={onSave} 
        disabled={!title.trim()}
        className="w-full"
      >
        Save Piece
      </Button>
    </main>
  );
};

export default PieceEditForm;