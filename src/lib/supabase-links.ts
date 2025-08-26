import { supabase } from "@/integrations/supabase/client";
import type { Piece, Inspiration } from "@/types";

export interface PieceInspirationLink {
  id: string;
  piece_id: string;
  inspiration_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Link a piece and inspiration (upsert to avoid duplicates)
 */
export async function linkPieceAndInspiration(pieceId: string, inspirationId: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('piece_inspiration_links')
    .upsert({
      piece_id: pieceId,
      inspiration_id: inspirationId,
      user_id: session.session.user.id
    }, {
      onConflict: 'piece_id,inspiration_id,user_id'
    });

  if (error) {
    throw new Error(`Failed to link piece and inspiration: ${error.message}`);
  }
}

/**
 * Unlink a piece and inspiration
 */
export async function unlinkPieceAndInspiration(pieceId: string, inspirationId: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('piece_inspiration_links')
    .delete()
    .eq('piece_id', pieceId)
    .eq('inspiration_id', inspirationId)
    .eq('user_id', session.session.user.id);

  if (error) {
    throw new Error(`Failed to unlink piece and inspiration: ${error.message}`);
  }
}

/**
 * Get all inspirations linked to a piece
 */
export async function getInspirationsForPiece(pieceId: string): Promise<Inspiration[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('piece_inspiration_links')
    .select(`
      created_at,
      inspirations (*)
    `)
    .eq('piece_id', pieceId)
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch inspirations for piece:', error);
    return [];
  }

  return data?.map(link => link.inspirations).filter(Boolean) as any[] || [];
}

/**
 * Get all pieces linked to an inspiration
 */
export async function getPiecesForInspiration(inspirationId: string): Promise<Piece[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('piece_inspiration_links')
    .select(`
      created_at,
      pieces (*)
    `)
    .eq('inspiration_id', inspirationId)
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch pieces for inspiration:', error);
    return [];
  }

  return data?.map(link => link.pieces).filter(Boolean) as any[] || [];
}

/**
 * Set links for a piece (replaces all existing links)
 */
export async function setPieceLinks(pieceId: string, inspirationIds: string[]): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // First, remove all existing links for this piece
  const { error: deleteError } = await supabase
    .from('piece_inspiration_links')
    .delete()
    .eq('piece_id', pieceId)
    .eq('user_id', userId);

  if (deleteError) {
    throw new Error(`Failed to remove existing links: ${deleteError.message}`);
  }

  // Then, add the new links
  if (inspirationIds.length > 0) {
    const links = inspirationIds.map(inspirationId => ({
      piece_id: pieceId,
      inspiration_id: inspirationId,
      user_id: userId
    }));

    const { error: insertError } = await supabase
      .from('piece_inspiration_links')
      .insert(links);

    if (insertError) {
      throw new Error(`Failed to create new links: ${insertError.message}`);
    }
  }
}

/**
 * Set links for an inspiration (replaces all existing links)
 */
export async function setInspirationLinks(inspirationId: string, pieceIds: string[]): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) {
    throw new Error('User not authenticated');
  }

  const userId = session.session.user.id;

  // First, remove all existing links for this inspiration
  const { error: deleteError } = await supabase
    .from('piece_inspiration_links')
    .delete()
    .eq('inspiration_id', inspirationId)
    .eq('user_id', userId);

  if (deleteError) {
    throw new Error(`Failed to remove existing links: ${deleteError.message}`);
  }

  // Then, add the new links
  if (pieceIds.length > 0) {
    const links = pieceIds.map(pieceId => ({
      piece_id: pieceId,
      inspiration_id: inspirationId,
      user_id: userId
    }));

    const { error: insertError } = await supabase
      .from('piece_inspiration_links')
      .insert(links);

    if (insertError) {
      throw new Error(`Failed to create new links: ${insertError.message}`);
    }
  }
}