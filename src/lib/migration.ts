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
  
  // Ensure we have a valid session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error('Failed to get user session');
  }
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated. Please sign in and try again.');
  }

  const updatedPieces = [...localPieces];
  let migratedCount = 0;
  const errors: string[] = [];
  
  for (const piece of piecesToMigrate) {
    try {
      console.log(`Migrating piece: ${piece.title}`);
      
      const pieceData = {
        title: piece.title,
        description: piece.description,
        photos: piece.photos || [],
        current_stage: piece.current_stage,
        clay_type: piece.clay_type,
        clay_subtype: piece.clay_body_details,
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

      if (error) {
        console.error(`Supabase error for piece ${piece.title}:`, error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data?.id) {
        throw new Error('No data returned from insertion');
      }

      // Update local piece with remote_id
      const index = updatedPieces.findIndex(p => p.id === piece.id);
      if (index !== -1) {
        updatedPieces[index] = {
          ...updatedPieces[index],
          remote_id: data.id,
        };
      }

      migratedCount++;
      console.log(`Successfully migrated piece: ${piece.title} (${migratedCount}/${piecesToMigrate.length})`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to migrate piece ${piece.title}:`, errorMessage);
      errors.push(`${piece.title}: ${errorMessage}`);
    }
  }
  
  // Save updated pieces back to localStorage
  savePieces(updatedPieces);
  
  // Report results
  console.log(`Migration complete: ${migratedCount}/${piecesToMigrate.length} pieces migrated`);
  if (errors.length > 0) {
    console.warn('Some pieces failed to migrate:', errors);
    if (migratedCount === 0) {
      throw new Error(`Failed to migrate any pieces. First error: ${errors[0]}`);
    }
  }
}

export async function migrateInspirationsToSupabase(): Promise<void> {
  const localInspirations = getInspirations();
  const inspirationsToMigrate = localInspirations.filter(inspiration => !inspiration.remote_id);
  
  if (inspirationsToMigrate.length === 0) {
    console.log('No inspirations to migrate');
    return;
  }

  console.log(`Migrating ${inspirationsToMigrate.length} inspirations to Supabase`);
  
  // Ensure we have a valid session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error('Failed to get user session');
  }
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated. Please sign in and try again.');
  }

  const updatedInspirations = [...localInspirations];
  let migratedCount = 0;
  const errors: string[] = [];
  
  for (const inspiration of inspirationsToMigrate) {
    try {
      console.log(`Migrating inspiration: ${inspiration.id}`);
      
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

      if (error) {
        console.error(`Supabase error for inspiration ${inspiration.id}:`, error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data?.id) {
        throw new Error('No data returned from insertion');
      }

      // Update local inspiration with remote_id
      const index = updatedInspirations.findIndex(i => i.id === inspiration.id);
      if (index !== -1) {
        updatedInspirations[index] = {
          ...updatedInspirations[index],
          remote_id: data.id,
        };
      }

      migratedCount++;
      console.log(`Successfully migrated inspiration: ${inspiration.id} (${migratedCount}/${inspirationsToMigrate.length})`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to migrate inspiration ${inspiration.id}:`, errorMessage);
      errors.push(`${inspiration.id}: ${errorMessage}`);
    }
  }
  
  // Save updated inspirations back to localStorage
  saveInspirations(updatedInspirations);
  
  // Report results
  console.log(`Migration complete: ${migratedCount}/${inspirationsToMigrate.length} inspirations migrated`);
  if (errors.length > 0) {
    console.warn('Some inspirations failed to migrate:', errors);
    if (migratedCount === 0) {
      throw new Error(`Failed to migrate any inspirations. First error: ${errors[0]}`);
    }
  }
}

export async function migrateLinksToSupabase(): Promise<void> {
  const localLinks = getLinks();
  
  if (localLinks.length === 0) {
    console.log('No links to migrate');
    return;
  }

  console.log(`Migrating ${localLinks.length} links to Supabase`);
  
  // Ensure we have a valid session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error('Failed to get user session');
  }
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated. Please sign in and try again.');
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

  let migratedCount = 0;
  const errors: string[] = [];

  for (const link of localLinks) {
    try {
      const remotePieceId = pieceIdMap.get(link.piece_id);
      const remoteInspirationId = inspirationIdMap.get(link.inspiration_id);
      
      if (!remotePieceId || !remoteInspirationId) {
        console.warn(`Skipping link: missing remote IDs for piece ${link.piece_id} or inspiration ${link.inspiration_id}`);
        continue;
      }

      console.log(`Migrating link: ${link.piece_id} -> ${link.inspiration_id}`);

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

      if (error) {
        console.error(`Supabase error for link ${link.piece_id} -> ${link.inspiration_id}:`, error);
        throw new Error(`Database error: ${error.message}`);
      }

      migratedCount++;
      console.log(`Successfully migrated link: ${link.piece_id} -> ${link.inspiration_id} (${migratedCount}/${localLinks.length})`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to migrate link ${link.piece_id} -> ${link.inspiration_id}:`, errorMessage);
      errors.push(`${link.piece_id} -> ${link.inspiration_id}: ${errorMessage}`);
    }
  }
  
  // Report results
  console.log(`Migration complete: ${migratedCount}/${localLinks.length} links migrated`);
  if (errors.length > 0) {
    console.warn('Some links failed to migrate:', errors);
    // Links are less critical, so we don't throw an error here
  }
}
