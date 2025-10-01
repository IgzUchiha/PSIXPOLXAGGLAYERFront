// src/app/dashboard/examples/aggswap-app/api/swap-tokens.ts
import { ethers } from "ethers";
import RouterAbi from "../abis/UniswapV2Router02.json";
import ERC20Abi from "../abis/ERC-20.json";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract parameters from request
    const { tokenIn, tokenOut, amount, userAddress } = req.body;
    
    if (!tokenIn || !tokenOut || !amount || !userAddress) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Get configuration from environment variables
    const RPC_URL = process.env.NETWORK_0_RPC;
    const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_AGG_UNISWAP_ROUTER_11155111;
    const PRIVATE_KEY = process.env.USER1_PRIVATE_KEY;
    
    if (!RPC_URL || !ROUTER_ADDRESS || !PRIVATE_KEY) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Setup router contract
    const router = new ethers.Contract(ROUTER_ADDRESS, RouterAbi, wallet);
    
    // Approve token spending if needed
    const token = new ethers.Contract(tokenIn, ERC20Abi, wallet);
    
    const amountWei = ethers.parseUnits(amount, 18);
    const allowance = await token.allowance(userAddress, ROUTER_ADDRESS);
    
    if (allowance < amountWei) {
      const approveTx = await token.approve(ROUTER_ADDRESS, amountWei);
      await approveTx.wait();
    }
    
    // Execute swap
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes
    const tx = await router.swapExactTokensForTokens(
      amountWei,                  // amount in
      0,                          // minimum amount out (0 = no slippage protection)
      [tokenIn, tokenOut],        // path
      userAddress,                // recipient
      deadline                    // deadline
    );
    
    const receipt = await tx.wait();
    
    // Return transaction details
    res.status(200).json({
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });
    
  } catch (error: any) {
    console.error("Swap error:", error);
    res.status(500).json({
      error: "Failed to execute swap",
      message: error?.message || "Unknown error"
    });
  }
}