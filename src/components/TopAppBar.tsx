import { NavLink } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TopAppBar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
        <NavLink to="/account" aria-label="Account" className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="User profile avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </NavLink>
        <NavLink
          to="/start-new"
          aria-label="Start New"
          className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <PlusCircle className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">Start New</span>
        </NavLink>
      </div>
      <div className="pb-[env(safe-area-inset-top)]" />
    </header>
  );
};

export default TopAppBar;
