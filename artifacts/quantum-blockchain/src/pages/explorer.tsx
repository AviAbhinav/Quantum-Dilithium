import { useState } from "react"
import { Database, Link2, Hash, Clock, Box, User as UserIcon } from "lucide-react"
import { useGetBlockchain, useListUsers } from "@workspace/api-client-react"
import { truncateHex } from "@/lib/utils"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

export function Explorer() {
  const { data: blockchain, isLoading, error } = useGetBlockchain()
  const { data: usersData } = useListUsers()
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null)

  const getUserName = (pubKey: string) => {
    const u = usersData?.users.find(u => u.publicKey === pubKey);
    return u ? `@${u.username}` : "Unknown";
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-mono text-primary animate-pulse tracking-widest">SYNCING LEDGER...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-destructive/10 border border-destructive text-destructive font-mono">
        Failed to load blockchain data. Is the node running?
      </div>
    )
  }

  const blocks = [...(blockchain?.chain || [])].reverse() // Show newest first

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-foreground">
            BLOCK <span className="text-primary glitch-text">EXPLORER</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-mono">Inspect quantum-resistant immutable records.</p>
        </div>
        <div className="text-right font-mono text-sm">
          <div className="text-primary font-bold text-xl">{blockchain?.length || 0}</div>
          <div className="text-muted-foreground uppercase text-xs">Total Blocks</div>
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-primary/5">
        {blocks.map((block, i) => (
          <motion.div 
            key={block.hash}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-background bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,243,255,0.4)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 cursor-pointer hover:bg-primary hover:text-background transition-colors"
                 onClick={() => setExpandedBlock(expandedBlock === block.index ? null : block.index)}
            >
              <Database className="w-6 h-6" />
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 cursor-pointer" onClick={() => setExpandedBlock(expandedBlock === block.index ? null : block.index)}>
              <div className="bg-card/80 backdrop-blur border border-primary/20 p-5 shadow-lg transition-all hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] relative overflow-hidden group-hover:before:opacity-100 before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:via-primary/5 before:to-primary/0 before:opacity-0 before:transition-opacity before:pointer-events-none">
                
                <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-3">
                  <div className="font-mono text-primary font-bold text-lg flex items-center gap-2">
                    <Box className="w-4 h-4" /> 
                    Block #{block.index}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(block.timestamp), "MMM dd, HH:mm:ss")}
                  </div>
                </div>

                <div className="space-y-2 font-mono text-sm">
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><Hash className="w-3 h-3"/> Hash</span>
                    <span className="text-foreground truncate bg-black/40 px-2 py-1 border border-primary/10">{truncateHex(block.hash, 16, 16)}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <span className="text-muted-foreground text-xs uppercase flex items-center gap-1"><Link2 className="w-3 h-3"/> Prev</span>
                    <span className="text-foreground/70 truncate bg-black/40 px-2 py-1 border border-primary/10">{truncateHex(block.previousHash, 16, 16)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-primary/10">
                    <span className="text-xs text-muted-foreground">Transactions: <span className="text-primary font-bold">{block.transactions.length}</span></span>
                    <span className="text-xs text-muted-foreground">Nonce: <span className="text-secondary">{block.nonce}</span></span>
                  </div>
                </div>

                {/* Expandable Transactions Area */}
                <AnimatePresence>
                  {expandedBlock === block.index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-dashed border-primary/30"
                    >
                      {block.transactions.length === 0 ? (
                        <p className="text-xs text-muted-foreground font-mono italic text-center py-2">No transactions in this block (Genesis or empty mine)</p>
                      ) : (
                        <div className="space-y-3">
                          {block.transactions.map((tx, idx) => (
                            <div key={tx.id} className="bg-black/60 border border-primary/20 p-3 text-xs font-mono space-y-2 relative group/tx">
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover/tx:bg-primary transition-colors" />
                              <div className="flex justify-between items-start border-b border-primary/10 pb-2">
                                <span className="text-muted-foreground">ID: <span className="text-foreground">{truncateHex(tx.id)}</span></span>
                                <span className="text-primary font-bold">{tx.amount} QDLT</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                                <div>
                                  <span className="text-muted-foreground block mb-1">FROM</span>
                                  <div className="flex items-center gap-1 text-foreground/90">
                                    <UserIcon className="w-3 h-3" />
                                    <span>{getUserName(tx.sender)}</span>
                                  </div>
                                  <span className="text-foreground/50 truncate block mt-1">{truncateHex(tx.sender)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block mb-1">TO</span>
                                  <div className="flex items-center gap-1 text-foreground/90">
                                    <UserIcon className="w-3 h-3" />
                                    <span>{getUserName(tx.recipient)}</span>
                                  </div>
                                  <span className="text-foreground/50 truncate block mt-1">{truncateHex(tx.recipient)}</span>
                                </div>
                              </div>
                              <div className="pt-2 mt-2 border-t border-primary/5">
                                <span className="text-muted-foreground block mb-1">DILITHIUM SIG</span>
                                <span className="text-secondary/70 truncate block text-[9px] bg-secondary/5 p-1 border border-secondary/10">{truncateHex(tx.signature, 20, 20)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
