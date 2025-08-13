import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Unable to sign in");
    } else {
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Unable to sign up");
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  return (
    <main className="min-h-screen p-4">
      <SEO title="Sign in or Create Account — Pottery Tracker" description="Sign in or create an account to sync your pottery data." />
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in or Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Use email and password. You can switch tabs below.</p>
      </header>

      <section>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form className="grid gap-3" onSubmit={handleSignIn}>
                  <div className="grid gap-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="si-password">Password</Label>
                    <Input id="si-password" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={loading} className="mt-2">Sign in</Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form className="grid gap-3" onSubmit={handleSignUp}>
                  <div className="grid gap-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input id="su-password" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" disabled={loading} className="mt-2">Create account</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Auth;
