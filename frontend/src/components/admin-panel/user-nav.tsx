import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { jwtDecode } from "jwt-decode";
import { fetchWithToken } from "@/utils/url";
import { User } from "@/types/datatables";
import AuthToken from "@/utils/authtoken";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function UserNav() {
  const { setTheme, theme } = useTheme();
  const [email, setEmail] = React.useState<string>("");
  const [user, setUser] = React.useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const token = AuthToken.getAuthToken();
  const router = useRouter();

  const handleLogout = () => {
    AuthToken.removeAuthToken();
    router.push("/login/dwh");
  };

  useEffect(() => {
    if (!token) {
      console.log("No token found.");
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.sub) {
        setEmail(decoded.sub);
        fetchWithToken(`/user?email=${decoded.sub}`)
            .then((res) => res.json())
            .then((data) => setUser(data[0]))
            .catch((err) => console.error("Error fetching user data:", err))
            .finally(() => setIsLoading(false));
      }
    } catch (error) {
      console.error("Invalid or expired token:", error);
      setIsLoading(false);
    }
  }, [token]);

  return (
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="relative h-8 w-8 rounded-full"
                    disabled={isLoading}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="#" alt="Avatar" />
                    <AvatarFallback className="bg-transparent">
                      {isLoading ? (
                          <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                      ) : (
                          user?.username
                              ?.split(" ")
                              .map((word) => word.charAt(0).toUpperCase())
                              .slice(0, 2)
                              .join("")
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <Link href="/account" className="flex items-center">
                <UserIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <div onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                    <SunIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                ) : (
                    <MoonIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                )}
                Switch Theme
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="hover:cursor-pointer">
            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
