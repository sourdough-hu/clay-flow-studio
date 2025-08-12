import { SEO } from "@/components/SEO";

const Tasks = () => {
  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Tasks" description="View and manage your pottery tasks." />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tasks</h1>
      </header>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Task list coming soon.</p>
      </section>
    </main>
  );
};

export default Tasks;
