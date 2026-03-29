import { Switch, Route, Router as WouterRouter, Redirect } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider, useAuth } from "@/context/auth-context"

// Components
import { Layout } from "@/components/layout"
import NotFound from "@/pages/not-found"
import { AuthPages } from "@/pages/auth"

// Pages
import { Dashboard } from "@/pages/dashboard"
import { MyWallet } from "@/pages/key-generator"
import { Wallet } from "@/pages/wallet"
import { Explorer } from "@/pages/explorer"
import { Mining } from "@/pages/mining"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Redirect to="/login" />;
  
  return <Component {...rest} />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Switch>
      <Route path="/login" component={AuthPages} />
      <Route path="/register" component={AuthPages} />
      
      <Route path="*">
        {user ? (
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/keys" component={MyWallet} />
              <Route path="/wallet" component={Wallet} />
              <Route path="/explorer" component={Explorer} />
              <Route path="/mine" component={Mining} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;
