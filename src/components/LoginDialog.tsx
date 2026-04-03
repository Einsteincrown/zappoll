import { useAuth } from "@/contexts/AuthContext";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * LoginDialog now simply triggers Privy's built-in modal.
 * The dialog open/close state triggers the Privy login flow directly.
 */
export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const { login } = useAuth();

  // When opened, trigger Privy login and close our dialog wrapper
  if (open) {
    login();
    // Close immediately — Privy handles its own modal
    setTimeout(() => onOpenChange(false), 0);
  }

  return null;
};
