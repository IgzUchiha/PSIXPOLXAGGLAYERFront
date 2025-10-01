import React from 'react'
import { motion } from 'framer-motion'

interface BridgeActivityProps {
  fromChain: string
  toChain: string
  amount: string
  token: string
  time: string
  gradient: string
}

const BridgeActivity = ({ fromChain, toChain, amount, token, time, gradient }: BridgeActivityProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between bg-black/20 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-pulse`}></div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 font-medium">{fromChain}</span>
          <span className="text-gray-500">→</span>
          <span className="text-gray-300 font-medium">{toChain}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className={`font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {amount} {token}
          </div>
        </div>
        <div className="text-gray-500 text-sm min-w-16 text-right">
          {time}
        </div>
      </div>
    </motion.div>
  )
}

export default BridgeActivity

