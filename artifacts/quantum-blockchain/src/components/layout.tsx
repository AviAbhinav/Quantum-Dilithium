import { ReactNode } from "react"
import { Link, useLocation } from "wouter"
import { Shield, Key, Send, Database, Pickaxe, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation()

  const navItems = [
    { path: "/", label: "Dashboard", icon: Activity },
    { path: "/keys", label: "Key Generator", icon: Key },
    { path: "/wallet", label: "Wallet & Send", icon: Send },
    { path: "/explorer", label: "Blockchain", icon: Database },
    { path: "/mine", label: "Mining Pool", icon: Pickaxe },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative z-0">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-[-1] opacity-20 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/cyberpunk-bg.png)` }}
      />
      
      {/* Sidebar */}
      <aside className="w-72 border-r border-primary/20 bg-card/80 backdrop-blur-md flex flex-col relative">
        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />
        
        <div className="p-6 border-b border-primary/20">
          <div className="flex items-center gap-3">
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
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border border-transparent transition-all duration-300 font-mono tracking-wide relative group overflow-hidden",
                  isActive 
                    ? "bg-primary/10 border-primary text-primary shadow-[inset_0_0_20px_rgba(0,243,255,0.1)]" 
                    : "text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
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
        
        <div className="p-4 border-t border-primary/20">
          <div className="bg-background/50 border border-primary/30 p-3 flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">NODE STATUS</span>
            <span className="text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></span>
              ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background/80 backdrop-blur-sm relative">
        {/* Subtle scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-50 opacity-20" />
        
        <header className="h-16 border-b border-primary/10 flex items-center px-8 bg-card/50 backdrop-blur-md shrink-0">
          <h2 className="text-lg font-mono tracking-widest text-primary/80 capitalize">
            {navItems.find(i => i.path === location)?.label || "Terminal"}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
