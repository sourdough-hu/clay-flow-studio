import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" });
      return;
    }
    try {
      localStorage.removeItem("pt_user");
    } catch {}
    toast({ title: "Signed out" });
    navigate("/auth", { replace: true });
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Account" description="Manage your account and preferences." />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Account</h1>
      </header>
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">Profile settings and preferences will appear here.</p>
        <Button variant="secondary" onClick={handleSignOut}>Sign out</Button>
      </section>
    </main>
  );
};

export default Account;
