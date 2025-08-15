import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth", { replace: true });
        return;
      }
      
      setUser(session.user);
      setEmailVerified(!!session.user.email_confirmed_at);
      
      // Load profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || "");
      }
    };
    
    loadUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Sign out failed: " + error.message);
      return;
    }
    
    // Clear local storage
    try {
      localStorage.removeItem("pt_user");
      localStorage.removeItem("pt_guest_name");
    } catch {}
    
    toast.success("Signed out successfully");
    navigate("/auth", { replace: true });
  };

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) return;
    
    if (displayName.trim().length < 2 || displayName.trim().length > 40) {
      setError("Display name must be between 2-40 characters");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ 
          user_id: user.id, 
          display_name: displayName.trim() 
        });
      
      if (profileError) throw profileError;
      
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      });
      
      if (authError) throw authError;
      
      setProfile(prev => prev ? { ...prev, display_name: displayName.trim() } : null);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      // Delete existing avatar if it exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }
      
      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          user_id: user.id, 
          avatar_url: data.publicUrl 
        });
      
      if (updateError) throw updateError;
      
      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      toast.success("Avatar updated successfully");
    } catch (error: any) {
      toast.error("Failed to upload avatar: " + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (error: any) {
      setError(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    
    if (error) {
      toast.error("Failed to resend verification email");
    } else {
      toast.success("Verification email sent");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const avatarUrl = profile?.avatar_url;
  const displayNameValue = profile?.display_name || user.email?.split('@')[0] || 'User';

  return (
    <main className="min-h-screen p-4 space-y-6">
      <SEO title="Account Settings — Pottery Tracker" description="Manage your account settings and preferences." />
      
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </header>

      {!emailVerified && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Please verify your email address to secure your account.</span>
            <Button variant="outline" size="sm" onClick={handleResendVerification}>
              Resend Link
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || undefined} alt="Profile avatar" />
                <AvatarFallback className="text-lg">
                  {displayNameValue.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                </Button>
                <p className="text-xs text-muted-foreground">Max 2MB, JPG or PNG</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we address you?"
                  maxLength={40}
                />
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={loading || !displayName.trim() || displayName.trim() === profile?.display_name}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2">
                <Input value={user.email || ""} disabled />
                {emailVerified ? (
                  <Badge variant="secondary">Verified</Badge>
                ) : (
                  <Badge variant="destructive">Unverified</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        {user.app_metadata.provider === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={loading || !newPassword || !confirmPassword}
                  variant="outline"
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
              Sign Out
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
              <p className="text-xs text-muted-foreground">
                Account deletion is not yet available. Please contact support if needed.
              </p>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Account;
