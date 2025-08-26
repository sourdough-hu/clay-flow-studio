import { supabase } from "@/integrations/supabase/client";
import { Piece, Inspiration } from "@/types";
import { getPieces, getInspirations, getLinks } from "@/lib/storage";

// Symmetric linking functions for pieces and inspirations
// Safe wrapper functions with detailed logging
export async function safeUpsertLink(pieceId: string, inspId: string) {
  try {
    if (!pieceId || typeof pieceId !== 'string') throw new Error('invalid pieceId');
    if (!inspId || typeof inspId !== 'string') throw new Error('invalid inspirationId');
    
    console.log('[Link Upsert] Attempting:', { pieceId, inspId });
    const res = await linkPieceAndInspiration(pieceId, inspId);
    console.log('[Link Upsert] Success:', { pieceId, inspId });
    return res;
  } catch (e: any) {
    console.error('[Link Upsert FAILED]', {
      pieceId, inspId, name: e?.name, code: e?.code, message: e?.message, details: e
    });
    throw e;
  }
}

export async function safeRemoveLink(pieceId: string, inspId: string) {
  try {
    console.log('[Link Remove] Attempting:', { pieceId, inspId });
    const res = await unlinkPieceAndInspiration(pieceId, inspId);
    console.log('[Link Remove] Success:', { pieceId, inspId });
    return res;
  } catch (e: any) {
    console.error('[Link Remove FAILED]', {
      pieceId, inspId, name: e?.name, code: e?.code, message: e?.message, details: e
    });
    throw e;
  }
}

export async function linkPieceAndInspiration(pieceId: string, inspirationId: string) {
  try {
    // Coerce to string to avoid type mismatches
    const pid = String(pieceId);
    const iid = String(inspirationId);
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('piece_inspiration_links')
      .upsert({ 
        piece_id: pid, 
        inspiration_id: iid, 
        user_id: user.user.id 
      }, {
        onConflict: 'piece_id,inspiration_id',
        ignoreDuplicates: true
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error linking piece and inspiration:', error);
    throw error;
  }
}

export async function unlinkPieceAndInspiration(pieceId: string, inspirationId: string) {
  try {
    // Coerce to string to avoid type mismatches
    const pid = String(pieceId);
    const iid = String(inspirationId);
    
    const { error } = await supabase
      .from('piece_inspiration_links')
      .delete()
      .match({ piece_id: pid, inspiration_id: iid });

    if (error) throw error;
  } catch (error) {
    console.error('Error unlinking piece and inspiration:', error);
    throw error;
  }
}

export async function getInspirationsForPiece(pieceId: string): Promise<Inspiration[]> {
  try {
    const { data, error } = await supabase
      .from('piece_inspiration_links')
      .select(`
        inspirations (*)
      `)
      .eq('piece_id', pieceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return (data || [])
      .map(item => item.inspirations)
      .filter(Boolean) as any[];
  } catch (error) {
    console.error('Error fetching inspirations for piece:', error);
    return [];
  }
}

export async function getPiecesForInspiration(inspirationId: string): Promise<Piece[]> {
  try {
    const { data, error } = await supabase
      .from('piece_inspiration_links')
      .select(`
        pieces (*)
      `)
      .eq('inspiration_id', inspirationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return (data || [])
      .map(item => item.pieces)
      .filter(Boolean) as any[];
  } catch (error) {
    console.error('Error fetching pieces for inspiration:', error);
    return [];
  }
}

export async function setPieceLinks(pieceId: string, inspirationIds: string[]) {
  try {
    // Get current links
    const { data: currentLinks, error: fetchError } = await supabase
      .from('piece_inspiration_links')
      .select('inspiration_id')
      .eq('piece_id', pieceId);

    if (fetchError) throw fetchError;

    const currentIds = new Set((currentLinks || []).map(link => link.inspiration_id));
    const desiredIds = new Set(inspirationIds);

    // Determine what to add and remove
    const toAdd = inspirationIds.filter(id => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter(id => !desiredIds.has(id));

    // Remove unwanted links
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('piece_inspiration_links')
        .delete()
        .eq('piece_id', pieceId)
        .in('inspiration_id', toRemove);

      if (deleteError) throw deleteError;
    }

    // Add new links
    if (toAdd.length > 0) {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user?.id) {
        throw new Error('User not authenticated');
      }

      const newLinks = toAdd.map(inspirationId => ({
        piece_id: pieceId,
        inspiration_id: inspirationId,
        user_id: user.user.id
      }));

      const { error: insertError } = await supabase
        .from('piece_inspiration_links')
        .insert(newLinks);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error setting piece links:', error);
    throw error;
  }
}

export async function setInspirationLinks(inspirationId: string, pieceIds: string[]) {
  try {
    // Get current links
    const { data: currentLinks, error: fetchError } = await supabase
      .from('piece_inspiration_links')
      .select('piece_id')
      .eq('inspiration_id', inspirationId);

    if (fetchError) throw fetchError;

    const currentIds = new Set((currentLinks || []).map(link => link.piece_id));
    const desiredIds = new Set(pieceIds);

    // Determine what to add and remove
    const toAdd = pieceIds.filter(id => !currentIds.has(id));
    const toRemove = Array.from(currentIds).filter(id => !desiredIds.has(id));

    // Remove unwanted links
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('piece_inspiration_links')
        .delete()
        .eq('inspiration_id', inspirationId)
        .in('piece_id', toRemove);

      if (deleteError) throw deleteError;
    }

    // Add new links
    if (toAdd.length > 0) {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user?.id) {
        throw new Error('User not authenticated');
      }

      const newLinks = toAdd.map(pieceId => ({
        piece_id: pieceId,
        inspiration_id: inspirationId,
        user_id: user.user.id
      }));

      const { error: insertError } = await supabase
        .from('piece_inspiration_links')
        .insert(newLinks);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error setting inspiration links:', error);
    throw error;
  }
}

// Backfill function to migrate existing localStorage data to Supabase
export async function backfillExistingLinks() {
  try {
    // Get existing links from localStorage
    const localLinks = getLinks();
    
    if (localLinks.length === 0) {
      console.log('No existing links to backfill');
      return;
    }

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user?.id) {
      console.log('User not authenticated, skipping backfill');
      return;
    }

    // Transform localStorage links to Supabase format
    const supabaseLinks = localLinks.map(link => ({
      piece_id: link.piece_id,
      inspiration_id: link.inspiration_id,
      user_id: user.user.id,
      created_at: link.created_at
    }));

    // Insert all links with upsert to avoid duplicates
    const { error } = await supabase
      .from('piece_inspiration_links')
      .upsert(supabaseLinks, {
        onConflict: 'piece_id,inspiration_id'
      });

    if (error) throw error;

    console.log(`Successfully backfilled ${supabaseLinks.length} links to Supabase`);
  } catch (error) {
    console.error('Error backfilling links:', error);
    throw error;
  }
}