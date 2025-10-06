# 🚀 PSI Crowdsale Deployment Guide

## What You Have

✅ **Crowdsale Contract**: `contracts/PSICrowdsale.sol`
✅ **Deployment Script**: `scripts/deploy-crowdsale.js`
✅ **Hardhat Config**: `hardhat.config.js`

## Deployment Steps

### Option 1: Deploy Using Remix (Easiest!)

1. **Go to Remix IDE**: https://remix.ethereum.org

2. **Create New File**: `PSICrowdsale.sol` and paste the contract from `contracts/PSICrowdsale.sol`

3. **Compile**:
   - Click "Solidity Compiler" tab
   - Select compiler version: `0.8.20`
   - Click "Compile PSICrowdsale.sol"

4. **Deploy**:
   - Click "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - Make sure you're connected to **Cardona Testnet** (Chain ID: 2442)
   - In the "DEPLOY" section, enter your Cardona PSI token address:
     ```
     0x930EFf6A4464C4fA0Bef28dA541343d5E6069767
     ```
   - Click "Deploy"
   - Confirm in MetaMask

5. **Copy Contract Address**:
   - After deployment, copy the contract address
   - Add it to your `.env.local`:
     ```
     CARDONA_CROWDSALE_ADDRESS=0xYourCrowdsaleAddressHere
     ```

### Option 2: Deploy Using Hardhat (Advanced)

1. **Set up .env.local** with your private key:
   ```
   USER1_PRIVATE_KEY=your_private_key_without_0x
   NETWORK_1_RPC=https://rpc.cardona.zkevm-rpc.com
   ```

2. **Compile**:
   ```bash
   npx hardhat compile
   ```

3. **Deploy to Cardona**:
   ```bash
   npx hardhat run scripts/deploy-crowdsale.js --network cardona
   ```

## After Deployment

### 1. Fund the Crowdsale

Transfer PSI tokens to the crowdsale contract:
```
From: Your wallet
To: <Crowdsale Contract Address>
Amount: 100,000 PSI (or however many you want to sell)
```

### 2. Update Frontend

Add the crowdsale address to `.env.local`:
```
CARDONA_CROWDSALE_ADDRESS=0xYourCrowdsaleAddressHere
```

### 3. Test the Crowdsale

- Go to your frontend
- Connect wallet to Cardona
- Try buying PSI tokens!

## Crowdsale Details

- **Price**: 0.001 ETH per PSI token (1000 PSI = 1 ETH)
- **Min Purchase**: 1 PSI
- **Max Purchase**: 10,000 PSI per transaction
- **Network**: Cardona Testnet (Chain ID: 2442)

## Owner Functions

As the contract owner, you can:

1. **Withdraw ETH** raised from sales:
   - Call `withdrawETH()` function

2. **Withdraw Unsold Tokens**:
   - Call `withdrawTokens()` function

## Helpful Links

- **Remix IDE**: https://remix.ethereum.org
- **Cardona Explorer**: https://cardona-zkevm.polygonscan.com/
- **Get Cardona Testnet ETH**: https://faucet.polygon.technology/

## Need Help?

If you run into issues, make sure:
- ✅ You have Cardona testnet ETH for gas
- ✅ MetaMask is connected to Cardona testnet
- ✅ Your token address is correct: `0x930EFf6A4464C4fA0Bef28dA541343d5E6069767`

