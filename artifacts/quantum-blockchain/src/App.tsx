import { Switch, Route, Router as WouterRouter } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

// Components
import { Layout } from "@/components/layout"
import NotFound from "@/pages/not-found"

// Pages
import { Dashboard } from "@/pages/dashboard"
import { KeyGenerator } from "@/pages/key-generator"
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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/keys" component={KeyGenerator} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/explorer" component={Explorer} />
        <Route path="/mine" component={Mining} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
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
  )
}

export default App;
