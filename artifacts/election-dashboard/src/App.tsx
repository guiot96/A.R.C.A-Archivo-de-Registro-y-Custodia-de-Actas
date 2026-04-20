import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/layout/sidebar";

// Pages
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Actas from "@/pages/actas";
import ActaDetail from "@/pages/acta-detail";
import Blockchain from "@/pages/blockchain";
import Blog from "@/pages/blog";
import Detection from "@/pages/detection";

const queryClient = new QueryClient();

function Router() {
  return (
    <Sidebar>
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/upload" component={Upload} />
        <Route path="/actas" component={Actas} />
        <Route path="/actas/:id" component={ActaDetail} />
        <Route path="/blockchain" component={Blockchain} />
        <Route path="/blog" component={Blog} />
        <Route path="/detection" component={Detection} />
        <Route component={NotFound} />
      </Switch>
    </Sidebar>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;