import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inspiration, Piece } from "@/types";
import { addInspiration, getPieces } from "@/lib/storage";
import { syncLinksAfterInspirationSave } from "@/lib/supabase-links";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import MultiPhotoPicker from "@/components/MultiPhotoPicker";
import { useAuth } from "@/contexts/AuthContext";
function scoreMatch(inspTags: string[], piece: Piece): number {
  const pTags = new Set((piece.tags ?? []).map(t => t.toLowerCase()));
  let score = 0;
  inspTags.forEach(t => {
    if (pTags.has(t.toLowerCase())) score += 2;
  });
  if (piece.form) score += 0.5;
  return score;
}
const InspirationForm = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");
  const [linkTo, setLinkTo] = useState<string>("");
  const pieces = getPieces();
  const suggestions = useMemo(() => {
    const inspTags = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    return pieces.map(p => ({
      p,
      score: scoreMatch(inspTags, p)
    })).sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.p);
  }, [tags, pieces]);
  const handleSignInClick = () => {
    window.location.href = '/auth';
  };
  const onSubmit = async () => {
    const id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const item: Inspiration = {
      id,
      image_url: photos[0] || undefined,
      // Keep for backward compatibility
      photos: photos.length > 0 ? photos : undefined,
      
      note: note || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      linked_piece_id: linkTo || undefined,
      created_at: new Date().toISOString()
    };

    // Save inspiration first
    addInspiration(item);

    // Create symmetric link using Supabase if piece is selected and user is authenticated
    if (linkTo && isAuthenticated) {
      try {
        await syncLinksAfterInspirationSave(id, [linkTo], []);
        toast({
          title: "Inspiration saved",
          description: "Successfully linked to piece"
        });
      } catch (error: any) {
        const message = error?.message || 'Unknown error';
        toast({
          title: "Inspiration saved",
          description: `But linking failed: ${message}`,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Inspiration saved"
      });
    }
    navigate("/inspirations");
  };
  return <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — New Inspiration" description="Capture a new inspiration and optionally link it to a piece." />
      <h1 className="text-xl font-semibold">Add a New Inspiration</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiPhotoPicker photos={photos} onChange={setPhotos} maxPhotos={20} showButtons={false} />
          <Input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          <Textarea placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />
        </CardContent>
      </Card>

      {/* Section: Link with Pieces */}
      {suggestions.length > 0 && <Card>
          <CardHeader>
            <CardTitle className="text-base">Link with pieces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isAuthenticated ? <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to link inspirations with your pieces.
                </p>
                <Button onClick={handleSignInClick} variant="hero">
                  Sign in to enable linking
                </Button>
              </div> : <div className="space-y-2">
                <div className="text-sm font-medium mb-2">Suggested pieces</div>
                {suggestions.map(p => <label key={p.id} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="linkTo" value={p.id} checked={linkTo === p.id} onChange={e => setLinkTo(e.target.value)} />
                    <span className="text-foreground">{p.title}</span>
                    <span className="text-muted-foreground">— {p.current_stage.replace("_", " ")}</span>
                  </label>)}
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="linkTo" value="" checked={linkTo === ""} onChange={e => setLinkTo(e.target.value)} />
                  <span>Do not link</span>
                </label>
              </div>}
          </CardContent>
        </Card>}

      {/* Save Button */}
      <Button variant="hero" onClick={onSubmit} className="w-full">
        Save Inspiration
      </Button>
    </main>;
};
export default InspirationForm;