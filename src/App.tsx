import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "@/pages/Landing";
import IdentityStep from "@/pages/wizard/IdentityStep";
import AssetsStep from "@/pages/wizard/AssetsStep";
import PainPointsStep from "@/pages/wizard/PainPointsStep";
import Diagnosis from "@/pages/Diagnosis";
import Solution from "@/pages/Solution";
import { WizardProvider } from "@/contexts/WizardContext";
import NotFound from "@/pages/NotFound";

// Use hash-based routing (/#/) to support opening index.html directly via file:// protocol
function AppRouter() {
  return (
    <WizardProvider>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/wizard/identity" component={IdentityStep} />
          <Route path="/wizard/assets" component={AssetsStep} />
          <Route path="/wizard/pain-points" component={PainPointsStep} />
          <Route path="/diagnosis" component={Diagnosis} />
          <Route path="/solution" component={Solution} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </WizardProvider>
  );
}

// Note on theming:
// - Choose defaultTheme based on your design (light or dark background)
// - Update the color palette in index.css to match
// - If you want switchable themes, add `switchable` prop and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

