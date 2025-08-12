import heroImage from "@/assets/clay-texture.jpg";

interface GreetingHeaderProps {
  title: string;
}

function getLocalUser() {
  try {
    const raw = localStorage.getItem("pt_user");
    return raw ? JSON.parse(raw) as { display_name?: string; email?: string } : null;
  } catch {
    return null;
  }
}

function getGuestName() {
  try {
    return localStorage.getItem("pt_guest_name") || null;
  } catch {
    return null;
  }
}

export const GreetingHeader = ({ title }: GreetingHeaderProps) => {
  const user = getLocalUser();
  const guest = getGuestName();
  let greeting = "Hi there.";
  if (user?.display_name && user.display_name.trim()) {
    greeting = `Hi ${user.display_name.trim()}`;
  } else if (guest) {
    greeting = `Hi ${guest}`;
  }

  return (
    <div
      className="rounded-xl overflow-hidden border bg-card"
      aria-label="Decorative ceramic background"
      style={{
        backgroundImage: `linear-gradient(to bottom, hsl(var(--card) / 0.9), hsl(var(--card) / 0.95)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-5">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
    </div>
  );
};

export default GreetingHeader;
