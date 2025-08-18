import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Bell, LogOut, Camera, User, Crown, ExternalLink, RotateCcw, Mail, Star, MessageSquare } from "lucide-react";
import { subscriptionService, type SubscriptionData } from "@/services/subscriptionService";
import SubscriptionBottomSheet from "./SubscriptionBottomSheet";

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

interface ExtendedProfileData extends ProfileData {
  subscription: SubscriptionData;
}

export default function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const [profile, setProfile] = useState<ExtendedProfileData>({
    display_name: "",
    address: "",
    notifications_enabled: true,
    subscription: { plan: 'free', subscriptionStatus: 'expired' },
  });
  const [originalProfile, setOriginalProfile] = useState<ExtendedProfileData>({
    display_name: "",
    address: "",
    notifications_enabled: true,
    subscription: { plan: 'free', subscriptionStatus: 'expired' },
  });
  const [user, setUser] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [displayNameError, setDisplayNameError] = useState("");
  const [subscriptionBottomSheetOpen, setSubscriptionBottomSheetOpen] = useState(false);
  const [isLoadingRestore, setIsLoadingRestore] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUserData();
    }
  }, [open]);

  useEffect(() => {
    const profileHasChanges = 
      profile.display_name !== originalProfile.display_name ||
      profile.address !== originalProfile.address ||
      profile.notifications_enabled !== originalProfile.notifications_enabled;
    setHasChanges(profileHasChanges);
  }, [profile, originalProfile]);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);

        // Load subscription data
        const subscriptionData = await subscriptionService.loadUserSubscription();

        // Try to get existing profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, address, notifications_enabled, plan, store, original_transaction_id, latest_expiration_at, subscription_status")
          .eq("user_id", session.user.id)
          .single();

        const userProfile = {
          display_name: existingProfile?.display_name || 
            session.user.email?.split("@")[0] || 
            "",
          address: existingProfile?.address || "",
          notifications_enabled: existingProfile?.notifications_enabled ?? true,
          avatar_url: existingProfile?.avatar_url,
          subscription: subscriptionData,
        };

        setProfile(userProfile);
        setOriginalProfile(userProfile);
      } else {
        // Guest user - load from localStorage
        const guestProfile = {
          display_name: localStorage.getItem("guest_display_name") || "",
          address: localStorage.getItem("guest_address") || "",
          notifications_enabled: localStorage.getItem("guest_notifications") === "true",
          subscription: { plan: 'free' as const, subscriptionStatus: 'expired' as const },
        };
        setProfile(guestProfile);
        setOriginalProfile(guestProfile);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
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

  const handleSave = async () => {
    if (!validateDisplayName(profile.display_name)) {
      return;
    }

    try {
      if (user) {
        // Authenticated user - save to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("profiles")
          .upsert({
            user_id: session.user.id,
            display_name: profile.display_name.trim(),
            address: profile.address,
            notifications_enabled: profile.notifications_enabled,
          });

        if (error) throw error;
      } else {
        // Guest user - save to localStorage
        localStorage.setItem("guest_display_name", profile.display_name.trim());
        localStorage.setItem("guest_address", profile.address);
        localStorage.setItem("guest_notifications", profile.notifications_enabled.toString());
      }

      setOriginalProfile({ ...profile });
      toast({
        title: "Saved",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear localStorage on sign out
      localStorage.removeItem("userData");
      localStorage.removeItem("guest_display_name");
      localStorage.removeItem("guest_address");
      localStorage.removeItem("guest_notifications");
      
      onOpenChange(false);
      
      // Navigate to onboarding or welcome screen
      window.location.href = "/onboarding";
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestorePurchases = async () => {
    if (!subscriptionService.isIOS()) {
      toast({
        title: "Restore Available on iOS App",
        description: "Purchase restoration is only available in the iOS version of this app.",
      });
      return;
    }

    setIsLoadingRestore(true);
    
    try {
      const restored = await subscriptionService.restorePurchases();
      
      if (restored) {
        const updatedSubscription = await subscriptionService.loadUserSubscription();
        setProfile(prev => ({ ...prev, subscription: updatedSubscription }));
        toast({
          title: "Purchases restored! 🎉",
          description: "Your Maker Pro subscription has been restored.",
        });
      } else {
        toast({
          title: "No active purchases found",
          description: "We couldn't find any active subscriptions to restore.",
        });
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Restore failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRestore(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscriptionService.isIOS()) {
      toast({
        title: "Manage Subscription on iOS App",
        description: "Subscription management is only available in the iOS version of this app.",
      });
      return;
    }

    try {
      await subscriptionService.openManageSubscription();
    } catch (error) {
      console.error('Manage subscription error:', error);
      toast({
        title: "Unable to open subscription management",
        description: "Please try again or manage through iOS Settings.",
        variant: "destructive",
      });
    }
  };

  const handleSubscriptionChange = async () => {
    // Refresh subscription data after purchase
    const updatedSubscription = await subscriptionService.loadUserSubscription();
    setProfile(prev => ({ ...prev, subscription: updatedSubscription }));
  };

  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return null;
    }
  };

  const isFormValid = profile.display_name.trim().length >= 2 && !displayNameError;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto" aria-label="Account">
        <SheetHeader className="mb-6">
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>
            Manage your profile, subscription, and preferences
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <h3 className="font-medium">Profile</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.display_name.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name *</Label>
              <Input
                id="display-name"
                value={profile.display_name}
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, display_name: e.target.value }));
                  validateDisplayName(e.target.value);
                }}
                placeholder="Enter your name"
                autoFocus
              />
              {displayNameError && (
                <p className="text-sm text-destructive">{displayNameError}</p>
              )}
            </div>

            {user && (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email || ""} disabled className="bg-muted" />
              </div>
            )}

            <Button 
              onClick={handleSave}
              disabled={!hasChanges || !isFormValid}
            >
              Save
            </Button>
          </div>

          <Separator />

          {/* Contact Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <h3 className="font-medium">Contact</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Subscription Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <h3 className="font-medium">Subscription</h3>
            </div>
            
            {profile.subscription.plan === 'pro' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-primary">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                    <span className="text-sm font-medium">Maker Pro is active</span>
                  </div>
                </div>
                
                {profile.subscription.latestExpirationAt && (
                  <p className="text-xs text-muted-foreground px-3">
                    Renews on {formatExpirationDate(profile.subscription.latestExpirationAt)}
                  </p>
                )}
              </div>
            ) : (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setSubscriptionBottomSheetOpen(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                Go Pro
              </Button>
            )}

            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={handleRestorePurchases}
                disabled={isLoadingRestore}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isLoadingRestore ? "Restoring..." : "Restore Purchases"}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={handleManageSubscription}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </div>

          <Separator />

          {/* Preferences Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <h3 className="font-medium">Preferences</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch
                id="notifications"
                checked={profile.notifications_enabled}
                onCheckedChange={(checked) => 
                  setProfile(prev => ({ ...prev, notifications_enabled: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Contact the Developers Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <h3 className="font-medium">Contact the Developers</h3>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => {
                  const subject = encodeURIComponent("Feedback");
                  const body = encodeURIComponent("Hi team,\n\nI'd like to share some feedback:\n\n");
                  window.location.href = `mailto:HelloPotteryPal@gmail.com?subject=${subject}&body=${body}`;
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email us
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={async () => {
                  if (subscriptionService.isIOS()) {
                    try {
                      // Try iOS in-app review first
                      if ((window as any).StoreKit) {
                        await (window as any).StoreKit.requestReview();
                      } else {
                        // Fallback to App Store URL
                        window.open("https://apps.apple.com/app/idYOUR_APP_ID?action=write-review", "_blank");
                      }
                    } catch (error) {
                      // Fallback to App Store URL
                      window.open("https://apps.apple.com/app/idYOUR_APP_ID?action=write-review", "_blank");
                    }
                  } else {
                    // Web fallback
                    window.open("https://apps.apple.com/app/idYOUR_APP_ID?action=write-review", "_blank");
                  }
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
              </Button>
            </div>
          </div>

          {user && (
            <>
              <Separator />
              
              {/* Danger Zone */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <h3 className="font-medium">Account</h3>
                </div>
                
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
      
      <SubscriptionBottomSheet
        open={subscriptionBottomSheetOpen}
        onOpenChange={setSubscriptionBottomSheetOpen}
        onSubscriptionChange={handleSubscriptionChange}
      />
    </Sheet>
  );
}