import { Link, useLocation } from "react-router-dom";
import { Zap, Plus, User, Home, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSound } from "@/contexts/SoundContext";
import { LoginDialog } from "./LoginDialog";
import { useState } from "react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isConnected } = useAuth();
  const { soundEnabled, toggleSound, playClick } = useSound();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

  const navItems = [
    { to: "/", icon: Home, label: "Feed" },
    { to: "/create", icon: Plus, label: "Create" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center glow-orange">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">ZapPoll</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleSound();
                playClick();
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            {isConnected ? (
              <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground font-mono text-xs">
                  {user?.walletAddress.slice(0, 6)}...{user?.walletAddress.slice(-4)}
                </span>
                <span className="text-primary font-semibold">{user?.strkBalance.toFixed(1)} STRK</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  playClick();
                  setLoginOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow-orange hover:opacity-90 transition-opacity"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Mobile Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-xs transition-colors ${
                location.pathname === to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 pb-20 sm:pb-6">
        <div className="container flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" />
          <span>Powered by <span className="text-primary font-semibold">Starkzap</span> | Built on <span className="text-secondary font-semibold">Starknet</span></span>
        </div>
      </footer>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};
