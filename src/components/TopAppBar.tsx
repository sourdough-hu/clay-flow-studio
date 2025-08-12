import { NavLink } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TopAppBar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
        <NavLink to="/account" aria-label="Account" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="User profile avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">Priscilla</span>
        </NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Start New"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              variant="ghost"
            >
              <PlusCircle className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Start New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Start New</DropdownMenuLabel>
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
