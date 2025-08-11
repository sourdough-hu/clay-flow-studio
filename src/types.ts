export type SizeCategory = "Tiny" | "Small" | "Medium" | "Large" | "Extra Large";

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

export interface Piece {
  id: string;
  title: string;
  photos: string[];
  start_date?: string; // ISO
  size_category?: SizeCategory;
  current_stage: Stage;
  storage_location?: string;
  notes?: string;
  tags?: string[];
  technique_notes?: string;
  next_step?: string;
  next_reminder_at?: string | null; // ISO or null
  stage_history?: StageEntry[];
}

export interface Inspiration {
  id: string;
  image_url?: string;
  link_url?: string;
  note?: string;
  tags?: string[];
  linked_piece_id?: string | null;
  created_at: string; // ISO
}

export interface UpcomingTask {
  piece_id: string;
  title: string;
  action: string;
  due_at: string; // ISO
}
