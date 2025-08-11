import { Piece, Inspiration, UpcomingTask } from "@/types";

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
  return safeParse<Piece[]>(localStorage.getItem(PIECES_KEY), []);
}

export function savePieces(pieces: Piece[]) {
  localStorage.setItem(PIECES_KEY, JSON.stringify(pieces));
}

export function upsertPiece(piece: Piece) {
  const all = getPieces();
  const idx = all.findIndex((p) => p.id === piece.id);
  if (idx >= 0) all[idx] = piece; else all.push(piece);
  savePieces(all);
}

export function getPieceById(id: string): Piece | undefined {
  return getPieces().find((p) => p.id === id);
}

export function getInspirations(): Inspiration[] {
  return safeParse<Inspiration[]>(localStorage.getItem(INSPIRATIONS_KEY), []);
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
