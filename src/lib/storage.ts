import { Piece, Inspiration, UpcomingTask, PieceInspirationLink } from "@/types";
import { migrateToPhotosArray } from "./photos";

const PIECES_KEY = "pt_pieces";
const INSPIRATIONS_KEY = "pt_inspirations";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getPieces(): Piece[] {
  const pieces = safeParse<Piece[]>(localStorage.getItem(PIECES_KEY), []);
  // Migrate any pieces that don't have photos array
  return pieces.map(piece => {
    if (!piece.photos || piece.photos.length === 0) {
      const migratedPhotos = migrateToPhotosArray(undefined, piece.photos);
      return { ...piece, photos: migratedPhotos };
    }
    return piece;
  });
}

export function savePieces(pieces: Piece[]) {
  localStorage.setItem(PIECES_KEY, JSON.stringify(pieces));
}

export function upsertPiece(piece: Piece) {
  const all = getPieces();
  const idx = all.findIndex((p) => p.id === piece.id);
  const prev = idx >= 0 ? all[idx] : undefined;

  let updated: Piece = { ...piece };
  if (prev) {
    const prevStage = prev.current_stage;
    const nextStage = piece.current_stage;
    if (prevStage !== nextStage) {
      const history = [...(prev.history ?? [])];
      if (nextStage === "finished" && prevStage !== "finished") {
        // Move to gallery: clear next checkpoint and log
        updated = {
          ...updated,
          next_step: undefined,
          next_reminder_at: null,
          history: [...history, { event: "moved_to_gallery", date: new Date().toISOString() }],
        };
      } else if (prevStage === "finished" && nextStage !== "finished") {
        // Return to WIP: log
        updated = {
          ...updated,
          history: [...history, { event: "returned_to_wip", to: nextStage, date: new Date().toISOString() }],
        };
      } else {
        updated = { ...updated, history };
      }
    } else {
      // keep existing history
      updated = { ...updated, history: prev.history };
    }
  }

  if (idx >= 0) all[idx] = updated; else all.push(updated);
  savePieces(all);
}


export function getPieceById(id: string): Piece | undefined {
  return getPieces().find((p) => p.id === id);
}

export function getInspirations(): Inspiration[] {
  const inspirations = safeParse<Inspiration[]>(localStorage.getItem(INSPIRATIONS_KEY), []);
  // Migrate any inspirations that don't have photos array
  return inspirations.map(inspiration => {
    if (!inspiration.photos || inspiration.photos.length === 0) {
      const migratedPhotos = migrateToPhotosArray(inspiration.image_url, inspiration.photos);
      return { ...inspiration, photos: migratedPhotos };
    }
    return inspiration;
  });
}

export function saveInspirations(items: Inspiration[]) {
  localStorage.setItem(INSPIRATIONS_KEY, JSON.stringify(items));
}

export function addInspiration(item: Inspiration) {
  const all = getInspirations();
  all.unshift(item);
  saveInspirations(all);
}

export function getUpcomingTasks(withinDays = 3): UpcomingTask[] {
  const now = new Date();
  const until = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  return getPieces()
    .filter((p) => p.next_reminder_at && new Date(p.next_reminder_at) <= until)
    .map((p) => ({
      piece_id: p.id,
      title: p.title,
      action: p.next_step ?? "Next step",
      due_at: p.next_reminder_at!,
    }))
    .sort((a, b) => +new Date(a.due_at) - +new Date(b.due_at));
}

// --- Bidirectional links between Pieces and Inspirations ---
const LINKS_KEY = "pt_piece_inspirations";

export function getLinks(): PieceInspirationLink[] {
  return safeParse<PieceInspirationLink[]>(localStorage.getItem(LINKS_KEY), []);
}

export function saveLinks(list: PieceInspirationLink[]) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(list));
}

export function getInspirationsForPiece(pieceId: string): Inspiration[] {
  const links = getLinks().filter((l) => l.piece_id === pieceId);
  const inspIds = new Set(links.map((l) => l.inspiration_id));
  return getInspirations().filter((i) => inspIds.has(i.id));
}

export function getPiecesForInspiration(inspirationId: string): Piece[] {
  const links = getLinks().filter((l) => l.inspiration_id === inspirationId);
  const pieceIds = new Set(links.map((l) => l.piece_id));
  return getPieces().filter((p) => pieceIds.has(p.id));
}

function logPieceHistory(pieceId: string, event: "inspirations_linked" | "inspirations_unlinked", count: number) {
  if (count <= 0) return;
  const p = getPieceById(pieceId);
  if (!p) return;
  const history = [...(p.history ?? []), { event, count, date: new Date().toISOString() }];
  const updated: Piece = { ...p, history };
  upsertPiece(updated);
}

export function setPieceLinks(pieceId: string, inspirationIds: string[]) {
  const links = getLinks();
  const existing = links.filter((l) => l.piece_id === pieceId).map((l) => l.inspiration_id);
  const existingSet = new Set(existing);
  const desiredSet = new Set(inspirationIds);

  const toAdd = inspirationIds.filter((id) => !existingSet.has(id));
  const toRemove = existing.filter((id) => !desiredSet.has(id));

  const kept = links.filter((l) => !(l.piece_id === pieceId && toRemove.includes(l.inspiration_id)));
  const added: PieceInspirationLink[] = toAdd.map((inspId) => ({
    id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    piece_id: pieceId,
    inspiration_id: inspId,
    created_at: new Date().toISOString(),
  }));

  saveLinks([...kept, ...added]);
  if (toAdd.length) logPieceHistory(pieceId, "inspirations_linked", toAdd.length);
  if (toRemove.length) logPieceHistory(pieceId, "inspirations_unlinked", toRemove.length);
}

export function setInspirationLinks(inspirationId: string, pieceIds: string[]) {
  const links = getLinks();
  const existing = links.filter((l) => l.inspiration_id === inspirationId).map((l) => l.piece_id);
  const existingSet = new Set(existing);
  const desiredSet = new Set(pieceIds);

  const toAdd = pieceIds.filter((id) => !existingSet.has(id));
  const toRemove = existing.filter((id) => !desiredSet.has(id));

  const kept = links.filter((l) => !(l.inspiration_id === inspirationId && toRemove.includes(l.piece_id)));
  const added: PieceInspirationLink[] = toAdd.map((pieceId) => ({
    id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    piece_id: pieceId,
    inspiration_id: inspirationId,
    created_at: new Date().toISOString(),
  }));

  saveLinks([...kept, ...added]);
  // also log per piece
  toAdd.forEach((pid) => logPieceHistory(pid, "inspirations_linked", 1));
  toRemove.forEach((pid) => logPieceHistory(pid, "inspirations_unlinked", 1));
}

export function updateInspiration(insp: Inspiration) {
  const all = getInspirations();
  const idx = all.findIndex((i) => i.id === insp.id);
  if (idx >= 0) all[idx] = insp; else all.unshift(insp);
  saveInspirations(all);
}
