import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { migratePiecesToSupabase, migrateInspirationsToSupabase } from '@/lib/migration';

interface MigrationDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const MigrationDialog: React.FC<MigrationDialogProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrate = async () => {
    setIsMigrating(true);
    
    try {
      // Run migrations sequentially
      await migratePiecesToSupabase();
      await migrateInspirationsToSupabase();
      
      toast({
        title: "Migration complete",
        description: "Your creations are now saved to your account.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration partially failed",
        description: "Your account was created, but we couldn't sync some items. They remain on this device, and we'll retry automatically.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Migrate your creations?</DialogTitle>
          <DialogDescription>
            We found pieces and inspirations saved on this device. Do you want to migrate them into your new account so you can access them on any device?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleSkip} disabled={isMigrating}>
            Skip
          </Button>
          <Button onClick={handleMigrate} disabled={isMigrating}>
            {isMigrating ? 'Migrating...' : 'Migrate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;