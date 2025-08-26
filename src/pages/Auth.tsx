import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpDisplayName, setSignUpDisplayName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

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

  const getErrorMessage = (error: any) => {
    switch (error?.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials.';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'User already registered':
        return 'An account with this email already exists. Try signing in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Invalid email':
        return 'Please enter a valid email address.';
      default:
        return error?.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    
    setLoading(false);
    
    if (error) {
      setError(getErrorMessage(error));
    } else {
      toast.success("Signed in successfully");
      navigate("/", { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!signUpDisplayName.trim()) {
      setError('Display name is required.');
      setLoading(false);
      return;
    }
    
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: { 
        emailRedirectTo: redirectUrl,
        data: {
          display_name: signUpDisplayName.trim()
        }
      },
    });
    
    setLoading(false);
    
    if (error) {
      setError(getErrorMessage(error));
    } else {
      setShowVerificationMessage(true);
      toast.success("Check your email to confirm your account");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    
    setLoading(false);
    
    if (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleGuestSave = async () => {
    const trimmed = guestName.trim();
    if (!trimmed) return;
    
    try {
      localStorage.setItem("pt_guest_name", trimmed);
      localStorage.removeItem("pt_onboarding_skipped");
    } catch {
      // Handle localStorage errors gracefully
    }
    
    navigate("/", { replace: true });
  };

  if (showVerificationMessage) {
    return (
      <main className="min-h-screen p-4">
        <SEO title="Check Your Email — Pottery Tracker" description="Please check your email to verify your account." />
        <div className="max-w-md mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent you a confirmation email at <strong>{signUpEmail}</strong>. 
                Please click the link in the email to verify your account.
              </p>
              <Button variant="outline" onClick={() => setShowVerificationMessage(false)}>
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <SEO title="Sign in or Create Account — Pottery Tracker" description="Sign in or create an account to sync your pottery data." />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account or create a new one</p>
      </header>

      <section className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4 space-y-4">
                <form className="grid gap-3" onSubmit={handleSignIn}>
                  <div className="grid gap-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input 
                      id="si-email" 
                      type="email" 
                      value={signInEmail} 
                      onChange={(e) => setSignInEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="si-password">Password</Label>
                    <Input 
                      id="si-password" 
                      type="password" 
                      value={signInPassword} 
                      onChange={(e) => setSignInPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                  <div className="text-center">
                    <NavLink 
                      to="/forgot-password" 
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Forgot password?
                    </NavLink>
                  </div>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                  className="w-full"
                >
                  Continue with Google
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="mt-4 space-y-4">
                <form className="grid gap-3" onSubmit={handleSignUp}>
                  <div className="grid gap-2">
                    <Label htmlFor="su-display-name">Display Name</Label>
                    <Input 
                      id="su-display-name" 
                      type="text" 
                      value={signUpDisplayName} 
                      onChange={(e) => setSignUpDisplayName(e.target.value)} 
                      placeholder="How should we address you?" 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input 
                      id="su-email" 
                      type="email" 
                      value={signUpEmail} 
                      onChange={(e) => setSignUpEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input 
                      id="su-password" 
                      type="password" 
                      value={signUpPassword} 
                      onChange={(e) => setSignUpPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                  className="w-full"
                >
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Or use as a guest</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Tell us how we should address you:</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleGuestSave} 
              disabled={!guestName.trim()}
              className="w-full"
            >
              Continue as guest
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Guest mode has limited features. Your work is stored locally. Create an account to sync across devices.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Auth;
