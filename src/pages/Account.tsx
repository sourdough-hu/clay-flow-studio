import { SEO } from "@/components/SEO";

const Account = () => {
  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Account" description="Manage your account and preferences." />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Account</h1>
      </header>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Profile settings and preferences will appear here.</p>
      </section>
    </main>
  );
};

export default Account;
