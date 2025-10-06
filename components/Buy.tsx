'use client';

import { useState } from 'react';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

// Crowdsale contract address
const CROWDSALE_ADDRESS = process.env.NEXT_PUBLIC_CARDONA_CROWDSALE_ADDRESS || '0x003E425b1147A4a7F817fF889B149e15630cC34B';
const CARDONA_CHAIN_ID = 2442;
const TOKEN_PRICE = 0.001; // 0.001 ETH per PSI

// Crowdsale ABI - just the buyTokens function
const CROWDSALE_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

const Buy = () => {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  
  const [amount, setAmount] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const buyHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if on Cardona network
    if (chain?.id !== CARDONA_CHAIN_ID) {
      try {
        await switchChain({ chainId: CARDONA_CHAIN_ID });
      } catch (err) {
        setError('Please switch to Cardona testnet');
        return;
      }
    }

    setIsWaiting(true);

    try {
      // Amount of tokens to buy (in wei, 18 decimals)
      const tokenAmount = parseEther(amount);
      
      // Calculate ETH cost: amount * 0.001 ETH
      const ethCost = parseEther((Number(amount) * TOKEN_PRICE).toString());

      // Call buyTokens function on crowdsale contract
      const hash = await walletClient.writeContract({
        address: CROWDSALE_ADDRESS as `0x${string}`,
        abi: CROWDSALE_ABI,
        functionName: 'buyTokens',
        args: [tokenAmount],
        value: ethCost,
      });

      setSuccess(`Success! Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`);
      setAmount('');
    } catch (err: any) {
      console.error('Buy error:', err);
      setError(err.message?.slice(0, 100) || 'Transaction failed');
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          ❌ {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-300 text-sm">
          ✅ {success}
        </div>
      )}

      <form onSubmit={buyHandler} className="flex flex-col sm:flex-row gap-4">
        <input
          type="number"
          placeholder="Enter PSI amount (e.g. 100)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="1"
          max="10000"
          className="flex-1 px-6 py-4 bg-purple-900/50 backdrop-blur-sm border-2 border-purple-600 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
        />
        <button
          type="submit"
          disabled={isWaiting || !address}
          className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xl font-bold hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {!address ? (
            'Connect Wallet'
          ) : isWaiting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Buying...</span>
            </div>
          ) : (
            '🪙 Buy PSI Tokens'
          )}
        </button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-4">
        💰 Price: {TOKEN_PRICE} ETH per PSI • Min: 1 PSI • Max: 10,000 PSI
      </p>
    </div>
  );
};

export default Buy;

