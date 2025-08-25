import { getLxLyClient, tokens, configuration } from './utils_lxly';

/**
 * Claims a bridge message on the destination chain
 * This is needed because the auto-claimer only handles the asset, not the message
 */
export async function claimMessage(bridgeTransactionHash: string): Promise<{
  txHash: string;
  receipt: any;
}> {
  console.log(`
=================================================================
            CLAIMING BRIDGE MESSAGE ON CARDONA
=================================================================
Bridge Transaction Hash: ${bridgeTransactionHash}
=================================================================`);

  try {
    console.log("1. Initializing LxLy client...");
    const client = await getLxLyClient();
    console.log("✅ LxLy client initialized successfully");
    
    // Network IDs
    const sourceNetworkId = 0; // Sepolia
    const destinationNetworkId = 1; // Cardona
    const bridgeIndex = 1; // Bridge index for message
    
    console.log(`2. Building payload for claim from transaction ${bridgeTransactionHash}...`);
    
    // Build payload and claim the message
    try {
      const payload = await client.bridgeUtil.buildPayloadForClaim(
        bridgeTransactionHash, 
        sourceNetworkId, 
        bridgeIndex
      );
      
      console.log("3. Payload built successfully with properties:");
      console.log("- smtProof length:", payload.smtProof ? payload.smtProof.length : "undefined");
      console.log("- smtProofRollup length:", payload.smtProofRollup ? payload.smtProofRollup.length : "undefined");
      console.log("- globalIndex:", payload.globalIndex ? payload.globalIndex.toString() : "undefined");
      console.log("- mainnetExitRoot:", payload.mainnetExitRoot ? payload.mainnetExitRoot.substring(0, 10) + "..." : "undefined");
      console.log("- rollupExitRoot:", payload.rollupExitRoot ? payload.rollupExitRoot.substring(0, 10) + "..." : "undefined");
      console.log("- originNetwork:", payload.originNetwork);
      console.log("- originTokenAddress:", payload.originTokenAddress);
      console.log("- destinationNetwork:", payload.destinationNetwork);
      console.log("- destinationAddress:", payload.destinationAddress);
      console.log("- amount:", payload.amount);
      console.log("- metadata length:", payload.metadata ? payload.metadata.length : "undefined");
      console.log("- depositCount:", payload.depositCount !== undefined ? payload.depositCount : "undefined");
      
      console.log("4. Claiming message with payload...");
      const result = await client.bridges[destinationNetworkId].claimMessage(
        payload.smtProof,
        payload.smtProofRollup,
        payload.globalIndex.toString(),
        payload.mainnetExitRoot,
        payload.rollupExitRoot,
        payload.originNetwork,
        payload.originTokenAddress,
        payload.destinationNetwork,
        payload.destinationAddress,
        payload.amount,
        payload.metadata,
        payload.depositCount || 0
      );

      console.log("5. Getting transaction hash...");
      const txHash = await result.getTransactionHash();
      console.log(`✅ Message claim transaction submitted: ${txHash}`);
      console.log(`Transaction Explorer: https://explorer.cardona.zkevm-rpc.com/tx/${txHash}`);
      
      console.log("6. Waiting for transaction receipt...");
      const receipt = await result.getReceipt();
      console.log(`✅ Message claim confirmed in block ${receipt.blockNumber}!`);
      
      // Return transaction details
      return { 
        txHash, 
        receipt
      };
    } catch (payloadError: any) {
      console.error("❌ Error during payload building or message claim:", payloadError);
      console.log("Error type:", typeof payloadError);
      
      if (payloadError instanceof Error) {
        console.log("Standard Error instance detected");
      }
      
      // Check for specific error types
      if (payloadError.response) {
        console.error("API Response Error:", {
          status: payloadError.response.status,
          data: payloadError.response.data
        });
      }
      
      // Re-throw with more context
      throw payloadError;
    }
  } catch (error: any) {
    console.error(`❌ Message claim error:`, error);
    
    // Enhanced error logging
    if (error.code) console.error("Error code:", error.code);
    if (error.reason) console.error("Error reason:", error.reason);
    if (error.data) console.error("Error data:", error.data);
    if (error.stack) console.error("Error stack:", error.stack);
    
    // Check if transaction might have reverted
    if (error.code === "CALL_EXCEPTION" || 
        error.code === "UNPREDICTABLE_GAS_LIMIT" ||
        (error.message && error.message.includes("reverted"))) {
      console.error("Transaction likely reverted. This could mean the message was already claimed.");
    }
    
    // Improved error handling when message is undefined
    const errorMessage = error.message || 
                        error.reason || 
                        (typeof error === 'string' ? error : 'Unknown error');
    
    throw new Error(`Failed to claim message: ${errorMessage}`);
  }
}
