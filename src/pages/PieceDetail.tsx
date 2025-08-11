import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPieceById, upsertPiece } from "@/lib/storage";
import { advanceStage } from "@/lib/stage";
import { SEO } from "@/components/SEO";

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

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title={`Pottery — ${piece.title}`} description={`Current stage: ${piece.current_stage}`} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{piece.title}</h1>
        <span className="text-sm text-muted-foreground">{piece.size_category}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>Stage: <span className="font-medium text-foreground">{piece.current_stage.replace("_"," ")}</span></div>
          {piece.storage_location && <div>Location: <span className="font-medium text-foreground">{piece.storage_location}</span></div>}
          {piece.tags && piece.tags.length > 0 && (
            <div>Tags: <span className="font-medium text-foreground">{piece.tags.join(", ")}</span></div>
          )}
          {piece.next_step && (
            <div>Next: <span className="font-medium text-foreground">{piece.next_step}</span></div>
          )}
          {piece.next_reminder_at && (
            <div>Reminder: <span className="font-medium text-foreground">{new Date(piece.next_reminder_at).toLocaleString()}</span></div>
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
            <Button variant="hero" onClick={onAdvance}>Mark stage complete</Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PieceDetail;
