import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "@/contexts/AuthContext";
import { PollProvider } from "@/contexts/PollContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import CreatePoll from "./pages/CreatePoll";
import PollDetail from "./pages/PollDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <PrivyProvider
    appId="cmni71zzn011s0cl8kaein1n2"
    config={{
      loginMethods: ["email", "twitter"],
      appearance: {
        theme: "dark",
        accentColor: "#F97316",
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SoundProvider>
          <AuthProvider>
            <PollProvider>
              <Toaster />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/create" element={<CreatePoll />} />
                    <Route path="/poll/:id" element={<PollDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </PollProvider>
          </AuthProvider>
        </SoundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;
