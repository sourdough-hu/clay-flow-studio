import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SupabaseSessionSync = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const display_name =
          (session.user.user_metadata as any)?.display_name ||
          (session.user.user_metadata as any)?.name ||
          session.user.email?.split("@")[0] ||
          "User";
        try {
          localStorage.setItem(
            "pt_user",
            JSON.stringify({ display_name, email: session.user.email ?? undefined })
          );
        } catch {}
      } else {
        try {
          localStorage.removeItem("pt_user");
        } catch {}
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const display_name =
          (session.user.user_metadata as any)?.display_name ||
          (session.user.user_metadata as any)?.name ||
          session.user.email?.split("@")[0] ||
          "User";
        try {
          localStorage.setItem(
            "pt_user",
            JSON.stringify({ display_name, email: session.user.email ?? undefined })
          );
        } catch {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
};

export default SupabaseSessionSync;
