import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TopAppBar = () => {
  const name = (() => {
    try {
      return localStorage.getItem("pt_guest_name") || "Guest";
    } catch {
      return "Guest";
    }
  })();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
        <NavLink to="/account" aria-label="Account" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt={`${name} profile avatar`} />
            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{name}</span>
        </NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Create"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              variant="ghost"
            >
              <ChevronDown className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Create</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <NavLink to="/new/piece">New Piece</NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/new/inspiration">New Inspiration</NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="pb-[env(safe-area-inset-top)]" />
    </header>
  );
};

export default TopAppBar;
