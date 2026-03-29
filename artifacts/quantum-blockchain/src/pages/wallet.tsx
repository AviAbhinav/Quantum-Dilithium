import { useState } from "react"
import { Send, Cpu, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSignTransaction, useSubmitTransaction } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export function Wallet() {
  const [formData, setFormData] = useState({
    sender: "",
    privateKey: "",
    recipient: "",
    amount: "10",
    data: ""
  })
  
  const signMutation = useSignTransaction()
  const submitMutation = useSubmitTransaction()
  const { toast } = useToast()

  const isPending = signMutation.isPending || submitMutation.isPending

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sender || !formData.privateKey || !formData.recipient || !formData.amount) {
      toast({ title: "Incomplete Data", description: "Please fill all required fields", variant: "destructive" })
      return
    }

    try {
      // 1. Sign transaction
      const signedTx = await signMutation.mutateAsync({
        data: {
          sender: formData.sender,
          privateKey: formData.privateKey,
          recipient: formData.recipient,
          amount: parseFloat(formData.amount),
          data: formData.data || undefined
        }
      })

      // 2. Submit signed transaction
      const result = await submitMutation.mutateAsync({
        data: {
          sender: signedTx.sender,
          recipient: signedTx.recipient,
          amount: signedTx.amount,
          data: signedTx.data,
          signature: signedTx.signature,
          publicKey: signedTx.publicKey,
          timestamp: signedTx.timestamp
        }
      })

      toast({
        title: "Transaction Submitted",
        description: `TX ID: ${result.transactionId.substring(0, 16)}... added to pending pool.`,
      })
      
      // Clear sensitive fields
      setFormData(prev => ({ ...prev, privateKey: "", recipient: "", amount: "", data: "" }))
      
    } catch (err: any) {
      toast({
        title: "Transfer Failed",
        description: err.message || "Failed to process transaction",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold text-foreground">
          SECURE <span className="text-primary glitch-text">TRANSFER</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">Sign and broadcast transactions to the network.</p>
      </div>

      <Card className="border-t-4 border-t-primary">
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
                AUTHORIZATION
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender" className="text-xs font-mono text-muted-foreground uppercase">Your Public Key</Label>
                  <Input 
                    id="sender" 
                    placeholder="Hex string..." 
                    value={formData.sender}
                    onChange={e => setFormData(p => ({ ...p, sender: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privateKey" className="text-xs font-mono text-destructive uppercase">Your Private Key (Will not be transmitted)</Label>
                  <Input 
                    id="privateKey" 
                    type="password" 
                    placeholder="Hex string for local signing..." 
                    className="border-destructive/30 focus-visible:border-destructive"
                    value={formData.privateKey}
                    onChange={e => setFormData(p => ({ ...p, privateKey: e.target.value }))}
                  />
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
                <Label htmlFor="recipient" className="text-xs font-mono text-muted-foreground uppercase">Recipient Public Key</Label>
                <Input 
                  id="recipient" 
                  placeholder="Hex string..." 
                  value={formData.recipient}
                  onChange={e => setFormData(p => ({ ...p, recipient: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-mono text-muted-foreground uppercase">Amount (QTC)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min="0" 
                    step="0.000001" 
                    placeholder="0.00" 
                    value={formData.amount}
                    onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data" className="text-xs font-mono text-muted-foreground uppercase">Optional Data</Label>
                  <Input 
                    id="data" 
                    placeholder="Hex or text payload..." 
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
                {signMutation.isPending ? "SIGNING WITH DILITHIUM..." : 
                 submitMutation.isPending ? "BROADCASTING..." : 
                 "CRYPTOGRAPHICALLY SIGN & SEND"}
              </Button>
            </div>
            
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
