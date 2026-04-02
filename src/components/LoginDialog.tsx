import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Zap } from "lucide-react";
import { useState } from "react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (method: 'email' | 'google' | 'twitter') => {
    setLoading(true);
    try {
      await login(method);
      onOpenChange(false);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            Connect to ZapPoll
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in with your social account. No seed phrases, no extensions — powered by Starkzap.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => handleLogin("google")}
            disabled={loading}
            className="w-full bg-muted hover:bg-muted/80 text-foreground justify-start gap-3 h-12"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
          <Button
            onClick={() => handleLogin("twitter")}
            disabled={loading}
            className="w-full bg-muted hover:bg-muted/80 text-foreground justify-start gap-3 h-12"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Continue with X (Twitter)
          </Button>
          <Button
            onClick={() => handleLogin("email")}
            disabled={loading}
            className="w-full bg-muted hover:bg-muted/80 text-foreground justify-start gap-3 h-12"
          >
            <Mail className="h-5 w-5" />
            Continue with Email
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Gasless transactions • No extensions needed • Powered by Starkzap
        </p>
      </DialogContent>
    </Dialog>
  );
};
