import { useState } from "react";
import { NavLink } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Unable to send password reset email");
    } else {
      setSent(true);
      toast.success("Password reset email sent");
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen p-4">
        <SEO title="Password Reset Sent — Pottery Tracker" description="Check your email for password reset instructions." />
        <div className="max-w-md mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>. 
                Please check your email and follow the link to reset your password.
              </p>
              <NavLink to="/auth">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </NavLink>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <SEO title="Forgot Password — Pottery Tracker" description="Reset your password to regain access to your account." />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email to receive reset instructions</p>
      </header>

      <section className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email address"
                  required 
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Instructions"}
              </Button>
              <NavLink to="/auth">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </NavLink>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default ForgotPassword;