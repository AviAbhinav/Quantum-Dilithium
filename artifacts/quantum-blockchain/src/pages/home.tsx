import { useLocation } from "wouter"
import { Shield, Zap, Lock, Server, ArrowRight, Code2, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Home() {
  const [, setLocation] = useLocation()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-primary/10 bg-background/80 backdrop-blur-lg sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="font-mono font-bold text-xl text-primary">Q-CHAIN</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setLocation("/login")}>
              Login
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/register")}>
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-mono font-bold tracking-tight">
              QUANTUM<span className="text-primary glitch-text">-RESISTANT</span>
            </h1>
            <h2 className="text-4xl md:text-5xl font-mono text-muted-foreground">BLOCKCHAIN</h2>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-mono">
            Experience the future of cryptography. Q-Chain uses CRYSTALS-Dilithium (ML-DSA-65), post-quantum signatures resistant to quantum computing attacks.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8" onClick={() => setLocation("/register")}>
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary/30" onClick={() => setLocation("/login")}>
              Sign In
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-card/50 border border-primary/10 rounded-lg hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-mono font-bold mb-3">Post-Quantum Safe</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              CRYSTALS-Dilithium3 signatures provide mathematically proven security against quantum computers. Ready for the quantum era.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-card/50 border border-secondary/10 rounded-lg hover:border-secondary/30 transition-all">
            <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-mono font-bold mb-3">Proof-of-Work Mining</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Participate in securing the network. Solve SHA3-512 hashes with difficulty-3 targets and earn 10 QDLT per block mined.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-card/50 border border-accent/10 rounded-lg hover:border-accent/30 transition-all">
            <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-mono font-bold mb-3">Encrypted Transactions</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All transaction data is encrypted with AES-256-GCM. Send tokens and notes with full cryptographic privacy.
            </p>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-mono font-bold text-center mb-16">How It Works</h2>

        <div className="space-y-8">
          {/* Step 1 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex gap-8 items-start">
            <div className="p-4 bg-primary/20 rounded-full flex-shrink-0">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-mono font-bold mb-2">1. Register & Get Keys</h3>
              <p className="text-muted-foreground">Create an account and receive auto-generated Dilithium3 keypair. Start with 100 QDLT tokens.</p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex gap-8 items-start">
            <div className="p-4 bg-secondary/20 rounded-full flex-shrink-0">
              <Code2 className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-mono font-bold mb-2">2. Sign & Send Transactions</h3>
              <p className="text-muted-foreground">All transactions are Dilithium-signed and AES-256-GCM encrypted. Payments are immutable once confirmed.</p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex gap-8 items-start">
            <div className="p-4 bg-accent/20 rounded-full flex-shrink-0">
              <Server className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-mono font-bold mb-2">3. Mine & Verify</h3>
              <p className="text-muted-foreground">Run the mining pool to validate blocks. Each successful block earns you a 10 QDLT coinbase reward.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="p-12 bg-primary/10 border border-primary/20 rounded-lg space-y-6">
          <h2 className="text-3xl font-mono font-bold">Ready to Join the Network?</h2>
          <p className="text-muted-foreground text-lg">
            Start your quantum-resistant identity today. No traditional passwords, no private key uploads—just pure cryptography.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-12" onClick={() => setLocation("/register")}>
            Create Account
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/10 bg-background/50 backdrop-blur-sm py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-muted-foreground text-sm font-mono">
          <p>Q-Chain • Quantum-Resistant Blockchain • Powered by CRYSTALS-Dilithium & SHA3-512</p>
        </div>
      </footer>
    </div>
  )
}
