import Link from 'next/link'
import React from 'react'

export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-bold text-black dark:text-white"
    >
      <div className="h-6 w-6 rounded-br-lg rounded-tl-lg bg-gradient-to-r from-orange-500 to-yellow-500" />
      <span>Psichedelic</span>
    </Link>
  )
}

