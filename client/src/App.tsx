import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Home } from "@/pages/Home";
import { Tool } from "@/pages/Tool";
import { Pricing } from "@/pages/Pricing";
import { Settings } from "@/pages/Settings";
import { Favorites } from "@/pages/Favorites";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { useAuth } from "@/hooks/useAuth";
import { AIAssistant } from "@/components/AIAssistant";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/marketing" component={Marketing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tool/:id" component={Tool} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/settings" component={Settings} />
          <Route path="/favorites" component={Favorites} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return (
      <>
        <Router />
        {isAuthenticated && <AIAssistant />}
      </>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
