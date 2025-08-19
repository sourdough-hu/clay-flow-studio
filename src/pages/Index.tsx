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
  const hasUserOrGuest = () => {
    try {
      const u = localStorage.getItem("pt_user");
      const g = localStorage.getItem("pt_guest_name");
      return Boolean(u || g);
    } catch {
      return false;
    }
  };
  const showAuthLink = !hasUserOrGuest();

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Upcoming Tasks — Dashboard"
        description="Your upcoming pottery tasks and quick links."
      />

      <section className="px-4 pt-6">
        <h1 className="text-3xl font-semibold tracking-tight">Upcoming Tasks</h1>
        {showAuthLink && (
          <div className="mt-2">
            <Link to="/auth" className="text-sm underline text-primary">Sign in or create an account</Link>
          </div>
        )}
        <div className="mt-4 rounded-xl border bg-card text-card-foreground max-h-[50vh] overflow-y-auto">
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
                        <p className="text-sm text-card-foreground/80 truncate">{stage} • {date}</p>
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
          <button
            onClick={() => navigate("/start-new")}
            className="aspect-square min-h-[120px] flex items-center justify-center text-center bg-card border rounded-lg shadow-sm transition-all duration-[120ms] ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:opacity-92 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 cursor-pointer"
            aria-label="Start new record"
          >
            <span 
              className="font-semibold tracking-wide leading-none px-2"
              style={{ 
                fontSize: "clamp(20px, 2.2vw, 28px)",
                letterSpacing: "0.2px",
                lineHeight: "1.15"
              }}
            >
              New Record
            </span>
          </button>
          <button
            onClick={() => navigate("/pieces")}
            className="aspect-square min-h-[120px] flex items-center justify-center text-center bg-card border rounded-lg shadow-sm transition-all duration-[120ms] ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:opacity-92 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 cursor-pointer"
            aria-label="View pieces in the making"
          >
            <span 
              className="font-semibold tracking-wide leading-none px-2"
              style={{ 
                fontSize: "clamp(20px, 2.2vw, 28px)",
                letterSpacing: "0.2px",
                lineHeight: "1.15"
              }}
            >
              In the Making
            </span>
          </button>
          <button
            onClick={() => navigate("/gallery")}
            className="aspect-square min-h-[120px] flex items-center justify-center text-center bg-card border rounded-lg shadow-sm transition-all duration-[120ms] ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:opacity-92 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 cursor-pointer"
            aria-label="View my gallery"
          >
            <span 
              className="font-semibold tracking-wide leading-none px-2"
              style={{ 
                fontSize: "clamp(20px, 2.2vw, 28px)",
                letterSpacing: "0.2px",
                lineHeight: "1.15"
              }}
            >
              My Gallery
            </span>
          </button>
          <button
            onClick={() => navigate("/inspirations")}
            className="aspect-square min-h-[120px] flex items-center justify-center text-center bg-card border rounded-lg shadow-sm transition-all duration-[120ms] ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:opacity-92 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 cursor-pointer"
            aria-label="View my inspiration"
          >
            <span 
              className="font-semibold tracking-wide leading-none px-2"
              style={{ 
                fontSize: "clamp(20px, 2.2vw, 28px)",
                letterSpacing: "0.2px",
                lineHeight: "1.15"
              }}
            >
              My Inspiration
            </span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default Index;
