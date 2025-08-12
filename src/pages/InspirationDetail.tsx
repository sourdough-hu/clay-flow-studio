import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CameraCapture from "@/components/CameraCapture";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Inspiration, Piece } from "@/types";
import { getInspirations, getPieces, getPiecesForInspiration, setInspirationLinks, updateInspiration } from "@/lib/storage";

const InspirationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const inspiration = useMemo(() => getInspirations().find((i) => i.id === id), [id]);
  const allPieces = getPieces();
  const linkedPieces = id ? getPiecesForInspiration(id) : [];

  const [note, setNote] = useState<string>(inspiration?.note ?? "");
  const [tags, setTags] = useState<string>((inspiration?.tags ?? []).join(", "));
  const [photos, setPhotos] = useState<string[]>(
    (inspiration?.photos && inspiration.photos.length > 0)
      ? inspiration.photos
      : (inspiration?.image_url ? [inspiration.image_url] : [])
  );
  const [selectedPieceIds, setSelectedPieceIds] = useState<string[]>(linkedPieces.map((p) => p.id));
  const [isEditing, setIsEditing] = useState(false);

  if (!inspiration) return <main className="p-4">Inspiration not found.</main>;

  const setThumb = (dataUrl: string | null) => {
    if (!dataUrl) return;
    setPhotos((prev) => [dataUrl, ...prev]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const togglePiece = (pid: string) => {
    setSelectedPieceIds((prev) => prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]);
  };

  const onSave = () => {
    const updated: Inspiration = {
      ...inspiration,
      note: note || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      photos: photos,
      image_url: photos[0] || inspiration.image_url,
    };
    updateInspiration(updated);
    setInspirationLinks(inspiration.id, selectedPieceIds);
    navigate(0);
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
        <CardContent className="space-y-3">
          {isEditing && <CameraCapture label="Add photo" value={null} onChange={setThumb} />}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((src, i) => (
                <div key={i} className="space-y-1">
                  <img src={src} alt={`Inspiration photo ${i+1}`} className="w-full rounded-md border object-cover" />
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={() => removePhoto(i)}>Delete</Button>
                  )}
                </div>
              ))}
            </div>
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
                  <input type="checkbox" checked={selectedPieceIds.includes(p.id)} onChange={() => togglePiece(p.id)} />
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
