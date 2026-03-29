import { useState } from "react"
import { Pickaxe, HardDrive, Cpu, Terminal, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetPendingTransactions, useMineBlock } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { HexDisplay } from "@/components/hex-display"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

export function Mining() {
  const [minerAddress, setMinerAddress] = useState("")
  const [minedBlock, setMinedBlock] = useState<any>(null)
  
  const { data: pending, refetch: refetchPending } = useGetPendingTransactions()
  const mineMutation = useMineBlock()
  const { toast } = useToast()

  const pendingCount = pending?.count || 0

  const handleMine = async () => {
    if (!minerAddress) {
      toast({ title: "Address Required", description: "Provide a public key to receive block rewards.", variant: "destructive" })
      return
    }

    if (pendingCount === 0) {
      toast({ title: "No Transactions", description: "Mempool is empty. Nothing to mine.", variant: "default" })
      return
    }

    try {
      setMinedBlock(null) // Reset display
      const block = await mineMutation.mutateAsync({
        data: { minerAddress }
      })
      setMinedBlock(block)
      refetchPending()
      toast({
        title: "Block Mined!",
        description: `Successfully mined block #${block.index} with ${block.transactions.length} TXs.`,
      })
    } catch (e: any) {
      toast({
        title: "Mining Failed",
        description: e.message || "Failed to solve proof of work.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold text-foreground">
          COMPUTE <span className="text-primary glitch-text">NODE</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">Process transactions and secure the network.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Col: Controls */}
        <div className="space-y-6">
          <Card className="border-accent/40 shadow-[0_0_20px_rgba(0,243,255,0.05)] relative overflow-visible">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Pickaxe className="w-5 h-5" />
                Mining Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Mempool Status */}
              <div className="bg-black/50 border border-primary/20 p-4 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <HardDrive className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono tracking-wider">MEMPOOL STATUS</div>
                    <div className="text-sm font-mono text-foreground">{pendingCount} pending transactions</div>
                  </div>
                </div>
                <div className="text-3xl font-mono font-bold text-primary">
                  {pendingCount}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="minerAddress" className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Reward Address (Public Key)
                </Label>
                <Input 
                  id="minerAddress" 
                  placeholder="Enter Hex..." 
                  value={minerAddress}
                  onChange={(e) => setMinerAddress(e.target.value)}
                  className="border-accent/30 focus-visible:border-accent font-mono"
                />
              </div>

              <Button 
                onClick={handleMine}
                disabled={mineMutation.isPending || pendingCount === 0}
                className="w-full h-14 text-lg font-bold tracking-widest bg-accent/20 text-accent border-accent shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:bg-accent/30 hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all"
              >
                {mineMutation.isPending ? (
                  <span className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 animate-spin" />
                    SOLVING HASH...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Terminal className="w-5 h-5" />
                    INITIATE MINING
                  </span>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* Right Col: Output/Terminal */}
        <div className="bg-black border border-primary/20 flex flex-col h-full min-h-[400px] shadow-[inset_0_0_50px_rgba(0,0,0,1)] relative">
          <div className="absolute top-0 left-0 right-0 h-6 bg-primary/10 border-b border-primary/20 flex items-center px-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono ml-4 uppercase tracking-widest">node_output.log</span>
          </div>
          
          <div className="p-4 pt-10 font-mono text-xs overflow-y-auto flex-1">
            <div className="text-primary/60 mb-4">{">_"} Awaiting operations...</div>
            
            <AnimatePresence>
              {mineMutation.isPending && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-1 text-accent"
                >
                  <p>{">_"} Compiling transactions from mempool...</p>
                  <p>{">_"} Constructing Merkle tree...</p>
                  <p>{">_"} Initiating Proof of Work solver...</p>
                  <p className="animate-pulse">{">_"} Hashing.........................</p>
                </motion.div>
              )}
              
              {minedBlock && !mineMutation.isPending && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-green-400 font-bold">{">_"} VALID HASH FOUND!</p>
                  <div className="border border-green-500/30 bg-green-500/5 p-3 space-y-2 mt-2">
                    <div className="text-green-300 font-bold mb-2">--- NEW BLOCK {minedBlock.index} ---</div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="text-foreground">{format(new Date(minedBlock.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="text-muted-foreground">Nonce:</span>
                      <span className="text-accent">{minedBlock.nonce}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <span className="text-muted-foreground">Hash:</span>
                      <span className="text-primary bg-black/50 p-1 break-all text-[10px]">{minedBlock.hash}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-500/20 text-muted-foreground">
                      Processed {minedBlock.transactions.length} transactions.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
