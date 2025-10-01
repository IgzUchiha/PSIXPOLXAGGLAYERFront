import { NextApiRequest, NextApiResponse } from 'next';
import { claimMessage } from '../../backend/claimMessage';
import { checkTransactionStatus, TransactionState } from './check-transaction-status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bridgeTransactionHash, userAddress } = req.body;

    if (!bridgeTransactionHash) {
      return res.status(400).json({ error: 'Missing bridge transaction hash' });
    }

    if (!userAddress) {
      return res.status(400).json({ error: 'Missing user address' });
    }

    // First check transaction status to determine if message needs to be claimed
    try {
      console.log(`Checking transaction status before claiming message...`);
      const status = await checkTransactionStatus(bridgeTransactionHash, userAddress);
      
      console.log(`Transaction status: ${status.state}`);
      
      // Only proceed with claiming if transaction is in the right state
      if (status.state === TransactionState.PENDING) {
        return res.status(400).json({
          error: 'Transaction is still pending',
          message: 'The transaction is still being processed. Please wait until it is bridged before claiming the message.',
          currentState: status.state
        });
      }
      
      if (status.state === TransactionState.FAILED) {
        return res.status(400).json({
          error: 'Transaction failed',
          message: 'The bridge transaction has failed. Cannot claim message for a failed transaction.',
          currentState: status.state
        });
      }
      
      if (status.state === TransactionState.CLAIMED) {
        return res.status(200).json({
          success: true,
          message: 'Transaction has already been claimed. No further action needed.',
          currentState: status.state,
          destinationTxHash: status.destinationTxHash
        });
      }
      
      // Proceed with claiming if transaction is BRIDGED or READY_TO_CLAIM
      console.log(`Transaction is in state ${status.state}, proceeding with message claim...`);
    } catch (statusError: any) {
      console.warn(`Could not check transaction status: ${statusError.message}`);
      console.log(`Proceeding with message claim attempt anyway...`);
    }

    const result = await claimMessage(bridgeTransactionHash);

    return res.status(200).json({
      success: true,
      messageClaimTxHash: result.txHash,
      receipt: {
        blockNumber: result.receipt.blockNumber,
        transactionHash: result.receipt.transactionHash,
        status: result.receipt.status
      }
    });
  } catch (error: any) {
    console.error("Message claim error:", error);
    
    // Provide more helpful errors based on common failure patterns
    if (error.message?.includes("already claimed") || 
        error.message?.includes("reverted") || 
        error.message?.includes("CALL_EXCEPTION")) {
      return res.status(409).json({
        error: "Message was already claimed",
        message: "This message appears to have been already claimed or the transaction has reverted. This is often normal if the automatic claim process worked.",
        originalError: error.message
      });
    }
    
    if (error.message?.includes("not found") || 
        error.message?.includes("No transaction")) {
      return res.status(404).json({
        error: "Transaction not found",
        message: "The bridge transaction could not be found. Please check that you provided the correct transaction hash and that it has been confirmed on the source chain.",
        originalError: error.message
      });
    }
    
    return res.status(500).json({
      error: "Failed to claim message",
      message: error.message,
      suggestion: "You might want to check the transaction status first to ensure it's ready to be claimed."
    });
  }
}
