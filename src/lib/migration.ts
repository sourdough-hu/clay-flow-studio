import { supabase } from '@/integrations/supabase/client';
import { getPieces, getInspirations, getLinks, savePieces, saveInspirations } from '@/lib/storage';
import { Piece, Inspiration } from '@/types';

export async function migratePiecesToSupabase(): Promise<void> {
  const localPieces = getPieces();
  const piecesToMigrate = localPieces.filter(piece => !piece.remote_id);
  
  if (piecesToMigrate.length === 0) {
    console.log('No pieces to migrate');
    return;
  }

  console.log(`Migrating ${piecesToMigrate.length} pieces to Supabase`);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const updatedPieces = [...localPieces];
  
  for (const piece of piecesToMigrate) {
    try {
      // TODO: Upload photos and get remote URLs
      // For now, we'll keep the local photo URLs
      
      const pieceData = {
        title: piece.title,
        description: piece.description,
        photos: piece.photos || [],
        current_stage: piece.current_stage,
        clay_type: piece.clay_type,
        clay_subtype: piece.clay_body_details,
        size_category: undefined, // Not in current schema
        storage_location: piece.storage_location,
        notes: piece.notes,
        tags: piece.tags || [],
        technique_notes: piece.technique_notes,
        next_step: piece.next_step,
        start_date: piece.start_date,
        next_reminder_at: piece.next_reminder_at,
        stage_history: piece.stage_history as any || [],
        history: piece.history as any || [],
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('pieces')
        .insert(pieceData)
        .select()
        .single();

      if (error) throw error;

      // Update local piece with remote_id
      const index = updatedPieces.findIndex(p => p.id === piece.id);
      if (index !== -1) {
        updatedPieces[index] = {
          ...updatedPieces[index],
          remote_id: data.id,
        };
      }

      console.log(`Migrated piece: ${piece.title}`);
    } catch (error) {
      console.error(`Failed to migrate piece ${piece.title}:`, error);
      // Continue with other pieces
    }
  }
  
  // Save updated pieces back to localStorage
  savePieces(updatedPieces);
}

export async function migrateInspirationsToSupabase(): Promise<void> {
  const localInspirations = getInspirations();
  const inspirationsToMigrate = localInspirations.filter(inspiration => !inspiration.remote_id);
  
  if (inspirationsToMigrate.length === 0) {
    console.log('No inspirations to migrate');
    return;
  }

  console.log(`Migrating ${inspirationsToMigrate.length} inspirations to Supabase`);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const updatedInspirations = [...localInspirations];
  
  for (const inspiration of inspirationsToMigrate) {
    try {
      // TODO: Upload photos and get remote URLs
      // For now, we'll keep the local photo URLs
      
      const inspirationData = {
        image_url: inspiration.image_url,
        photos: inspiration.photos || [],
        link_url: inspiration.link_url,
        note: inspiration.note,
        tags: inspiration.tags || [],
        linked_piece_id: inspiration.linked_piece_id,
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('inspirations')
        .insert(inspirationData)
        .select()
        .single();

      if (error) throw error;

      // Update local inspiration with remote_id
      const index = updatedInspirations.findIndex(i => i.id === inspiration.id);
      if (index !== -1) {
        updatedInspirations[index] = {
          ...updatedInspirations[index],
          remote_id: data.id,
        };
      }

      console.log(`Migrated inspiration: ${inspiration.id}`);
    } catch (error) {
      console.error(`Failed to migrate inspiration ${inspiration.id}:`, error);
      // Continue with other inspirations
    }
  }
  
  // Save updated inspirations back to localStorage
  saveInspirations(updatedInspirations);
}

export async function migrateLinksToSupabase(): Promise<void> {
  const localLinks = getLinks();
  
  if (localLinks.length === 0) {
    console.log('No links to migrate');
    return;
  }

  console.log(`Migrating ${localLinks.length} links to Supabase`);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  // Get updated pieces and inspirations to map local IDs to remote IDs
  const pieces = getPieces();
  const inspirations = getInspirations();
  
  const pieceIdMap = new Map();
  const inspirationIdMap = new Map();
  
  pieces.forEach(piece => {
    if (piece.remote_id) {
      pieceIdMap.set(piece.id, piece.remote_id);
    }
  });
  
  inspirations.forEach(inspiration => {
    if (inspiration.remote_id) {
      inspirationIdMap.set(inspiration.id, inspiration.remote_id);
    }
  });

  for (const link of localLinks) {
    try {
      const remotePieceId = pieceIdMap.get(link.piece_id);
      const remoteInspirationId = inspirationIdMap.get(link.inspiration_id);
      
      if (!remotePieceId || !remoteInspirationId) {
        console.warn(`Skipping link: missing remote IDs for piece ${link.piece_id} or inspiration ${link.inspiration_id}`);
        continue;
      }

      const { error } = await supabase
        .from('piece_inspiration_links')
        .upsert({
          piece_id: remotePieceId,
          inspiration_id: remoteInspirationId,
          user_id: session.user.id,
        }, {
          onConflict: 'piece_id,inspiration_id',
          ignoreDuplicates: true
        });

      if (error) throw error;

      console.log(`Migrated link: ${link.piece_id} -> ${link.inspiration_id}`);
    } catch (error) {
      console.error(`Failed to migrate link ${link.piece_id} -> ${link.inspiration_id}:`, error);
      // Continue with other links
    }
  }
}
