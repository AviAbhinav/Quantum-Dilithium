import { useState, useEffect } from "react"
import { Send, Cpu, ArrowRight, User as UserIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useListUsers } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { truncateHex } from "@/lib/utils"

export function Wallet() {
  const { user, updateBalance } = useAuth()
  const { data: usersData } = useListUsers()
    
  const [isPending, setIsPending] = useState(false)
  
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "10",
    data: ""
  })
  
  const { toast } = useToast()

  const isPending = submitMutation.isPending

  const otherUsers = usersData?.users.filter(u => u.id !== user?.id) || []

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.recipient || !formData.amount) {
      toast({ title: "Incomplete Data", description: "Please select a recipient and amount", variant: "destructive" })
      return
    }

    setIsPending(true) // Start the loading animation

    try {
      // Use native fetch to force session cookies to be included
      const res = await fetch("/api/transactions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // THIS IS THE MAGIC FIX
        body: JSON.stringify({
          recipientPublicKey: formData.recipient,
          amount: parseFloat(formData.amount),
          note: formData.data || undefined
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to process transaction");
      }

      if (result.success && result.newBalance !== undefined) {
        updateBalance(result.newBalance)
        toast({
          title: "Transaction Submitted",
          description: `TX ID: ${result.transactionId.substring(0, 16)}... added to pool.`,
        })
        setFormData(prev => ({ ...prev, recipient: "", amount: "", data: "" }))
      }
      
    } catch (err: any) {
      toast({
        title: "Transfer Failed",
        description: err.message || "Failed to process transaction",
        variant: "destructive"
      })
    } finally {
      setIsPending(false) // Stop the loading animation
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold text-foreground">
          SECURE <span className="text-primary glitch-text">TRANSFER</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">Send QDLT tokens to other nodes.</p>
      </div>

      <Card className="border-t-4 border-t-primary bg-card/60 backdrop-blur-xl">
        <form onSubmit={handleTransfer}>
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Transaction Payload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {/* Sender Section */}
            <div className="space-y-4 p-4 border border-primary/20 bg-black/40 relative">
              <div className="absolute top-0 left-4 -translate-y-1/2 bg-background px-2 text-xs font-mono text-primary font-bold">
                SENDER
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">Your Account</Label>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded font-mono text-sm text-primary flex justify-between items-center">
                    <span>@{user?.username}</span>
                    <span className="text-xs text-muted-foreground">Balance: {user?.balance} QDLT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-background p-2 rounded-full border border-primary/20 text-primary">
                <ArrowRight className="w-5 h-5 rotate-90" />
              </div>
            </div>

            {/* Recipient Section */}
            <div className="space-y-4 p-4 border border-secondary/20 bg-black/40 relative">
              <div className="absolute top-0 left-4 -translate-y-1/2 bg-background px-2 text-xs font-mono text-secondary font-bold">
                DESTINATION
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-xs font-mono text-muted-foreground uppercase">Recipient</Label>
                <Select value={formData.recipient} onValueChange={(val) => setFormData(prev => ({ ...prev, recipient: val }))}>
                  <SelectTrigger className="font-mono bg-background/50 border-secondary/30 focus:ring-secondary">
                    <SelectValue placeholder="Select user to send to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherUsers.map(u => (
                      <SelectItem key={u.id} value={u.publicKey} className="font-mono">
                        <div className="flex items-center justify-between w-full min-w-[200px]">
                          <span>@{u.username}</span>
                          <span className="text-xs text-muted-foreground ml-4">{truncateHex(u.publicKey)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-mono text-muted-foreground uppercase">Amount (QDLT)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min="0" 
                    step="0.000001" 
                    placeholder="0.00" 
                    className="font-mono bg-background/50 border-secondary/30 focus-visible:ring-secondary"
                    value={formData.amount}
                    onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data" className="text-xs font-mono text-muted-foreground uppercase">Optional Note</Label>
                  <Input 
                    id="data" 
                    placeholder="Encrypted note..." 
                    className="font-mono bg-background/50 border-secondary/30 focus-visible:ring-secondary"
                    value={formData.data}
                    onChange={e => setFormData(p => ({ ...p, data: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-primary/10">
              <Button type="submit" size="lg" className="w-full group" disabled={isPending}>
                {isPending ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Cpu className="w-5 h-5 mr-2" />
                  </motion.div>
                ) : (
                  <Cpu className="w-5 h-5 mr-2 group-hover:text-white transition-colors" />
                )}
                {isPending ? "BROADCASTING..." : "AUTHORIZE & SEND"}
              </Button>
            </div>
            
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
