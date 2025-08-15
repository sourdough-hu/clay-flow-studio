import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

export const ProfileSetupModal = ({ open, onComplete, userId }: ProfileSetupModalProps) => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Display name is required");
      return;
    }
    
    if (trimmed.length < 2 || trimmed.length > 40) {
      setError("Display name must be between 2-40 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, display_name: trimmed });

      if (profileError) throw profileError;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: trimmed }
      });

      if (authError) throw authError;

      toast.success("Profile setup complete!");
      onComplete();
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose how we should address you throughout the app.
          </p>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we address you?"
                maxLength={40}
                required
              />
            </div>
            <Button type="submit" disabled={loading || !displayName.trim()} className="w-full">
              {loading ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetupModal;