import { Activity, Blocks, Hash, HardDrive, CheckCircle2, ShieldAlert, Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGetBlockchain, useValidateBlockchain, useGetPendingTransactions } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"

export function Dashboard() {
  const { user } = useAuth()
  const { data: blockchain, isLoading: isChainLoading, refetch: refetchChain } = useGetBlockchain()
  const { data: pending, isLoading: isPendingLoading } = useGetPendingTransactions()
  const { refetch: validateChain, isFetching: isValidating } = useValidateBlockchain({
    query: { enabled: false }
  })
  const { toast } = useToast()

  const handleValidate = async () => {
    try {
      const { data } = await validateChain()
      if (data?.valid) {
        toast({
          title: "Chain Validated",
          description: "All Dilithium signatures and hashes are intact.",
          variant: "default",
        })
      } else {
        toast({
          title: "Chain Invalid!",
          description: `Invalid blocks detected: ${data?.invalidBlocks?.join(', ') || 'Unknown'}`,
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Validation Failed",
        description: e.message || "Failed to validate chain",
        variant: "destructive",
      })
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold text-foreground">
            NETWORK <span className="text-primary glitch-text">STATUS</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-mono">Monitoring quantum-resistant ledger integrity.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => refetchChain()}>
            <Activity className="w-4 h-4 mr-2" />
            Sync Node
          </Button>
          <Button onClick={handleValidate} disabled={isValidating}>
            {isValidating ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Validate Integrity
          </Button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div variants={item} className="md:col-span-4">
          <Card className="border-t-4 border-t-secondary bg-secondary/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Operator Balance</p>
                <div className="text-4xl font-mono font-bold text-secondary flex items-center gap-3">
                  <Coins className="w-8 h-8" />
                  {user?.balance || 0} <span className="text-2xl text-secondary/60">QDLT</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-mono">NODE IDENTIFIER</p>
                <p className="font-mono text-sm">@{user?.username}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm flex items-center gap-2">
                <Blocks className="w-4 h-4 text-primary" />
                BLOCK HEIGHT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-mono font-bold text-foreground">
                {isChainLoading ? "--" : blockchain?.length || 0}
              </div>
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Synchronized
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full border-t-4 border-t-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-secondary" />
                PENDING TXS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-mono font-bold text-foreground">
                {isPendingLoading ? "--" : pending?.count || 0}
              </div>
              <p className="text-xs text-secondary mt-2">Awaiting block miner</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-2">
          <Card className="h-full border-t-4 border-t-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-accent" />
                DIFFICULTY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-mono font-bold text-foreground">
                {isChainLoading ? "--" : blockchain?.difficulty || 0}
              </div>
              <p className="text-xs text-accent mt-2">Current mining target zeros</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 relative"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-lg border border-primary/20 -z-10" />
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-full shrink-0">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-bold text-primary mb-2">Dilithium ML-DSA Protection Active</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              This node is running a post-quantum cryptographic ledger. All transactions are signed using the CRYSTALS-Dilithium algorithm (standardized as ML-DSA by NIST), rendering them mathematically resistant to attacks by large-scale quantum computers.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
