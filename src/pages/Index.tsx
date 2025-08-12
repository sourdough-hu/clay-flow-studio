import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUpcomingTasks, getPieces } from "@/lib/storage";
import { SEO } from "@/components/SEO";
import { format } from "date-fns";

const Index = () => {
  const navigate = useNavigate();
  const tasks = getUpcomingTasks(7);
  const pieces = getPieces();
  const pieceById = Object.fromEntries(pieces.map((p) => [p.id, p] as const));
  const formatStage = (s?: string) => {
    if (!s) return "";
    const label = s.replace(/_/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Upcoming Tasks — Dashboard"
        description="Your upcoming pottery tasks and quick links."
      />

      <section className="px-4 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Upcoming Tasks</h1>
        <div className="mt-4 rounded-xl border bg-card max-h-[50vh] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No upcoming tasks.</div>
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => {
                const piece = (pieceById as any)[t.piece_id];
                const thumb = piece?.photos?.[0] || "/placeholder.svg";
                const stage = formatStage(piece?.current_stage);
                const date = format(new Date(t.due_at), "PPP");
                return (
                  <li key={t.piece_id} className="p-3">
                    <button
                      className="w-full flex items-center gap-3 text-left"
                      onClick={() => navigate("/tasks")}
                    >
                      <img
                        src={thumb}
                        alt={`${piece?.title || t.title} thumbnail`}
                        loading="lazy"
                        className="h-9 w-9 rounded-full object-cover border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{piece?.title || t.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{stage} • {date}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="px-4 mt-6 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/start-new" className="block">
            <Card className="aspect-square group cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">New Record</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/pieces" className="block">
            <Card className="aspect-square group cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">In the Making</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/gallery" className="block">
            <Card className="aspect-square group cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">My Gallery</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/inspirations" className="block">
            <Card className="aspect-square group cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">My Inspiration</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
