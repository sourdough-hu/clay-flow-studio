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
import { getThumbnailUrl } from "@/lib/photos";
import { Edit, ZoomIn } from "lucide-react";

const PieceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const piece = useMemo(() => (id ? getPieceById(id) : undefined), [id]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Debug: Log the photos data
  if (piece?.photos) {
    console.log('Photos array:', piece.photos);
    console.table(
      piece.photos.map((photo, i) => ({ 
        index: i, 
        url: photo,
        isSelected: i === selectedPhotoIndex 
      }))
    );
  }

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

  // Check if any About fields have content
  const hasAboutContent = piece.form || piece.current_stage || piece.clay_type || piece.clay_body_details;

  // Check if any Decoration fields have content
  const hasDecorationContent = piece.glaze || piece.carving || piece.slip || piece.underglaze;

  // Check if Notes field has content
  const hasNotesContent = piece.notes;

  // Check if any Details content exists
  const hasDetailsContent = hasAboutContent || hasDecorationContent || hasNotesContent;
  return (
    <main className="min-h-screen">
      <SEO title={`Pottery — ${piece.title}`} description={`Current stage: ${piece.current_stage}`} />
      
      {/* Hero Image and Thumbnail Strip */}
      {piece.photos && piece.photos.length > 0 ? (
        <div className="relative">
          {/* Hero Image - Show selected photo */}
          <div 
            className="relative w-full h-[45vh] overflow-hidden cursor-pointer"
            onClick={() => {
              const galleryTrigger = document.querySelector('[data-photo-gallery-trigger]') as HTMLElement;
              galleryTrigger?.click();
            }}
          >
            <img
              src={getThumbnailUrl(piece.photos, piece.photos[selectedPhotoIndex])}
              alt={`${piece.title} - Photo ${selectedPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Strip - Show all photos except currently selected */}
          {piece.photos.length > 1 && (
            <div className="px-4 py-3 bg-background border-b">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {piece.photos.map((photo, index) => (
                  index !== selectedPhotoIndex && (
                    <button
                      key={photo || index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-all"
                      aria-label={`Photo ${index + 1} of ${piece.photos.length}`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                ))}
              </div>
              {piece.photos.length > 1 && (
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Swipe thumbnails • {piece.photos.length} photos
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[20vh] bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">No photos available</p>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Header with Title and Edit */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{piece.title}</h1>
          <Link
            to={`/edit/piece/${piece.id}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
        </div>

        {/* Stage Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="section-header">Stage Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-20 field-label">Stage</div>
                <div className="flex-1 font-normal">
                  {piece.current_stage.replace("_", " ").charAt(0).toUpperCase() + piece.current_stage.replace("_", " ").slice(1)}
                </div>
              </div>

              {piece.next_step && (
                <div className="flex items-start gap-4">
                  <div className="w-20 field-label">Next</div>
                  <div className="flex-1 font-normal">{piece.next_step}</div>
                </div>
              )}

              {piece.next_reminder_at && (
                <div className="flex items-start gap-4">
                  <div className="w-20 field-label">Reminder</div>
                  <div className="flex-1 font-normal">{new Date(piece.next_reminder_at).toLocaleDateString()}</div>
                </div>
              )}

              {piece.stage_history && piece.stage_history.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-20 field-label">History</div>
                  <div className="flex-1 space-y-1">
                    {piece.stage_history.slice(-3).map((h, i) => (
                      <div key={i} className="text-sm text-muted-foreground">
                        {h.stage.replace("_", " ")} — {new Date(h.date).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stage Actions */}
            {piece.current_stage !== "finished" && (
              <div className="pt-3 border-t">
                <div className="flex flex-wrap gap-2">
                  <Button variant="hero" onClick={onAdvance}>Mark stage complete</Button>
                  <Button variant="outline" onClick={() => setShowAdjust(true)}>Adjust Next Checkpoint</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Section */}
        {hasDetailsContent && (
          <Card>
            <CardHeader>
              <CardTitle className="section-header">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* About Sub-section */}
              {hasAboutContent && (
                <div className="space-y-3">
                  <h4 className="text-[17px] font-semibold">About</h4>
                  
                  {piece.form && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Form</div>
                      <div className="flex-1 font-normal">
                        {piece.form}
                        {piece.form === "Others" && piece.form_details && (
                          <span className="text-muted-foreground"> • {piece.form_details}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {piece.current_stage && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Stage</div>
                      <div className="flex-1 font-normal">
                        {piece.current_stage.replace("_", " ").charAt(0).toUpperCase() + piece.current_stage.replace("_", " ").slice(1)}
                      </div>
                    </div>
                  )}

                  {piece.clay_type && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Clay Body</div>
                      <div className="flex-1 font-normal">
                        {piece.clay_type}
                        {piece.clay_body_details && (
                          <span className="text-muted-foreground"> • {piece.clay_body_details}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Decoration Sub-section */}
              {hasDecorationContent && (
                <div className="space-y-3">
                  <h4 className="text-[17px] font-semibold">Decoration</h4>
                  
                  {piece.glaze && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Glaze</div>
                      <div className="flex-1 font-normal">{piece.glaze}</div>
                    </div>
                  )}

                  {piece.carving && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Carving</div>
                      <div className="flex-1 font-normal">{piece.carving}</div>
                    </div>
                  )}

                  {piece.slip && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Slip</div>
                      <div className="flex-1 font-normal">{piece.slip}</div>
                    </div>
                  )}

                  {piece.underglaze && (
                    <div className="flex items-start gap-4">
                      <div className="w-20 field-label">Underglaze</div>
                      <div className="flex-1 font-normal">{piece.underglaze}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Sub-section */}
              {hasNotesContent && (
                <div className="space-y-3">
                  <h4 className="text-[17px] font-semibold">Notes</h4>
                  <div className="text-sm font-normal whitespace-pre-wrap text-muted-foreground">
                    {piece.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Inspirations Section */}
        {getInspirationsForPiece(piece.id).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="section-header">Inspirations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {getInspirationsForPiece(piece.id).map((inspiration) => (
                  <Link key={inspiration.id} to={`/inspiration/${inspiration.id}`} className="block">
                    <div className="relative aspect-square rounded-md overflow-hidden border hover:border-primary/50 transition-colors">
                      <img
                        src={getThumbnailUrl(inspiration.photos, inspiration.image_url)}
                        alt="Inspiration"
                        className="w-full h-full object-cover"
                      />
                      {inspiration.note && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                          {inspiration.note.length > 20 ? `${inspiration.note.slice(0, 20)}...` : inspiration.note}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
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
                  <div className="mb-1 field-label">Stage</div>
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
                  <div className="mb-1 field-label">Date</div>
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

        {/* Photo Gallery for full-screen viewing */}
        {piece.photos && (
          <div className="fixed bottom-4 right-4 opacity-0 pointer-events-none">
            <PhotoGallery photos={piece.photos} initialIndex={selectedPhotoIndex} />
            <button 
              data-photo-gallery-trigger
              className="hidden"
              onClick={() => {
                const gallery = document.querySelector('[data-photo-gallery]') as HTMLElement;
                gallery?.click();
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default PieceDetail;
