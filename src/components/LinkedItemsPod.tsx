import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Piece, Inspiration } from '@/types';
import { getPieces, getInspirations } from '@/lib/storage';
import { getInspirationsForPiece, getPiecesForInspiration } from '@/lib/supabase-links';

interface LinkedItemsPodProps {
  mode: 'pieces' | 'inspirations';
  itemId: string;
  isEditing?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

const LinkedItemsPod: React.FC<LinkedItemsPodProps> = ({
  mode,
  itemId,
  isEditing = false,
  selectedIds = new Set(),
  onToggleSelection,
}) => {
  const { isAuthenticated } = useAuth();
  const [linkedItems, setLinkedItems] = useState<(Piece | Inspiration)[]>([]);
  const [allItems, setAllItems] = useState<(Piece | Inspiration)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load linked items
  useEffect(() => {
    const loadLinkedItems = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        if (mode === 'pieces') {
          const pieces = await getPiecesForInspiration(itemId);
          setLinkedItems(pieces);
        } else {
          const inspirations = await getInspirationsForPiece(itemId);
          setLinkedItems(inspirations);
        }
      } catch (error) {
        console.error('Failed to load linked items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLinkedItems();
  }, [mode, itemId, isAuthenticated]);

  // Load all items for selection (when editing)
  useEffect(() => {
    if (isEditing && isAuthenticated) {
      const items = mode === 'pieces' ? getPieces() : getInspirations();
      setAllItems(items);
    }
  }, [isEditing, isAuthenticated, mode]);

  const handleSignInClick = () => {
    window.location.href = '/auth';
  };

  const title = mode === 'pieces' ? 'Linked Pieces' : 'Inspirations';

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Link pieces with inspirations and sync across devices.
            </p>
            <Button onClick={handleSignInClick} variant="hero">
              Sign in to enable linking
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select {title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {allItems.map((item) => (
              <label key={item.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => onToggleSelection?.(item.id)}
                />
                <span className="flex-1">{item.title || 'Untitled'}</span>
                {mode === 'pieces' && 'current_stage' in item && (
                  <span className="text-muted-foreground">
                    — {item.current_stage.replace('_', ' ')}
                  </span>
                )}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : linkedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No linked {mode} yet.
          </p>
        ) : (
          <div className="space-y-2">
            {linkedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <Link
                    to={mode === 'pieces' ? `/piece/${item.id}` : `/inspiration/${item.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {item.title || 'Untitled'}
                  </Link>
                  {mode === 'pieces' && 'current_stage' in item && (
                    <p className="text-xs text-muted-foreground">
                      {item.current_stage.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkedItemsPod;