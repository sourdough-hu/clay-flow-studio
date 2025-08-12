import { getInspirations, getPiecesForInspiration } from "@/lib/storage";
import { SEO } from "@/components/SEO";

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Inspirations = () => {
  const items = getInspirations();
  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Inspirations" description="Browse your inspiration library." />
      <div className="flex items-center justify-end">
        <Link to="/new/inspiration" className="text-sm underline underline-offset-4 text-primary">New</Link>
      </div>


      <section className="space-y-3 pb-8">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No inspirations yet.</p>
        ) : (
          <div className="columns-2 gap-3 [column-fill:_balance]">
            {items.map((ins) => (
              <Link to={`/inspiration/${ins.id}`} key={ins.id} className="block mb-3 break-inside-avoid">
                <Card>
                  {(ins.photos?.[0] || ins.image_url) && (
                    <img src={ins.photos?.[0] ?? ins.image_url!} alt={ins.note ? `${ins.note.slice(0,40)} thumbnail` : "Inspiration thumbnail"} className="w-full object-cover rounded-lg" loading="lazy" />
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Inspirations;
