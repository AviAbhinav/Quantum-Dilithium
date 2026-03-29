import { useState } from "react"
import { KeyRound, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HexDisplay } from "@/components/hex-display"
import { useGenerateKeyPair, type KeyPair } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export function KeyGenerator() {
  const [keys, setKeys] = useState<KeyPair | null>(null)
  const generateMutation = useGenerateKeyPair()
  const { toast } = useToast()

  const handleGenerate = async () => {
    try {
      const data = await generateMutation.mutateAsync()
      setKeys(data)
      toast({
        title: "Keys Generated",
        description: `Successfully created ${data.algorithm} key pair.`,
      })
    } catch (e: any) {
      toast({
        title: "Generation Failed",
        description: e.message || "Failed to generate keys",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold text-foreground">
          IDENTITY <span className="text-primary glitch-text">MATRIX</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">Generate post-quantum cryptographic credentials.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                CRYSTALS-Dilithium
              </CardTitle>
              <CardDescription>
                NIST ML-DSA Standard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground font-sans">
              <p>
                Dilithium is a lattice-based digital signature scheme that is strongly secure against both classical and quantum computers.
              </p>
              <div className="bg-destructive/10 border border-destructive/30 p-3 flex gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-mono leading-relaxed">
                  NEVER share your private key. It is mathematically impossible to recover lost keys. Store them securely offline.
                </p>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={generateMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateMutation.isPending ? "COMPUTING MATRIX..." : "GENERATE NEW KEYS"}
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-4 opacity-50 hover:opacity-100 transition-opacity">
             <img 
               src={`${import.meta.env.BASE_URL}images/quantum-core.png`} 
               alt="Quantum Core" 
               className="w-48 h-48 object-cover mix-blend-screen animate-[pulse_4s_ease-in-out_infinite] border border-primary/20 rounded-full"
             />
          </div>
        </div>

        <div className="md:col-span-2 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {keys ? (
              <motion.div
                key="keys"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 h-full"
              >
                <Card className="border-secondary/30 shadow-[0_0_30px_rgba(188,19,254,0.1)]">
                  <CardHeader className="bg-secondary/5 pb-4">
                    <CardTitle className="text-secondary flex items-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      Public Identifier (Address)
                    </CardTitle>
                    <CardDescription>Share this to receive funds</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <HexDisplay label="Dilithium Public Key" value={keys.publicKey} />
                  </CardContent>
                </Card>

                <Card className="border-destructive/30 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
                  <CardHeader className="bg-destructive/5 pb-4">
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      Private Key
                    </CardTitle>
                    <CardDescription className="text-destructive/80">TOP SECRET - Required for signing transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <HexDisplay label="Dilithium Private Key" value={keys.privateKey} />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-primary/20 bg-background/50 backdrop-blur-sm"
              >
                <KeyRound className="w-16 h-16 text-primary/20 mb-4" />
                <p className="text-muted-foreground font-mono">Awaiting key generation sequence...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
