import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Zap, Terminal, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useLogin, useRegister } from "@workspace/api-client-react";

export function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center space-y-4">
          <div className="p-3 border border-primary/30 bg-primary/5 rounded-2xl relative">
            <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-2xl" />
            <Shield className="w-12 h-12 text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-mono font-bold tracking-widest text-primary glitch-text">
              Q-CHAIN
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono mt-2">
              Quantum-Resistant Identity
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm onSwitch={() => setIsLogin(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm onSwitch={() => setIsLogin(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const res = await loginMutation.mutateAsync({ data: { username, password } });
      login(res.user);
      toast({ title: "Access Granted", description: "Identity verified via Dilithium." });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.message || "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-primary/20 shadow-[0_0_40px_rgba(0,243,255,0.05)] bg-card/60 backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-mono text-center">SYSTEM LOGIN</CardTitle>
        <CardDescription className="text-center font-mono text-xs">Authenticate to access the network</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
              <Terminal className="w-3 h-3" /> User Identifier
            </Label>
            <Input 
              id="username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
              <Lock className="w-3 h-3" /> Passphrase
            </Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 font-mono tracking-widest text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
          </Button>
          
          <div className="text-center pt-4 border-t border-primary/10 mt-4">
            <p className="text-xs text-muted-foreground font-mono">
              Unregistered entity?{" "}
              <button 
                type="button" 
                onClick={onSwitch}
                className="text-primary hover:text-primary/80 underline underline-offset-4 font-bold"
              >
                Establish Identity
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      const res = await registerMutation.mutateAsync({ data: { username, password } });
      login(res.user);
      toast({ 
        title: "Identity Established", 
        description: "Dilithium keys generated. 100 QDLT awarded." 
      });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not create identity",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-secondary/30 shadow-[0_0_40px_rgba(188,19,254,0.05)] bg-card/60 backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-mono text-center text-secondary">NEW ENTITY</CardTitle>
        <CardDescription className="text-center font-mono text-xs">Generate cryptographic identity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/10 border border-secondary/20 rounded-md p-3 mb-6 flex items-start gap-3">
          <Zap className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <p className="text-xs font-mono text-secondary/90 leading-relaxed">
            New nodes receive <strong className="text-secondary">100 QDLT</strong> tokens upon successful initialization of their post-quantum keypair.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username" className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Desired Identifier
            </Label>
            <Input 
              id="reg-username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="bg-background/50 border-secondary/20 focus-visible:border-secondary font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
              <Lock className="w-3 h-3" /> Secure Passphrase
            </Label>
            <Input 
              id="reg-password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-background/50 border-secondary/20 focus-visible:border-secondary font-mono"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 font-mono tracking-widest text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "GENERATING KEYS..." : "GENERATE IDENTITY"}
          </Button>
          
          <div className="text-center pt-4 border-t border-secondary/10 mt-4">
            <p className="text-xs text-muted-foreground font-mono">
              Already established?{" "}
              <button 
                type="button" 
                onClick={onSwitch}
                className="text-secondary hover:text-secondary/80 underline underline-offset-4 font-bold"
              >
                Initialize Session
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
