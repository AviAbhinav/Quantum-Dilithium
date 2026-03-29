import { KeyRound, Shield, Coins, History, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HexDisplay } from "@/components/hex-display"
import { useAuth } from "@/context/auth-context"
import { useGetBlockchain } from "@workspace/api-client-react"
import { truncateHex } from "@/lib/utils"
import { format } from "date-fns"

export function MyWallet() {
  const { user } = useAuth()
  const { data: blockchain } = useGetBlockchain()

  // Extract transaction history for user
  const transactions: any[] = []
  if (blockchain?.chain && user?.publicKey) {
    blockchain.chain.forEach(block => {
      block.transactions.forEach((tx: any) => {
        if (tx.sender === user.publicKey || tx.recipient === user.publicKey) {
          transactions.push({ ...tx, timestamp: block.timestamp, blockIndex: block.index })
        }
      })
    })
  }

  // Sort by newest first
  transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold text-foreground">
          IDENTITY <span className="text-primary glitch-text">MATRIX</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">Your post-quantum cryptographic credentials and activity.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-primary bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-mono font-bold text-foreground mb-1">
                {user.balance} QDLT
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-4">Node: @{user.username}</p>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-8 opacity-60 hover:opacity-100 transition-opacity">
             <img 
               src={`${import.meta.env.BASE_URL}images/quantum-core.png`} 
               alt="Quantum Core" 
               className="w-48 h-48 object-cover mix-blend-screen animate-[pulse_4s_ease-in-out_infinite] border border-primary/20 rounded-full"
             />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-secondary/30 shadow-[0_0_30px_rgba(188,19,254,0.1)] bg-card/60 backdrop-blur-xl">
            <CardHeader className="bg-secondary/5 pb-4">
              <CardTitle className="text-secondary flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                Public Identifier (Address)
              </CardTitle>
              <CardDescription>Share this to receive funds</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <HexDisplay label="Dilithium Public Key" value={user.publicKey} />
              
              <div className="mt-6 flex items-start gap-3 p-3 bg-secondary/10 border border-secondary/20 rounded">
                <Shield className="w-5 h-5 text-secondary shrink-0" />
                <p className="text-xs text-secondary/90 font-mono leading-relaxed">
                  Your private key is held securely on the node and never transmitted. All transactions are automatically signed locally before broadcast.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-mono text-sm flex flex-col items-center">
                  <Activity className="w-8 h-8 mb-2 opacity-50" />
                  No transactions found on the ledger.
                </div>
              ) : (
                <div className="divide-y divide-primary/10">
                  {transactions.slice(0, 10).map((tx, idx) => {
                    const isReceived = tx.recipient === user.publicKey;
                    return (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isReceived ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="font-mono text-sm">
                              {isReceived ? 'Received from' : 'Sent to'} {truncateHex(isReceived ? tx.sender : tx.recipient)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Block #{tx.blockIndex} • {format(new Date(tx.timestamp), "MMM dd, HH:mm")}
                            </div>
                          </div>
                        </div>
                        <div className={`font-mono font-bold ${isReceived ? 'text-green-500' : 'text-red-500'}`}>
                          {isReceived ? '+' : '-'}{tx.amount} QDLT
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
