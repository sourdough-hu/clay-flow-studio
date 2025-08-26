import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PhotoGallery from "@/components/PhotoGallery";
import MultiPhotoPicker from "@/components/MultiPhotoPicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Inspiration, Piece } from "@/types";
import { getInspirations, getPieces, updateInspiration } from "@/lib/storage";
import { getPiecesForInspiration, linkPieceAndInspiration, unlinkPieceAndInspiration } from "@/lib/supabase-links";

const InspirationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const inspiration = useMemo(() => getInspirations().find((i) => i.id === id), [id]);
  const allPieces = getPieces();
  const [linkedPieces, setLinkedPieces] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchLinkedPieces = async () => {
      if (id) {
        const pieces = await getPiecesForInspiration(id);
        setLinkedPieces(pieces);
        console.table({ fromJoinTable: pieces.map(x => x.id) });
      }
    };
    fetchLinkedPieces();
  }, [id]);

  const [note, setNote] = useState<string>(inspiration?.note ?? "");
  const [tags, setTags] = useState<string>((inspiration?.tags ?? []).join(", "));
  const [photos, setPhotos] = useState<string[]>(
    (inspiration?.photos && inspiration.photos.length > 0)
      ? inspiration.photos
      : (inspiration?.image_url ? [inspiration.image_url] : [])
  );
  const [selectedPieceIds, setSelectedPieceIds] = useState<Set<string>>(new Set());
  const [originalPieceIds, setOriginalPieceIds] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  
  // Update selectedPieceIds when linkedPieces changes
  useEffect(() => {
    const pieceIds = new Set(linkedPieces.map((p) => p.id));
    setSelectedPieceIds(pieceIds);
    setOriginalPieceIds(new Set(pieceIds));
  }, [linkedPieces]);

  if (!inspiration) return <main className="p-4">Inspiration not found.</main>;


  const togglePiece = (pid: string) => {
    setSelectedPieceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pid)) {
        newSet.delete(pid);
      } else {
        newSet.add(pid);
      }
      return newSet;
    });
  };

  const computeDiff = () => {
    const toLink = [...selectedPieceIds].filter(id => !originalPieceIds.has(id));
    const toUnlink = [...originalPieceIds].filter(id => !selectedPieceIds.has(id));
    return { toLink, toUnlink };
  };

  const onSave = async () => {
    try {
      // 1) Save the inspiration itself (only scalar fields + photos)
      const updated: Inspiration = {
        ...inspiration,
        note: note || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        photos: photos,
        image_url: photos[0] || inspiration.image_url,
      };
      updateInspiration(updated);

      // 2) Apply link diffs AFTER inspiration is saved
      const { toLink, toUnlink } = computeDiff();

      // Apply unlinks first, then links
      for (const pieceId of toUnlink) {
        await unlinkPieceAndInspiration(pieceId, inspiration.id);
      }
      for (const pieceId of toLink) {
        await linkPieceAndInspiration(pieceId, inspiration.id);
      }

      // 3) Update original state for future saves
      setOriginalPieceIds(new Set(selectedPieceIds));

      navigate(0);
    } catch (error) {
      console.error('Error saving inspiration:', error);
      // If linking fails, inspiration is still saved
      alert('Saved, but couldn\'t update links. Retry from Edit.');
    }
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title={`Pottery Tracker — Inspiration`} description={inspiration.note?.slice(0, 100) || "Inspiration detail"} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inspiration</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="hero" onClick={onSave}>Save</Button>
            </>
          ) : (
            <Button variant="hero" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <MultiPhotoPicker photos={photos} onChange={setPhotos} />
          ) : (
            <PhotoGallery photos={photos} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <>
              <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              <Textarea placeholder="Notes" value={note} onChange={(e) => setNote(e.target.value)} />
            </>
          ) : (
            <>
              {tags && <div className="text-sm">Tags: <span className="text-foreground font-medium">{tags}</span></div>}
              {note && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linked Pieces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <div className="grid grid-cols-1 gap-2">
              {allPieces.map((p: Piece) => (
                <label key={p.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={selectedPieceIds.has(p.id)} onChange={() => togglePiece(p.id)} />
                  <div className="flex items-center gap-2">
                    {p.photos && p.photos[0] && (
                      <img src={p.photos[0]} alt={`${p.title} thumbnail`} className="w-10 h-10 rounded object-cover border" />
                    )}
                    <span className="text-foreground">{p.title}</span>
                  </div>
                </label>
              ))}
            </div>
          ) : null}

          {linkedPieces.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-2">Currently linked</div>
              <div className="grid grid-cols-1 gap-3">
                {linkedPieces.map((p) => (
                  <Link to={`/piece/${p.id}`} key={p.id} className="block">
                    <img src={p.photos?.[0] ?? "/placeholder.svg"} alt={`${p.title} thumbnail`} className="w-full aspect-video object-cover rounded border" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default InspirationDetail;
