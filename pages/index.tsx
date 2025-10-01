'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/navigation/navbar'
import BridgeActivity from '../components/BridgeActivity'

export function Hero() {
  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Navbar */}
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-black"></div>
        
        {/* Animated Purple Orbs - Lakers Purple */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-3xl"
        />
        
        {/* Yellow/Gold Accent Orb */}
        <motion.div
          animate={{ 
            scale: [1, 1.4, 1],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-yellow-600/20 rounded-full blur-3xl"
        />

        {/* Deep Purple Orb */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -80, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-800/25 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Main Headline */}
          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-none">
            <span className="block bg-gradient-to-r from-purple-400 via-yellow-400 to-purple-500 bg-clip-text text-transparent">
              PSICHEDELIC
            </span>
          </h1>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Cross-Chain <span className="text-yellow-400">Bridge</span>
          </h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Bridge your tokens across Ethereum, Polygon, and AggLayer Unified Chains with lightning speed and zero hassle.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <button className="px-12 py-5 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg text-white text-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
              Launch App
            </button>
            <button className="px-12 py-5 bg-purple-900/50 backdrop-blur-sm border-2 border-purple-600 rounded-lg text-white text-xl font-bold hover:bg-purple-800/50 transition-all duration-300 w-full sm:w-auto">
              Learn More
            </button>
          </motion.div>

          {/* Buy Tokens Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-4xl mx-auto mb-20"
          >
            <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              Buy PSI Tokens
            </h3>
            {/* Placeholder - will be connected with wallet provider */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="number"
                placeholder="Enter amount"
                className="flex-1 px-6 py-4 bg-purple-900/50 backdrop-blur-sm border-2 border-purple-600 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
              />
              <button
                className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xl font-bold hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
              >
                Buy Tokens
              </button>
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">Connect your wallet to buy PSI tokens</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mb-20"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                $2.4M
              </div>
              <div className="text-gray-400 text-sm md:text-base">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent mb-2">
                12.4K
              </div>
              <div className="text-gray-400 text-sm md:text-base">Bridges</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                3
              </div>
              <div className="text-gray-400 text-sm md:text-base">Chains</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-400">
                Bridge tokens in seconds with our optimized cross-chain infrastructure.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Ultra Secure</h3>
              <p className="text-gray-400">
                Your assets are protected by advanced cryptographic protocols.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💎</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Low Fees</h3>
              <p className="text-gray-400">
                Minimal bridging fees mean more value stays in your wallet.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live Activity Section */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-yellow-400 to-purple-500 bg-clip-text text-transparent">
                  Live Bridge Activity
                </span>
              </h3>
              <p className="text-gray-400 text-lg">
                Real-time transactions across chains
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-sm border border-purple-700/50 rounded-2xl p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                <BridgeActivity
                  fromChain="Ethereum"
                  toChain="Polygon"
                  amount="1,250"
                  token="PSI"
                  time="2m ago"
                  gradient="from-purple-400 to-yellow-400"
                />
                <BridgeActivity
                  fromChain="Polygon"
                  toChain="Cardona"
                  amount="5,600"
                  token="PSI"
                  time="5m ago"
                  gradient="from-yellow-400 to-purple-400"
                />
                <BridgeActivity
                  fromChain="Cardona"
                  toChain="Ethereum"
                  amount="890"
                  token="PSI"
                  time="8m ago"
                  gradient="from-purple-500 to-yellow-500"
                />
                <BridgeActivity
                  fromChain="Ethereum"
                  toChain="Polygon"
                  amount="3,240"
                  token="PSI"
                  time="12m ago"
                  gradient="from-yellow-500 to-purple-500"
                />
                <BridgeActivity
                  fromChain="Polygon"
                  toChain="Cardona"
                  amount="7,100"
                  token="PSI"
                  time="15m ago"
                  gradient="from-purple-400 to-yellow-400"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Hero
