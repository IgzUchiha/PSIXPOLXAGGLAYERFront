"use client";
import { useState } from "react";
import { useWalletClient, useAccount } from "wagmi";
import axios from "axios";

export function SwapForm() {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Validate Ethereum address format
  const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const clearForm = () => {
    setAmount("");
    setTokenIn("");
    setTokenOut("");
  };

  async function handleSwap(e: React.FormEvent) {
    e.preventDefault();
    if (!walletClient || !address) return;
    
    // Reset state
    setStatus("idle");
    setTxHash("");
    setErrorMessage("");
    
    // Validate inputs
    if (!isValidAddress(tokenIn)) {
      setStatus("error");
      setErrorMessage("Invalid token input address");
      return;
    }
    
    if (!isValidAddress(tokenOut)) {
      setStatus("error");
      setErrorMessage("Invalid token output address");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setStatus("error");
      setErrorMessage("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    
    try {
      // Call the swap-tokens API endpoint
      const response = await axios.post("/api/swap-tokens", {
        tokenIn,
        tokenOut,
        amount,
        userAddress: address
      });
      
      setTxHash(response.data.transactionHash || "");
      setStatus("success");
      clearForm();
    } catch (err: any) {
      console.error("Swap error:", err);
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message || 
        err.message || 
        "Failed to execute token swap"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSwap} className="space-y-2">
      <div className="mb-1">
        <h3 className="text-base font-semibold mb-0.5">Swap Tokens</h3>
        <p className="text-xs text-gray-600">Exchange tokens with the best rates</p>
      </div>
      
      {status === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-2 mb-2">
          <p className="text-sm font-medium">Swap completed successfully!</p>
          {txHash && (
            <p className="text-xs mt-0.5">
              Transaction: <span className="font-mono">{txHash}</span>
            </p>
          )}
        </div>
      )}
      
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-2 mb-2">
          <p className="text-sm font-medium">Swap failed</p>
          <p className="text-xs mt-0.5">{errorMessage}</p>
        </div>
      )}
      
      <div className="form-group mb-2">
        <label htmlFor="tokenIn" className="form-label flex items-center mb-0.5">
          <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
          <span className="text-sm">From</span>
        </label>
        <input 
          id="tokenIn"
          className={`input py-2 ${!isValidAddress(tokenIn) && tokenIn ? 'border-red-300' : ''}`}
          placeholder="Token address" 
          value={tokenIn} 
          onChange={(e) => setTokenIn(e.target.value)} 
          disabled={loading}
        />
      </div>
      
      <div className="form-group mb-2">
        <label htmlFor="tokenOut" className="form-label flex items-center mb-0.5">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
          <span className="text-sm">To</span>
        </label>
        <input 
          id="tokenOut"
          className={`input py-2 ${!isValidAddress(tokenOut) && tokenOut ? 'border-red-300' : ''}`}
          placeholder="Token address" 
          value={tokenOut} 
          onChange={(e) => setTokenOut(e.target.value)} 
          disabled={loading}
        />
      </div>
      
      <div className="form-group mb-3">
        <label htmlFor="amount" className="form-label text-sm mb-0.5">Amount</label>
        <input 
          id="amount"
          className="input py-2" 
          placeholder="0.0" 
          type="number"
          min="0.000001"
          step="0.000001"
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          disabled={loading}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary relative overflow-hidden py-2"
        disabled={loading || !isValidAddress(tokenIn) || !isValidAddress(tokenOut) || !amount || amount === "0"}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Swap...
          </span>
        ) : "Swap Tokens"}
        
        {loading && (
          <span className="absolute bottom-0 left-0 h-1 bg-white/20 animate-progress"></span>
        )}
      </button>
    </form>
  );
}