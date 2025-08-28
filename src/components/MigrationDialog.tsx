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
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { migratePiecesToSupabase, migrateInspirationsToSupabase, migrateLinksToSupabase } from '@/lib/migration';
import { getPieces, getInspirations } from '@/lib/storage';

interface MigrationDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type MigrationState = 'idle' | 'migrating' | 'success' | 'error';

const MigrationDialog: React.FC<MigrationDialogProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [migrationState, setMigrationState] = useState<MigrationState>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getTotalItems = () => {
    const pieces = getPieces().filter(p => !p.remote_id);
    const inspirations = getInspirations().filter(i => !i.remote_id);
    return pieces.length + inspirations.length;
  };

  const handleMigrate = async () => {
    const totalItems = getTotalItems();
    
    if (totalItems === 0) {
      toast({
        title: "Nothing to migrate",
        description: "All your items are already synced to your account.",
      });
      handleComplete();
      return;
    }

    setMigrationState('migrating');
    setProgress(0);
    setError(null);
    
    try {
      console.log('Starting migration process...');
      
      const pieces = getPieces().filter(p => !p.remote_id);
      const inspirations = getInspirations().filter(i => !i.remote_id);
      const totalSteps = pieces.length + inspirations.length + 1; // +1 for links
      let completedSteps = 0;
      
      // Step 1: Migrate pieces
      setCurrentStep('Migrating pieces...');
      await migratePiecesToSupabase((current, total, status) => {
        completedSteps = current;
        const progressPercent = Math.round((completedSteps / totalSteps) * 100);
        setProgress(progressPercent);
        setCurrentStep(status);
      });
      
      // Step 2: Migrate inspirations
      setCurrentStep('Migrating inspirations...');
      await migrateInspirationsToSupabase((current, total, status) => {
        completedSteps = pieces.length + current;
        const progressPercent = Math.round((completedSteps / totalSteps) * 100);
        setProgress(progressPercent);
        setCurrentStep(status);
      });
      
      // Step 3: Migrate links
      setCurrentStep('Linking inspirations to pieces...');
      await migrateLinksToSupabase();
      setProgress(100);
      
      console.log('Migration completed successfully');
      
      setMigrationState('success');
      setCurrentStep('Migration complete!');
      
      toast({
        title: "Migration complete",
        description: "Your pieces and inspirations are now saved to your account and available across devices.",
      });
      
      // Auto-close after showing success state briefly
      setTimeout(() => {
        handleComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationState('error');
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      toast({
        title: "Migration failed",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setMigrationState('idle');
    setProgress(0);
    setCurrentStep('');
    setError(null);
  };

  const handleSkip = () => {
    // Store that migration was skipped so we can offer it again later
    localStorage.setItem('migration_skipped', 'true');
    onClose();
    onComplete();
  };

  const handleComplete = () => {
    // Clear any migration skip flag
    localStorage.removeItem('migration_skipped');
    onComplete();
    onClose();
  };

  const renderContent = () => {
    const totalItems = getTotalItems();

    switch (migrationState) {
      case 'migrating':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Migrating your creations
              </DialogTitle>
              <DialogDescription>
                Please don't close this window while we sync your data to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentStep}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Migration successful!
              </DialogTitle>
              <DialogDescription>
                Your {totalItems} items have been synced to your account and are now available across all devices.
              </DialogDescription>
            </DialogHeader>
          </>
        );

      case 'error':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Migration failed
              </DialogTitle>
              <DialogDescription>
                We couldn't sync your data to your account. Your items remain safely stored on this device.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button onClick={handleRetry}>
                Try again
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Migrate your creations?</DialogTitle>
              <DialogDescription>
                We found {totalItems} items saved on this device. Do you want to migrate them to your account so you can access them on any device?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleMigrate}>
                Migrate {totalItems} items
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  // Don't show footer for migrating and success states (they handle their own)
  const showDefaultFooter = migrationState === 'idle';

  return (
    <Dialog open={open} onOpenChange={migrationState === 'migrating' ? undefined : onClose}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;