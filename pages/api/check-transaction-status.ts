import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Transaction states
export enum TransactionState {
  PENDING = "PENDING",
  BRIDGED = "BRIDGED", 
  READY_TO_CLAIM = "READY_TO_CLAIM",
  CLAIMED = "CLAIMED",
  FAILED = "FAILED"
}

interface TransactionStatus {
  state: TransactionState;
  destinationTxHash?: string;
  details?: any;
}

// Cache to store latest transaction status to reduce API calls
const statusCache: Record<string, { 
  status: TransactionStatus, 
  lastChecked: number 
}> = {};

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { txHash, address } = req.query;

  if (!txHash || !address) {
    return res.status(400).json({ error: 'Missing txHash or address parameter' });
  }

  try {
    const status = await checkTransactionStatus(
      txHash as string, 
      address as string
    );
    
    return res.status(200).json(status);
  } catch (error: any) {
    console.error("Error checking transaction status:", error);
    return res.status(500).json({
      error: 'Failed to check transaction status',
      message: error.message
    });
  }
}

/**
 * Checks the transaction status using the Polygon API
 */
export async function checkTransactionStatus(
  txHash: string,
  userAddress: string
): Promise<TransactionStatus> {
  // Check cache first
  const cacheKey = `${txHash}_${userAddress}`;
  const cachedStatus = statusCache[cacheKey];
  const now = Date.now();
  
  // Return cached result if still valid and transaction is already CLAIMED
  if (cachedStatus && 
      (now - cachedStatus.lastChecked < CACHE_TTL || 
       cachedStatus.status.state === TransactionState.CLAIMED)) {
    return cachedStatus.status;
  }
  
  console.log(`Checking status for transaction ${txHash} for user ${userAddress}...`);
  
  // Get API key from environment variable
  const apiKey = process.env.POLYGON_API_KEY || 'polygonag_blBuB1pgP8A30E4BEQGbhk_NQRUGw3cL';
  
  try {
    // Fetch transaction status from API
    const response = await axios.get(
      `https://api-gateway.polygon.technology/api/v3/transactions/testnet`,
      {
        params: {
          userAddress: userAddress,
        },
        headers: {
          'x-api-key': apiKey
        }
      }
    );
    
    if (!response.data.success) {
      throw new Error("API returned unsuccessful response");
    }
    
    const transactions = response.data.result;
    
    // Find the specific transaction we're looking for
    const transaction = transactions.find((tx: any) => 
      tx.transactionHash.toLowerCase() === txHash.toLowerCase()
    );
    
    if (!transaction) {
      console.log(`Transaction ${txHash} not found in response. It might still be processing.`);
      
      // If not found, check if we've already seen it before
      if (cachedStatus) {
        return cachedStatus.status;
      }
      
      // Otherwise, mark as pending
      const pendingStatus = { state: TransactionState.PENDING };
      statusCache[cacheKey] = { status: pendingStatus, lastChecked: now };
      return pendingStatus;
    }
    
    // Determine the transaction state based on the status
    let state: TransactionState;
    let destinationTxHash: string | undefined;
    
    switch (transaction.status) {
      case "CLAIMED":
        state = TransactionState.CLAIMED;
        destinationTxHash = transaction.claimTransactionHash;
        break;
      case "READY_TO_CLAIM":
        state = TransactionState.READY_TO_CLAIM;
        break;
      case "BRIDGED":
        state = TransactionState.BRIDGED;
        break;
      case "FAILED":
        state = TransactionState.FAILED;
        break;
      default:
        state = TransactionState.PENDING;
    }
    
    // Format a response with useful information
    const status: TransactionStatus = {
      state,
      destinationTxHash,
      details: {
        sourceNetwork: transaction.sourceNetwork,
        destinationNetwork: transaction.destinationNetwork,
        timestamp: transaction.timestamp,
        amount: transaction.amounts[0],
        tokenAddress: transaction.originTokenAddress,
        claimTimestamp: transaction.claimTransactionTimestamp
      }
    };
    
    // Cache the status
    statusCache[cacheKey] = { status, lastChecked: now };
    
    console.log(`Transaction ${txHash} status: ${state}`);
    return status;
  } catch (error: any) {
    console.error(`Error fetching transaction status: ${error.message}`);
    
    // If we have a cached status, return it as fallback
    if (cachedStatus) {
      return cachedStatus.status;
    }
    
    // Otherwise, rethrow the error
    throw error;
  }
} 