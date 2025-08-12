import { getInspirations, getPiecesForInspiration } from "@/lib/storage";
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
            <Link to={`/inspiration/${ins.id}`} key={ins.id} className="block">
              <Card>
                {(ins.photos?.[0] || ins.image_url) && (
                  <img src={ins.photos?.[0] ?? ins.image_url!} alt={ins.note ? `${ins.note.slice(0,40)} thumbnail` : "Inspiration thumbnail"} className="w-full aspect-video object-cover rounded-t-lg border-b" />
                )}
                <CardHeader>
                  <CardTitle className="text-base">{ins.note?.slice(0, 60) || "Untitled"}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center justify-between">
                    {ins.link_url && (
                      <span className="underline underline-offset-4 text-primary">Has link</span>
                    )}
                    <span className="text-xs">Linked pieces: <span className="font-medium text-foreground">{getPiecesForInspiration(ins.id).length}</span></span>
                  </div>
                  {ins.tags && ins.tags.length > 0 && (
                    <div>Tags: <span className="text-foreground font-medium">{ins.tags.join(", ")}</span></div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </section>
    </main>
  );
};

export default Inspirations;
