import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUpcomingTasks } from "@/lib/storage";
import { SEO } from "@/components/SEO";
import GreetingHeader from "@/components/GreetingHeader";

const Index = () => {
  const navigate = useNavigate();
  const tasks = getUpcomingTasks(3);

  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Pottery Tracker — Dashboard"
        description="See upcoming pottery tasks, log new pieces or inspirations, and browse your library."
      />

      <header className="px-4 pt-6 pb-4">
        <GreetingHeader title="Your pottery at a glance" />
      </header>

      <section className="px-4 grid grid-cols-2 gap-3">
        <Card className="aspect-[4/5] group cursor-pointer overflow-hidden" onClick={() => navigate("/tasks")}>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing in the next 3 days.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.slice(0, 3).map((t) => (
                  <li key={t.piece_id} className="text-sm">
                    <span className="font-medium">{t.title}</span>
                    <span className="text-muted-foreground"> — {t.action}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="aspect-[4/5] group cursor-pointer overflow-hidden" onClick={() => navigate("/start-new")}>
          <CardHeader>
            <CardTitle className="text-base">Start Something New</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Open quick create</p>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 mt-3 space-y-3 pb-10">
        <Link to="/pieces" className="block">
          <Card className="group hover:translate-y-[-1px] transition-transform">
            <CardHeader>
              <CardTitle>Making</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/gallery" className="block">
          <Card className="group hover:translate-y-[-1px] transition-transform">
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/inspirations" className="block">
          <Card className="group hover:translate-y-[-1px] transition-transform">
            <CardHeader>
              <CardTitle>All Inspirations</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </main>
  );
};

export default Index;
