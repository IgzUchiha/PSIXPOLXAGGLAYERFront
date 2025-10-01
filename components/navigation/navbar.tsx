'use client'

import Link from 'next/link'
import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-900/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-yellow-300 to-purple-500 bg-clip-text text-transparent">
              Psichedelic
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#bridge" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              Bridge
            </Link>
            <Link href="#swap" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              Swap
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Connect Button - RainbowKit */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button 
                          onClick={openConnectModal} 
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                        >
                          Connect Wallet
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button 
                          onClick={openChainModal}
                          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                        >
                          Wrong Network
                        </button>
                      )
                    }

                    return (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={openChainModal}
                          className="px-4 py-2 bg-purple-900/50 backdrop-blur-sm border border-purple-600 rounded-lg text-white font-medium hover:bg-purple-800/50 transition-all duration-300 flex items-center gap-2"
                        >
                          {chain.hasIcon && (
                            <div className="w-5 h-5">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-5 h-5"
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  )
}
