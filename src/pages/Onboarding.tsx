import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          await (supabase as any).from("profiles").upsert({ id: session.user.id, display_name: trimmed });
        } catch {}
        try {
          await supabase.auth.updateUser({ data: { display_name: trimmed } });
        } catch {}
        try {
          localStorage.setItem(
            "pt_user",
            JSON.stringify({ display_name: trimmed, email: session.user.email ?? undefined })
          );
        } catch {}
      } else {
        localStorage.setItem("pt_guest_name", trimmed);
        localStorage.removeItem("pt_onboarding_skipped");
      }
    } catch {
      try {
        localStorage.setItem("pt_guest_name", trimmed);
        localStorage.removeItem("pt_onboarding_skipped");
      } catch {}
    }
    navigate("/", { replace: true });
  };


  const goAccount = () => {
    navigate("/auth");
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Onboarding" description="Set your name or create an account to personalize your experience." />
      <header className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-sm text-muted-foreground mt-1">Let’s get you set up. You can change this later in Account.</p>
      </header>

      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in or create an account</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button size="lg" onClick={goAccount}>Continue to sign in</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Or use as a guest</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Tell us how we should address you:</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="lg" variant="secondary" onClick={handleSave} disabled={!name.trim()}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Onboarding;
