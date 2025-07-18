import { useLocation } from "wouter";
import { Home, History, Video, BookOpen } from "lucide-react";
import { Button } from "./button";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/history", icon: History, label: "Storico" },
    { path: "/advice", icon: BookOpen, label: "Consigli" },
    { path: "/video", icon: Video, label: "Contatti" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            className={`flex-1 py-2 px-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
              location === path 
                ? "text-sage-600 border-b-2 border-sage-600 bg-sage-50" 
                : "text-gray-500 hover:text-sage-500 hover:bg-sage-50"
            }`}
            onClick={() => setLocation(path)}
          >
            <Icon className={`w-4 h-4 mb-1 transition-all duration-200 ${
              location === path ? "scale-110" : "hover:scale-110"
            }`} />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
