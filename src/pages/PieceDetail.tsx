import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPieceById, upsertPiece, getInspirationsForPiece } from "@/lib/storage";
import { advanceStage, stageOrder } from "@/lib/stage";
import { SEO } from "@/components/SEO";
import PhotoGallery from "@/components/PhotoGallery";
import { Stage } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PieceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const piece = useMemo(() => (id ? getPieceById(id) : undefined), [id]);

  if (!piece) return <main className="p-4">Piece not found.</main>;

  const onAdvance = () => {
    const updated = advanceStage(piece);
    upsertPiece(updated);
    navigate(0);
  };

  const [showAdjust, setShowAdjust] = useState(false);
  const nextIdx = Math.min(stageOrder.indexOf(piece.current_stage) + 1, stageOrder.length - 1);
  const defaultStage = stageOrder[nextIdx] ?? piece.current_stage;
  const [adjStage, setAdjStage] = useState<Stage>(defaultStage);
  const [adjDate, setAdjDate] = useState<string>(piece.next_reminder_at ? new Date(piece.next_reminder_at).toISOString().slice(0,10) : "");
  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title={`Pottery — ${piece.title}`} description={`Current stage: ${piece.current_stage}`} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{piece.title}</h1>
        <div className="flex items-center gap-2">
          {piece.form && <span className="text-sm text-muted-foreground">{piece.form}</span>}
          <Link to={`/edit/piece/${piece.id}`} className="text-sm underline underline-offset-4 text-primary">Edit Piece</Link>
        </div>
      </div>
      
      {piece.clay_type && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Clay:</span> {piece.clay_type}
          {piece.clay_body_details && ` — ${piece.clay_body_details}`}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>Stage: <span className="font-medium text-foreground">{(() => { const s = piece.current_stage.replace("_"," "); return s.charAt(0).toUpperCase() + s.slice(1); })()}</span></div>
          {piece.storage_location && <div>Location: <span className="font-medium text-foreground">{piece.storage_location}</span></div>}
          {piece.tags && piece.tags.length > 0 && (
            <div>Tags: <span className="font-medium text-foreground">{piece.tags.join(", ")}</span></div>
          )}
          {piece.next_step && (
            <div>Next: <span className="font-medium text-foreground">{piece.next_step}</span></div>
          )}
          {piece.next_reminder_at && (
            <div>Reminder: <span className="font-medium text-foreground">{new Date(piece.next_reminder_at).toLocaleDateString()}</span></div>
          )}
          {(piece.notes || piece.technique_notes) && (
            <div className="space-y-2">
              {piece.notes && <p className="text-muted-foreground">{piece.notes}</p>}
              {piece.technique_notes && (
                <p className="text-muted-foreground"><span className="text-foreground font-medium">Technique:</span> {piece.technique_notes}</p>
              )}
            </div>
          )}
          {piece.stage_history && piece.stage_history.length > 0 && (
            <div>
              <div className="font-medium mb-1">History</div>
              <ul className="list-disc pl-5 space-y-1">
                {piece.stage_history.map((h, i) => (
                  <li key={i} className="text-muted-foreground">{h.stage.replace("_"," ")} — {new Date(h.date).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}

          {piece.current_stage !== "finished" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="hero" onClick={onAdvance}>Mark stage complete</Button>
              <Button variant="outline" onClick={() => setShowAdjust(true)}>Adjust Next Checkpoint</Button>
            </div>
          )}

          {/* Adjust Next Checkpoint Dialog */}
          <Dialog open={showAdjust} onOpenChange={setShowAdjust}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Next Checkpoint</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <div className="mb-1 text-sm font-medium">Stage</div>
                    <Select value={adjStage} onValueChange={(v) => setAdjStage(v as Stage)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOrder.map((s) => (
                          <SelectItem key={s} value={s}>{(s.replace("_"," ").charAt(0).toUpperCase() + s.replace("_"," ").slice(1))}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-1 text-sm font-medium">Date</div>
                    <Input type="date" value={adjDate} onChange={(e) => setAdjDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAdjust(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    const nextStep = adjStage ? `Move to ${adjStage.replace("_", " ")}` : undefined;
                    const date = adjDate ? new Date(adjDate) : null;
                    const updated = { ...piece, next_step: nextStep, next_reminder_at: date ? date.toISOString() : null };
                    upsertPiece(updated);
                    setShowAdjust(false);
                    navigate(0);
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {(piece.photos && piece.photos.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGallery photos={piece.photos} />
          </CardContent>
        </Card>
      )}

      {piece.current_stage === "finished" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {piece.description ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{piece.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}


      {/* Inspirations section */}
      {getInspirationsForPiece(piece.id).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inspirations</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {getInspirationsForPiece(piece.id).map((i) => (
                  <Link key={i.id} to={`/inspiration/${i.id}`} className="block">
                    <img src={i.photos?.[0] ?? i.image_url ?? "/placeholder.svg"} alt={i.note ? `${i.note.slice(0,40)} thumbnail` : "Inspiration thumbnail"} className="w-full aspect-video object-cover rounded-md border" />
                  </Link>
                ))}
              </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default PieceDetail;
