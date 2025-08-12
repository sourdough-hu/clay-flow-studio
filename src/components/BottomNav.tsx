import { NavLink } from "react-router-dom";
import { Home, ListTodo, Box, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const baseLink = "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors";
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-screen-sm grid-cols-4">
        <li className="flex items-stretch">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(baseLink, "w-full h-16", isActive ? "text-primary" : "text-muted-foreground")
            }
            aria-label="Home"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            <span>Home</span>
          </NavLink>
        </li>
        <li className="flex items-stretch">
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              cn(baseLink, "w-full h-16", isActive ? "text-primary" : "text-muted-foreground")
            }
            aria-label="Tasks"
          >
            <ListTodo className="h-5 w-5" aria-hidden="true" />
            <span>Tasks</span>
          </NavLink>
        </li>
        <li className="flex items-stretch">
          <NavLink
            to="/pieces"
            className={({ isActive }) =>
              cn(baseLink, "w-full h-16", isActive ? "text-primary" : "text-muted-foreground")
            }
            aria-label="Pieces"
          >
            <Box className="h-5 w-5" aria-hidden="true" />
            <span>Pieces</span>
          </NavLink>
        </li>
        <li className="flex items-stretch">
          <NavLink
            to="/inspirations"
            className={({ isActive }) =>
              cn(baseLink, "w-full h-16", isActive ? "text-primary" : "text-muted-foreground")
            }
            aria-label="Inspirations"
          >
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            <span>Inspirations</span>
          </NavLink>
        </li>
      </ul>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
