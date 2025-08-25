import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import AccountModal from "./AccountModal";

const TopAppBar = () => {
  const [userInfo, setUserInfo] = useState<{
    name: string;
    avatarUrl?: string;
    isAuthenticated: boolean;
  }>({ name: "Guest", isAuthenticated: false });
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is authenticated, get profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", session.user.id)
            .single();
          
          const name = profile?.display_name || 
            session.user.email?.split("@")[0] || 
            "User";
          
          setUserInfo({
            name,
            avatarUrl: profile?.avatar_url || undefined,
            isAuthenticated: true
          });
        } else {
          // Check for guest name
          const guestName = localStorage.getItem("pt_guest_name");
          setUserInfo({
            name: guestName || "Guest",
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error("Failed to load user info:", error);
        setUserInfo({ name: "Guest", isAuthenticated: false });
      }
    };

    loadUserInfo();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserInfo();
    });

    // Listen for localStorage changes (for guest name updates)
    const handleStorageChange = () => {
      loadUserInfo();
    };
    
    window.addEventListener("storage", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* iOS safe area spacer */}
      <div className="h-[env(safe-area-inset-top)] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60" />
      
      <div className="mx-auto flex h-14 max-w-screen-sm items-center justify-between px-4">
        <Button 
          variant="ghost" 
          onClick={() => setAccountModalOpen(true)}
          aria-label="Account" 
          className="flex items-center gap-2 h-auto p-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={userInfo.avatarUrl} alt={`${userInfo.name} profile avatar`} />
            <AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{userInfo.name}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Create"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              variant="ghost"
            >
              <Plus className="h-8 w-8" aria-hidden="true" />
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
      
      <AccountModal 
        open={accountModalOpen} 
        onOpenChange={setAccountModalOpen} 
      />
    </header>
  );
};

export default TopAppBar;
