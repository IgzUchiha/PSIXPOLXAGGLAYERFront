"use client";
import { useState, useEffect } from "react";
import { useWalletClient, useAccount } from "wagmi";
import axios from "axios";

// Token selection enum matching backend
enum TokenSelection {
  TOKEN_A_TO_B = "TOKEN_A_TO_B",
  TOKEN_B_TO_A = "TOKEN_B_TO_A"
}

// Token option interface
interface TokenOption {
  value: TokenSelection;
  label: string;
  sourceToken: {
    address: string;
    name: string;
  };
  destinationToken: {
    address: string;
    name: string;
  };
}

export function CrossChainSwapForm() {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [amountIn, setAmountIn] = useState("");
  const [selectedOption, setSelectedOption] = useState<TokenSelection | "">("");
  const [tokenOptions, setTokenOptions] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [txHash, setTxHash] = useState("");
  const [txState, setTxState] = useState<"idle" | "bridging" | "ready_to_claim" | "claimed">("idle");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [destinationTxHash, setDestinationTxHash] = useState("");
  const [transactionDetails, setTransactionDetails] = useState("");
  const [assetClaimed, setAssetClaimed] = useState(false);
  const [showMessageClaimButton, setShowMessageClaimButton] = useState(false);
  const [messageClaimState, setMessageClaimState] = useState<"idle" | "claiming" | "claimed" | "error">("idle");
  const [messageClaimTxHash, setMessageClaimTxHash] = useState("");
  const [claimButtonTimer, setClaimButtonTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch token options when component mounts
  useEffect(() => {
    async function fetchTokenOptions() {
      try {
        setLoadingOptions(true);
        const response = await axios.get("/api/token-options");
        setTokenOptions(response.data.options);
      } catch (error) {
        console.error("Error fetching token options:", error);
        setStatus("error");
        setErrorMessage("Failed to load token options");
      } finally {
        setLoadingOptions(false);
      }
    }

    fetchTokenOptions();
  }, []);

  const clearForm = () => {
    setAmountIn("");
    setSelectedOption("");
  };

  // Get current selected token info
  const getSelectedTokenInfo = () => {
    if (!selectedOption) return null;
    return tokenOptions.find(option => option.value === selectedOption);
  };

  // Modify the existing useEffect that checks transaction status
  useEffect(() => {
    if (txHash && address && txState !== "claimed") {
      const checkStatus = async () => {
        try {
          // Call our API endpoint to check transaction status
          const response = await axios.get(`/api/check-transaction-status?txHash=${txHash}&address=${address}`);
          
          const { state, destinationTxHash, details } = response.data;
          
          // Update UI based on transaction state
          if (state === "BRIDGED" && txState === "idle") {
            setTxState("bridging");
          } else if (state === "READY_TO_CLAIM" && txState !== "ready_to_claim") {
            setTxState("ready_to_claim");
          } else if (state === "CLAIMED" && !assetClaimed) {
            setAssetClaimed(true);
            setTxState("claimed");
            setStatus("success");
            
            // Set a 5-second timer before showing the claim message button
            if (claimButtonTimer) clearTimeout(claimButtonTimer);
            const timer = setTimeout(() => {
              setShowMessageClaimButton(true);
            }, 5000);
            setClaimButtonTimer(timer);
            
            // Save destination transaction hash if available
            if (destinationTxHash) {
              setDestinationTxHash(destinationTxHash);
            }
            
            // Stop polling once asset is claimed
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          } else if (state === "FAILED") {
            setTxState("idle");
            setStatus("error");
            setErrorMessage("Transaction failed on the destination chain");
            // Stop polling on failure
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          }
          
          // Save transaction details if available
          if (details) {
            setTransactionDetails(details);
          }
        } catch (error) {
          console.error("Error checking transaction status:", error);
          // Don't set error state here to avoid interrupting the polling
        }
      };

      // Check every 20 seconds (don't poll too frequently to avoid API rate limits)
      const interval = setInterval(checkStatus, 20000);
      setPollingInterval(interval);

      // Initial check
      checkStatus();

      // Cleanup interval on unmount
      return () => {
        if (interval) {
          clearInterval(interval);
          setPollingInterval(null);
        }
        if (claimButtonTimer) {
          clearTimeout(claimButtonTimer);
          setClaimButtonTimer(null);
        }
      };
    }

    // Cleanup if txHash is cleared
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      if (claimButtonTimer) {
        clearTimeout(claimButtonTimer);
        setClaimButtonTimer(null);
      }
    };
  }, [txHash, address, txState]);

  async function handleCrossSwap(e: React.FormEvent) {
    e.preventDefault();
    if (!walletClient || !address) return;
    
    // Reset state
    setStatus("idle");
    setTxHash("");
    setErrorMessage("");
    setTxState("idle");
    
    // Validate inputs
    if (!selectedOption) {
      setStatus("error");
      setErrorMessage("Please select a token pair");
      return;
    }
    
    if (!amountIn || parseFloat(amountIn) <= 0) {
      setStatus("error");
      setErrorMessage("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Sending request with:", {
        tokenSelection: selectedOption,
        amount: amountIn,
        userAddress: address,
      });
      
      const response = await axios.post("/api/cross-chain-swap", {
        tokenSelection: selectedOption,
        amount: amountIn,
        userAddress: address,
      });
      
      console.log("Response:", response.data);
      
      // Get transaction hash from the response
      const hash = response.data.hash || response.data.txHash;
      
      if (hash) {
        setTxHash(hash);
        setTxState("bridging");
        clearForm();
      } else {
        throw new Error("No transaction hash in response");
      }
    } catch (err: any) {
      console.error("Cross-chain swap error:", err);
      setStatus("error");
      setErrorMessage(
        err.response?.data?.message || 
        err.message || 
        "Failed to execute cross-chain swap"
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusMessage() {
    switch (txState) {
      case "bridging":
        return "";
      case "ready_to_claim":
        return "Transaction is ready to be claimed on Cardona. The backend will automatically claim it shortly.";
      case "claimed":
        return "Transaction has been successfully claimed on Cardona. Your tokens have arrived!";
      default:
        return "";
    }
  }

  // Get current token pair details for display
  const selectedTokenInfo = getSelectedTokenInfo();

  async function handleClaimMessage() {
    if (!txHash || !address) return;
    
    setMessageClaimState("claiming");
    
    try {
      const response = await axios.post("/api/claim-message", {
        bridgeTransactionHash: txHash,
        userAddress: address
      });
      
      console.log("Message claim response:", response.data);
      
      if (response.data.success) {
        setMessageClaimState("claimed");
        setMessageClaimTxHash(response.data.messageClaimTxHash);
      } else {
        setMessageClaimState("error");
        setErrorMessage(response.data.message || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error("Error claiming message:", err);
      setMessageClaimState("error");
      
      // Extract the error message from the response
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      "Failed to claim message";
                      
      // Handle specific error cases
      if (err.response?.status === 409) {
        // Already claimed error - this is actually good news
        setMessageClaimState("claimed");
        setErrorMessage("Message was already claimed successfully!");
      } else if (err.response?.status === 404) {
        setErrorMessage(`Transaction not found: ${errorMsg}`);
      } else if (err.response?.status === 400) {
        setErrorMessage(`Cannot claim yet: ${errorMsg}`);
      } else {
        setErrorMessage(errorMsg);
      }
    }
  }

  // Cleanup function in useEffect
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      if (claimButtonTimer) {
        clearTimeout(claimButtonTimer);
        setClaimButtonTimer(null);
      }
    };
  }, []);

  return (
    <div>
      {/* Transaction Status Display */}
      {(txState === "bridging" || txState === "ready_to_claim" || txState === "claimed") && (
        <div className="status-display mb-4">
          <div className="status-header">
            <h3 className="status-title">Transaction Status</h3>
            <span className={`status-badge ${txState === "bridging" ? "bridging" : txState === "claimed" ? "claimed" : ""}`}>
              {txState === "bridging" ? "Bridging" : txState === "ready_to_claim" ? "Ready to Claim" : "Claimed"}
            </span>
          </div>
          
          {txHash && (
            <p className="text-xs mt-1 text-gray-400">
              Source: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                {txHash.slice(0,8)}...{txHash.slice(-6)} ↗
              </a>
            </p>
          )}
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: txState === "bridging" ? "33%" : 
                       txState === "ready_to_claim" ? "66%" : 
                       txState === "claimed" ? "100%" : "0%" 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>Initiated</span>
            <span>Processing</span>
            <span>Completed</span>
          </div>
          
          <p className="text-sm mt-3 text-gray-300">{getStatusMessage()}</p>
          
          {/* Message Claim Button - Only show after asset is claimed and 5-second timer completes */}
          {assetClaimed && showMessageClaimButton && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-green-300">Asset claimed successfully!</span> 
                  <span className="text-xs block mt-1">Please claim the message to complete the swap:</span>
                </p>
              </div>
              
              {messageClaimState === "idle" && (
                <button 
                  onClick={handleClaimMessage}
                  className="claim-button"
                >
                  Claim Message to Complete Swap
                </button>
              )}
              
              {messageClaimState === "claiming" && (
                <button disabled className="claim-button opacity-70 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Claiming Message...
                </button>
              )}
              
              {messageClaimState === "claimed" && (
                <div className="mt-1 text-xs text-green-300">
                  <p className="font-medium">✓ Message successfully claimed!</p>
                  {messageClaimTxHash && (
                    <p className="mt-1">
                      View Transaction: <a href={`https://explorer.cardona.zkevm-rpc.com/tx/${messageClaimTxHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                        {messageClaimTxHash.slice(0,8)}...{messageClaimTxHash.slice(-6)} ↗
                      </a>
                    </p>
                  )}
                </div>
              )}
              
              {messageClaimState === "error" && (
                <div className="mt-1">
                  <p className="text-xs text-red-400">{errorMessage || "Error claiming message. Please try again."}</p>
                  <button 
                    onClick={handleClaimMessage}
                    className="claim-button mt-2 bg-red-900/30 text-red-300 hover:bg-red-900/40"
                  >
                    Retry Message Claim
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Error display */}
      {status === "error" && txState === "idle" && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-md p-3 mb-4">
          <p className="text-sm font-medium">Transaction failed</p>
          <p className="text-xs mt-1">{errorMessage}</p>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleCrossSwap}>
        {/* Token selection */}
        <div className="token-section-label">
          Select Token Pair
        </div>
        <div className="token-section mb-4">
          <select 
            className="w-full bg-transparent text-white border-none outline-none p-2 text-lg"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value as TokenSelection)}
            disabled={loading || txState !== "idle" || loadingOptions}
          >
            <option value="" className="bg-gray-900">-- Select Token Pair --</option>
            {tokenOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900">
                {option.label}
              </option>
            ))}
          </select>
          
          {selectedTokenInfo && (
            <div className="mt-3 px-2 text-xs text-gray-300 flex flex-col gap-2">
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                <span className="font-medium">Source:</span>
                <span className="ml-1">{selectedTokenInfo.sourceToken.name}</span>
                <span className="ml-1 text-gray-500 font-mono">{selectedTokenInfo.sourceToken.address.slice(0,6)}...{selectedTokenInfo.sourceToken.address.slice(-4)}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-pink-500 mr-2"></span>
                <span className="font-medium">Destination:</span>
                <span className="ml-1">{selectedTokenInfo.destinationToken.name}</span>
                <span className="ml-1 text-gray-500 font-mono">{selectedTokenInfo.destinationToken.address.slice(0,6)}...{selectedTokenInfo.destinationToken.address.slice(-4)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Amount input */}
        <div className="token-section-label">
          Amount to bridge and swap
        </div>
        <div className="token-section">
          <input 
            className="token-amount-input"
            placeholder="0.0" 
            type="number"
            min="0.000001"
            step="0.000001"
            value={amountIn} 
            onChange={(e) => setAmountIn(e.target.value)} 
            disabled={loading || txState !== "idle"}
          />
          <p className="mt-2 text-xs text-gray-400">Cross-chain transactions may take 20-25 minutes to complete</p>
        </div>
        
        {/* Submit button */}
        <button 
          type="submit" 
          className="action-button"
          disabled={loading || txState !== "idle" || !selectedOption || !amountIn || amountIn === "0" || loadingOptions}
        >
          {loading ? (
            <span className="flex items-center justify-center relative">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : loadingOptions ? (
            "Loading Token Options..."
          ) : txState !== "idle" ? (
            "Transaction in Progress..."
          ) : (
            "Bridge + Swap"
          )}
        </button>
        
        {/* Information about the two-step process */}
        <div className="mt-4 text-xs text-gray-400 p-3 bg-black/30 rounded-md">
          <p className="font-medium mb-1 text-gray-300">About Cross-Chain Bridging:</p>
          <ul className="space-y-1">
            <li>• Bridging has two components: Asset and Message</li>
            <li>• Assets are automatically claimed by the bridge</li>
            <li>• Messages (for swap execution) need manual claiming</li>
            <li>• The claim button will appear after asset bridging completes</li>
          </ul>
        </div>
      </form>
    </div>
  );
}