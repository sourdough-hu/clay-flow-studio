export type PotteryForm = 
  | "Mug / Cup"
  | "Bowl"
  | "Vase"
  | "Plate"
  | "Pitcher"
  | "Teapot"
  | "Sculpture"
  | "Others";

export type ClayType = 
  | "Stoneware"
  | "Porcelain"
  | "Earthenware"
  | "Terracotta"
  | "Speckled Stoneware"
  | "Nerikomi"
  | "Recycled / Mixed"
  | "Others";

export type Stage =
  | "throwing"
  | "trimming"
  | "drying"
  | "bisque_firing"
  | "glazing"
  | "glaze_firing"
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
  form?: PotteryForm;
  form_details?: string; // for "Others" form selection
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
  clay_body_details?: string; // replaces clay_subtype, always shown
  glaze?: string;
  carving?: string;
  slip?: string;
  underglaze?: string;
  inspiration_links?: string[]; // array of inspiration IDs
  remote_id?: string; // Supabase ID when synced
}

export interface Inspiration {
  id: string;
  title?: string; // Add title property for consistency
  image_url?: string; // kept for backward compatibility (thumbnail)
  photos?: string[]; // multiple photos; first one is thumbnail
  link_url?: string;
  note?: string;
  tags?: string[];
  linked_piece_id?: string | null; // legacy single link
  created_at: string; // ISO
  remote_id?: string; // Supabase ID when synced
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
