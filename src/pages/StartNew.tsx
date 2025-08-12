import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StartNew = () => {
  return (
    <main className="min-h-screen p-4 space-y-4">
      <SEO title="Pottery Tracker — Start New" description="Quickly start a new entry in your pottery tracker." />
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Start New</h1>
      </header>
      <section className="grid gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Piece</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            <Link to="/new/piece" className="underline underline-offset-4 text-primary">Create a new piece</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Inspiration</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            <Link to="/new/inspiration" className="underline underline-offset-4 text-primary">Add a new inspiration</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default StartNew;
