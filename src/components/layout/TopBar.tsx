import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Auth } from "@/components/Auth";

type TopBarProps = {
  setShowMobileMenu: (show: boolean) => void;
};

export const TopBar = ({ setShowMobileMenu }: TopBarProps) => {
  return (
    <div className="lg:h-16 h-14 bg-[#1a1a1a] fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4">
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileMenu(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="lg:hidden">
        <Logo className="!gap-2" />
      </div>
      <div className="ml-auto">
        <Auth />
      </div>
    </div>
  );
};