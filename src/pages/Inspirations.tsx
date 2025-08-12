import { getInspirations } from "@/lib/storage";
import { SEO } from "@/components/SEO";
import GreetingHeader from "@/components/GreetingHeader";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Inspirations = () => {
  const items = getInspirations();
  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Inspirations" description="Browse your inspiration library." />
      <header className="pb-2">
        <GreetingHeader title="Inspirations" />
      </header>
      <div className="flex items-center justify-end">
        <Link to="/new/inspiration" className="text-sm underline underline-offset-4 text-primary">New</Link>
      </div>


      <section className="space-y-3 pb-8">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inspirations yet.</p>
        ) : (
          items.map((ins) => (
            <Card key={ins.id}>
              <CardHeader>
                <CardTitle className="text-base">{ins.note?.slice(0, 60) || "Untitled"}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground space-y-2">
                {ins.image_url && (
                  <img src={ins.image_url} alt="Pottery inspiration image" loading="lazy" className="w-full rounded-md border" />
                )}
                {ins.link_url && (
                  <a href={ins.link_url} target="_blank" rel="noreferrer" className="underline underline-offset-4 text-primary">Open link</a>
                )}
                {ins.tags && ins.tags.length > 0 && (
                  <div>Tags: <span className="text-foreground font-medium">{ins.tags.join(", ")}</span></div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
};

export default Inspirations;
