import { useState } from "react";
import { Home, Search, Library, Music2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SearchDialog } from "./SearchDialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Library, label: "Your Library", path: "/library" },
];

export function MusicSidebar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <div className="p-4">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <Music2 className="h-6 w-6" />
              <span className="font-bold text-lg">Music</span>
            </Link>
          </div>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center gap-2 w-full"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}