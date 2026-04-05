import { useState } from "react";
import { useLoginWithEmail, useLoginWithOAuth } from "@privy-io/react-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, Loader2, ArrowLeft } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose" | "email" | "otp";

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const { sendCode, loginWithCode, state: emailState } = useLoginWithEmail({
    onComplete: () => {
      resetAndClose();
    },
    onError: (err) => {
      setError(typeof err === "string" ? err : "Login failed. Please try again.");
    },
  });

  const { initOAuth, state: oauthState } = useLoginWithOAuth({
    onComplete: () => {
      resetAndClose();
    },
    onError: (err) => {
      setError(typeof err === "string" ? err : "OAuth login failed.");
    },
  });

  const resetAndClose = () => {
    setStep("choose");
    setEmail("");
    setCode("");
    setError("");
    onOpenChange(false);
  };

  const handleSendCode = async () => {
    setError("");
    try {
      await sendCode({ email });
      setStep("otp");
    } catch {
      setError("Failed to send code. Check your email and try again.");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    try {
      await loginWithCode({ code });
    } catch {
      setError("Invalid code. Please try again.");
    }
  };

  const handleTwitter = () => {
    setError("");
    initOAuth({ provider: "twitter" });
  };

  const isLoading =
    emailState.status === "sending-code" ||
    emailState.status === "submitting-code" ||
    oauthState.status === "loading";

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            Connect to ZapPoll
          </DialogTitle>
          <DialogDescription>Sign in with your email or Twitter account.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === "choose" && (
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setStep("email")}
              disabled={isLoading}
            >
              <Mail className="h-5 w-5 text-primary" />
              Continue with Email
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleTwitter}
              disabled={isLoading}
            >
              {oauthState.status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              )}
              Continue with Twitter
            </Button>
          </div>
        )}

        {step === "email" && (
          <div className="flex flex-col gap-4 pt-2">
            <button
              onClick={() => setStep("choose")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && handleSendCode()}
              autoFocus
            />
            <Button
              onClick={handleSendCode}
              disabled={!email || isLoading}
              className="glow-orange"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Verification Code
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-4 pt-2">
            <button
              onClick={() => setStep("email")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <p className="text-sm text-muted-foreground">
              Enter the code sent to <span className="text-foreground font-medium">{email}</span>
            </p>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && code && handleVerifyCode()}
              autoFocus
              maxLength={6}
            />
            <Button
              onClick={handleVerifyCode}
              disabled={!code || isLoading}
              className="glow-orange"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify & Sign In
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
