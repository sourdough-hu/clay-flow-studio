import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetupModal } from "@/components/ProfileSetupModal";

const SupabaseSessionSync = () => {
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const migrateGuestData = async (userId: string) => {
      try {
        // Check if user has guest data to migrate
        const guestName = localStorage.getItem("pt_guest_name");
        
        if (guestName) {
          // Update profile with guest name if profile is empty
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", userId)
            .single();
          
          if (!existingProfile?.display_name) {
            await supabase
              .from("profiles")
              .upsert({ 
                user_id: userId, 
                display_name: guestName 
              });
          }
        }
        
        // TODO: Migrate local pieces and inspirations data to Supabase
        // This would involve reading from localStorage and inserting into respective tables
        
        // Clean up guest data
        localStorage.removeItem("pt_guest_name");
        localStorage.removeItem("pt_onboarding_skipped");
      } catch (error) {
        console.error("Failed to migrate guest data:", error);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Migrate guest data on sign in
        if (event === 'SIGNED_IN') {
          await migrateGuestData(session.user.id);
        }
        
        // Check if user needs profile setup
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", session.user.id)
          .single();
        
        const display_name = profile?.display_name || 
          (session.user.user_metadata as any)?.display_name ||
          (session.user.user_metadata as any)?.name ||
          "";

        if (!display_name.trim()) {
          setUserId(session.user.id);
          setShowProfileSetup(true);
        } else {
          // Update localStorage with profile data
          try {
            localStorage.setItem(
              "pt_user",
              JSON.stringify({ 
                display_name, 
                email: session.user.email ?? undefined,
                avatar_url: profile?.avatar_url ?? undefined
              })
            );
          } catch {}
        }
      } else {
        try {
          localStorage.removeItem("pt_user");
        } catch {}
        setShowProfileSetup(false);
        setUserId(null);
      }
    });

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", session.user.id)
          .single();
        
        const display_name = profile?.display_name || 
          (session.user.user_metadata as any)?.display_name ||
          (session.user.user_metadata as any)?.name ||
          "";

        if (!display_name.trim()) {
          setUserId(session.user.id);
          setShowProfileSetup(true);
        } else {
          try {
            localStorage.setItem(
              "pt_user",
              JSON.stringify({ 
                display_name, 
                email: session.user.email ?? undefined,
                avatar_url: profile?.avatar_url ?? undefined
              })
            );
          } catch {}
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleProfileSetupComplete = async () => {
    setShowProfileSetup(false);
    
    // Refresh user data in localStorage
    if (userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile?.display_name) {
          try {
            localStorage.setItem(
              "pt_user",
              JSON.stringify({ 
                display_name: profile.display_name, 
                email: session.user.email ?? undefined,
                avatar_url: profile.avatar_url ?? undefined
              })
            );
          } catch {}
        }
      }
    }
  };

  return (
    <>
      {showProfileSetup && userId && (
        <ProfileSetupModal
          open={showProfileSetup}
          onComplete={handleProfileSetupComplete}
          userId={userId}
        />
      )}
    </>
  );
};

export default SupabaseSessionSync;
