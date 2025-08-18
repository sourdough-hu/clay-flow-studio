export type SizeCategory = "Tiny" | "Small" | "Medium" | "Large" | "Extra Large";

export type ClayType = 
  | "Stoneware"
  | "Porcelain"
  | "Earthenware"
  | "Terracotta"
  | "Speckled Stoneware"
  | "Recycled / Mixed"
  | "Other";

export type Stage =
  | "throwing"
  | "trimming"
  | "drying"
  | "bisque_firing"
  | "glazing"
  | "glaze_firing"
  | "decorating"
  | "finished";

export interface StageEntry {
  stage: Stage;
  date: string; // ISO string
}

export type HistoryEvent =
  | { event: "inspirations_linked"; count: number; date: string }
  | { event: "inspirations_unlinked"; count: number; date: string }
  | { event: "moved_to_gallery"; date: string }
  | { event: "returned_to_wip"; to: Stage; date: string };

export interface Piece {
  id: string;
  title: string;
  photos: string[]; // data URLs or http(s) URLs; first item is thumbnail
  start_date?: string; // ISO
  size_category?: SizeCategory;
  current_stage: Stage;
  storage_location?: string;
  notes?: string;
  tags?: string[];
  technique_notes?: string;
  description?: string;
  next_step?: string;
  next_reminder_at?: string | null; // ISO or null
  stage_history?: StageEntry[];
  history?: HistoryEvent[];
  clay_type?: ClayType;
  clay_subtype?: string;
}

export interface Inspiration {
  id: string;
  image_url?: string; // kept for backward compatibility (thumbnail)
  photos?: string[]; // multiple photos; first one is thumbnail
  link_url?: string;
  note?: string;
  tags?: string[];
  linked_piece_id?: string | null; // legacy single link
  created_at: string; // ISO
}

export interface PieceInspirationLink {
  id: string;
  piece_id: string;
  inspiration_id: string;
  created_at: string; // ISO
}

export interface UpcomingTask {
  piece_id: string;
  title: string;
  action: string;
  due_at: string; // ISO
}
