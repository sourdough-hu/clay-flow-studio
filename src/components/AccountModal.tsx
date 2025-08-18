import { useState, useEffect } from "react";
import { X, User, MapPin, CreditCard, Bell, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileData {
  display_name: string;
  address: string;
  notifications_enabled: boolean;
  avatar_url?: string;
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    address: "",
    notifications_enabled: true,
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileData>({
    display_name: "",
    address: "",
    notifications_enabled: true,
  });
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayNameError, setDisplayNameError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadUserData();
    }
  }, [open]);

  useEffect(() => {
    const hasChanges = 
      profile.display_name !== originalProfile.display_name ||
      profile.address !== originalProfile.address ||
      profile.notifications_enabled !== originalProfile.notifications_enabled;
    setIsDirty(hasChanges);
  }, [profile, originalProfile]);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        setEmail(session.user.email || "");
        
        // Try to get existing profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", session.user.id)
          .single();

        const profileData: ProfileData = {
          display_name: existingProfile?.display_name || 
            session.user.email?.split("@")[0] || 
            "",
          address: "", // We'll need to add this field to the profiles table
          notifications_enabled: true, // We'll need to add this field too
          avatar_url: existingProfile?.avatar_url,
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
      } else {
        // Guest user
        setIsAuthenticated(false);
        setEmail("");
        
        const guestName = localStorage.getItem("pt_guest_name") || "";
        const guestAddress = localStorage.getItem("pt_guest_address") || "";
        const guestNotifications = localStorage.getItem("pt_guest_notifications") !== "false";
        
        const guestProfile: ProfileData = {
          display_name: guestName,
          address: guestAddress,
          notifications_enabled: guestNotifications,
        };
        
        setProfile(guestProfile);
        setOriginalProfile(guestProfile);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast({
        title: "Error",
        description: "Failed to load account data",
        variant: "destructive",
      });
    }
  };

  const validateDisplayName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setDisplayNameError("Display name must be at least 2 characters");
      return false;
    }
    setDisplayNameError("");
    return true;
  };

  const handleDisplayNameChange = (value: string) => {
    setProfile(prev => ({ ...prev, display_name: value }));
    validateDisplayName(value);
  };

  const handleSave = async () => {
    if (!validateDisplayName(profile.display_name)) {
      return;
    }

    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Save to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("profiles")
          .upsert({
            user_id: session.user.id,
            display_name: profile.display_name.trim(),
            // We'll add address and notifications_enabled fields later
          });

        if (error) throw error;
      } else {
        // Save guest data to localStorage
        localStorage.setItem("pt_guest_name", profile.display_name.trim());
        localStorage.setItem("pt_guest_address", profile.address);
        localStorage.setItem("pt_guest_notifications", profile.notifications_enabled.toString());
      }

      setOriginalProfile({ ...profile });
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear localStorage
      localStorage.removeItem("pt_guest_name");
      localStorage.removeItem("pt_guest_address");
      localStorage.removeItem("pt_guest_notifications");
      
      onOpenChange(false);
      navigate("/onboarding");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethod = () => {
    // Placeholder for future Stripe integration
    toast({
      title: "Coming Soon",
      description: "Payment method management will be available soon.",
    });
  };

  const isFormValid = profile.display_name.trim().length >= 2 && !displayNameError;
  const canSave = isDirty && isFormValid && !isLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto" aria-label="Account">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle>Account</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="grid gap-6 py-4">
          {/* Profile Section */}
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-medium">Profile</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url} alt="Profile avatar" />
                  <AvatarFallback>{profile.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="h-3 w-3" />
                  Change Photo
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display-name">Display Name *</Label>
                <Input
                  id="display-name"
                  value={profile.display_name}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
                {displayNameError && (
                  <p className="text-sm text-destructive">{displayNameError}</p>
                )}
              </div>

              {isAuthenticated && (
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={email} disabled />
                </div>
              )}

              <Button 
                onClick={handleSave} 
                disabled={!canSave}
                className="w-fit"
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </section>

          {/* Contact Section */}
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <h3 className="text-sm font-medium">Contact</h3>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
                rows={3}
              />
            </div>
          </section>

          {/* Payment Section */}
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <h3 className="text-sm font-medium">Payment</h3>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Payment method</span>
              <Button variant="outline" size="sm" onClick={handlePaymentMethod}>
                Add / Manage
              </Button>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <h3 className="text-sm font-medium">Preferences</h3>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="notifications" className="text-sm font-normal">
                Notifications
              </Label>
              <Switch
                id="notifications"
                checked={profile.notifications_enabled}
                onCheckedChange={(checked) => 
                  setProfile(prev => ({ ...prev, notifications_enabled: checked }))
                }
              />
            </div>
          </section>

          {/* Danger Zone */}
          {isAuthenticated && (
            <section className="grid gap-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <h3 className="text-sm font-medium">Account</h3>
              </div>
              
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-fit gap-2"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}