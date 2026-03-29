import { ReactNode, useState } from "react"
import { Link, useLocation } from "wouter"
import { Shield, Wallet, Send, Database, Pickaxe, Activity, LogOut, Menu, X, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useLogout } from "@workspace/api-client-react"
import { Button } from "./ui/button"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation()
  const { user, logout } = useAuth()
  const logoutMutation = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { path: "/", label: "Dashboard", icon: Activity },
    { path: "/keys", label: "My Wallet", icon: Wallet },
    { path: "/wallet", label: "Send QDLT", icon: Send },
    { path: "/explorer", label: "Blockchain", icon: Database },
    { path: "/mine", label: "Mining Pool", icon: Pickaxe },
  ]

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      logout()
      setLocation("/login")
    } catch (e) {
      console.error(e)
    }
  }

  const toggleMobile = () => setMobileOpen(!mobileOpen)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative z-0">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-[-1] opacity-20 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/cyberpunk-bg.png)` }}
      />
      
      {/* Mobile Nav Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleMobile} className="bg-background/80 backdrop-blur-md border-primary/50 text-primary">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative w-72 h-full border-r border-primary/20 bg-card/95 backdrop-blur-xl flex flex-col relative z-40 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />
        
        <div className="p-6 border-b border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 border border-primary bg-primary/10 relative">
              <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              <Shield className="w-8 h-8 text-primary relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-mono font-bold tracking-wider text-primary glitch-hover">
                Q-CHAIN
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                Dilithium Secured
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-primary/20 rounded-md p-3">
            <div className="text-xs text-muted-foreground font-mono mb-1">OPERATOR</div>
            <div className="font-mono text-primary font-bold truncate">@{user?.username}</div>
            <div className="mt-2 flex items-center justify-between border-t border-primary/10 pt-2">
              <span className="text-xs text-muted-foreground font-mono">BALANCE</span>
              <span className="font-mono font-bold text-secondary flex items-center gap-1 text-sm">
                <Coins className="w-3 h-3" />
                {user?.balance || 0} QDLT
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border border-transparent transition-all duration-300 font-mono tracking-wide relative group overflow-hidden rounded-sm",
                  isActive 
                    ? "bg-primary/10 border-primary/50 text-primary shadow-[inset_0_0_20px_rgba(0,243,255,0.1)]" 
                    : "text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(0,243,255,1)]" />
                )}
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                {item.label}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-primary/20 space-y-3">
          <Button 
            variant="outline" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-mono"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            DISCONNECT
          </Button>
          <div className="bg-background/50 border border-primary/30 p-2 flex items-center justify-between font-mono text-xs rounded-sm">
            <span className="text-muted-foreground">NODE</span>
            <span className="text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></span>
              ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background/80 backdrop-blur-sm relative">
        {/* Subtle scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-50 opacity-20" />
        
        <header className="h-16 border-b border-primary/10 flex items-center px-4 md:px-8 bg-card/50 backdrop-blur-md shrink-0 justify-between">
          <h2 className="text-lg font-mono tracking-widest text-primary/80 capitalize">
            {navItems.find(i => i.path === location)?.label || "Terminal"}
          </h2>
          <div className="md:hidden">
            {/* spacer for mobile menu button */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
