"use client";
import { useState } from "react";
import { parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { AggswapService } from "../lib/aggswapService";
import { BrowserProvider } from "ethers";

export function LiquidityForm() {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amountA, setAmountA] = useState("0");
  const [amountB, setAmountB] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const { data: walletClient } = useWalletClient();

  const service = AggswapService.use();
  
  async function handleAddLiquidity() {
    if (!walletClient) return;
    setIsLoading(true);
    setAddSuccess(false);
    
    try {
      const provider = new BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      
      await service.addLiquidity({
        tokenA,
        tokenB,
        amountADesired: parseUnits(amountA, 18),
        amountBDesired: parseUnits(amountB, 18),
        walletClient: signer,
      });
      
      setAddSuccess(true);
      // Reset form after successful add
      setAmountA("0");
      setAmountB("0");
    } catch (err) {
      console.error(err);
      alert("Add liquidity failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">Add Liquidity</h3>
        <p className="text-sm text-gray-500">Provide liquidity to earn fees</p>
      </div>
      <div className="card-body">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAddLiquidity(); }} 
          className="space-y-3"
        >
          <div className="form-group">
            <label htmlFor="tokenA" className="form-label">Token A</label>
            <input
              id="tokenA"
              type="text"
              className="input"
              placeholder="Token A address"
              value={tokenA} 
              onChange={(e) => setTokenA(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amountA" className="form-label">Amount A</label>
            <input
              id="amountA"
              type="text"
              className="input"
              placeholder="0.0"
              value={amountA} 
              onChange={(e) => setAmountA(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tokenB" className="form-label">Token B</label>
            <input
              id="tokenB"
              type="text"
              className="input"
              placeholder="Token B address"
              value={tokenB} 
              onChange={(e) => setTokenB(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amountB" className="form-label">Amount B</label>
            <input
              id="amountB"
              type="text"
              className="input"
              placeholder="0.0"
              value={amountB} 
              onChange={(e) => setAmountB(e.target.value)}
              required
            />
          </div>
          
          {addSuccess && (
            <div className="py-2 px-3 bg-[#f0fdf4] rounded text-sm text-[#166534]">
              Liquidity added successfully!
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={isLoading || !tokenA || !tokenB || !amountA || amountA === "0" || !amountB || amountB === "0" || !walletClient}
          >
            {!walletClient ? "Connect Wallet" : isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : "Add Liquidity"}
          </button>
        </form>
      </div>
    </div>
  );
}