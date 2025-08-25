Cross-Chain Swap Design Pattern ( WIP )

> **🚧 WORK IN PROGRESS**
>
> **Note:** This repository is a work-in-progress (WIP). Core implementation and documentation are being finalized and the repository will be ready for full use soon.

## Overview

EggSwap is an **educational cross-chain swap platform** that demonstrates how to bridge tokens from one blockchain and execute swaps on another using **Agglayer's Unified Bridge**. It enables seamless token transfers between Sepolia and Cardona with automatic swap execution on the destination chain.

### Core Capabilities

| Feature | Description | Example |
|---------|-------------|---------|
| **Cross-Chain Swapping** | Bridge tokens and execute swaps atomically | TOKEN_A on Sepolia → TOKEN_B on Cardona |
| **Automatic Execution** | Swap executes automatically upon token arrival | Bridge + swap in single user transaction |
| **Bi-directional Support** | Works in both directions between chains | Sepolia ↔ Cardona |
| **Pre-approval System** | Smart contract permissions for seamless UX | Bridge executor approval management |

***

## Table of Contents

1. [Application Architecture](#1-application-architecture)
2. [API Layer Components](#2-api-layer-components)
3. [Backend Service Implementation](#3-backend-service-implementation)
4. [Bridge Integration Strategy](#4-bridge-integration-strategy)
5. [Smart Contract Integration](#5-smart-contract-integration)
6. [Component Architecture](#6-component-architecture)
7. [Configuration Management](#7-configuration-management)
8. [Error Handling & Resilience](#8-error-handling--resilience)
9. [Troubleshooting Guide](#9-troubleshooting-guide)

***

## 1. Application Architecture

### 1.1 Flow Process

**User Journey**: Select Tokens → Bridge & Swap → Verify

1. **Token Selection** - Choose source and destination tokens
2. **Amount Input** - Specify swap amount and calculate estimates
3. **Pre-approval** - Ensure contract permissions on destination
4. **Bridge & Call** - Submit bridge transaction with swap calldata
5. **Automatic Execution** - Swap executes on destination chain
6. **Status Monitoring** - Track transaction and bridge status

### 1.2 Two-Step Execution Model

```
Source Chain: Lock Tokens → Bridge Message
    ↓
Agglayer Bridge: Transport Assets + Calldata
    ↓
Destination Chain: Mint Tokens → Execute Swap
```

***

## 2. API Layer Components

### 2.1 Cross-Chain Swap Endpoint
**File**: `api/cross-chain-swap.ts`

**Purpose**: Primary orchestration endpoint for cross-chain operations

#### 2.1.1 Request Flow
```
1. Validate Parameters
2. Determine Token Routes
3. Calculate Swap Paths
4. Execute Bridge & Call
5. Return Transaction Hash
```

### 2.2 Swap Tokens Endpoint
**File**: `api/swap-tokens.ts`

**Purpose**: Local chain swap execution and estimation

#### 2.2.1 Core Functions
- Gas estimation for swap operations
- Slippage calculation
- Route optimization

### 2.3 Transaction Status Endpoint
**File**: `api/check-transaction-status.ts`

**Purpose**: Real-time transaction monitoring

#### 2.3.1 Monitoring Capabilities
- Transaction receipt polling
- Bridge status tracking
- Error detection and reporting
- Progress state management

### 2.4 Message Claiming Endpoint
**File**: `api/claim-message.ts`

**Purpose**: Manual bridge message claiming when required

### 2.5 Token Options Endpoint
**File**: `api/token-options.ts`

**Purpose**: Token metadata and configuration management

***

## 3. Backend Service Implementation

### 3.1 Chain Swap Service
**File**: `backend/chainSwap.ts`

**Purpose**: Core implementation for cross-chain swap orchestration

#### 3.1.1 Key Responsibilities
- Token configuration management
- Pre-approval system coordination
- Swap calldata generation
- Bridge transaction execution
- RPC resilience implementation

#### 3.1.2 Pre-Approval System
```typescript
// Critical approval chain
1. Approve Bridge Executor → Token spending rights
2. Approve Router → Swap execution rights
3. Execute Bridge & Call → Atomic operation
```

### 3.2 Cross-Chain Swap Orchestrator
**File**: `backend/crossChainSwap.ts`

**Purpose**: High-level coordinator for bridge operations

#### 3.2.1 Orchestration Flow
```
Input Validation → Route Calculation → Bridge Preparation → Execution → Monitoring
```

### 3.3 Message Claim Handler
**File**: `backend/claimMessage.ts`

**Purpose**: Bridge message finalization logic

### 3.4 LxLy Utilities
**File**: `backend/utils_lxly.ts`

**Purpose**: Agglayer bridge client integration utilities

#### 3.4.1 Core Functions
- LxLy client initialization
- Bridge parameter configuration
- Message encoding utilities
- Status polling helpers

***

## 4. Bridge Integration Strategy

### 4.1 Agglayer LxLy Integration
**Pattern**: Bridge & Call Architecture

#### 4.1.1 Message Flow
| Phase | Location | Action |
|-------|----------|--------|
| **Prepare** | Source Chain | Create swap calldata for destination |
| **Bridge** | Bridge Layer | Lock tokens and send message |
| **Execute** | Destination | Mint tokens and execute swap |

### 4.2 Bridge & Call Implementation

```typescript
// Core bridge operation
await client.bridgeExtensions[sourceNetworkId].bridgeAndCall(
  sourceTokenAddress,
  amount,
  destinationNetworkId,
  routerAddress,
  userAddress,
  swapCalldata,
  forceUpdateGlobalExitRoot,
  permitData
);
```

### 4.3 Calldata Generation

```typescript
// Swap instruction encoding
const iface = new ethers.Interface(RouterAbi);
const calldata = iface.encodeFunctionData("swapExactTokensForTokens", [
  amountInWei,
  minAmountOut.toString(),
  swapPath,
  userAddress,
  deadline
]);
```

***

## 5. Smart Contract Integration

### 5.1 Token Configuration
**Networks**: Sepolia (Network 0), Cardona (Network 1)

```typescript
const TOKENS = {
  0: {  // Sepolia
    TOKEN_A: "0x794203e2982EDA39b4cfC3e1F802D6ab635FcDcB",
    TOKEN_B: "0x5eE2DeAd28817153F6317a3A21F1e8609da0c498"
  },
  1: {  // Cardona
    TOKEN_A: "0x19956fa010ECAeA67bd8eAa91b18A0026F1c31D7",
    TOKEN_B: "0xD6395Ee1b7DFDB64ba691fdB5B71b3624F168C4C"
  }
};
```

### 5.2 Router Integration
**Purpose**: Uniswap-compatible swap execution

#### 5.2.1 Core Functions
- `swapExactTokensForTokens` - Execute token swaps
- `getAmountsOut` - Calculate swap outputs
- `addLiquidity` - Liquidity provision

### 5.3 Bridge Executor Permissions

```solidity
// Required approvals for cross-chain swaps
token.approve(bridgeExecutorAddress, maxAmount);
token.approve(routerAddress, maxAmount);
```

***

## 6. Component Architecture

### 6.1 Core UI Components

| Component | File | Purpose |
|-----------|------|---------|
| **CrossChainSwapForm** | `components/CrossChainSwapForm.tsx` | Main swap interface |
| **SwapForm** | `components/SwapForm.tsx` | Local swap operations |
| **LiquidityForm** | `components/LiquidityForm.tsx` | Liquidity management |

### 6.2 Component Responsibilities

#### 6.2.1 CrossChainSwapForm
- Token selection interface
- Amount input and validation
- Cross-chain route calculation
- Transaction status monitoring
- Error handling and user feedback

#### 6.2.2 SwapForm
- Single-chain swap operations
- Slippage configuration
- Gas estimation display

#### 6.2.3 LiquidityForm
- Add/remove liquidity operations
- Pool information display
- Yield calculation

***

## 7. Configuration Management

### 7.1 Environment Variables

```bash
# RPC Configuration
NETWORK_0_RPC=<sepolia_rpc_url>
NETWORK_1_RPC=<cardona_rpc_url>

# Bridge Addresses
NETWORK_0_BRIDGE=<sepolia_bridge_address>
NETWORK_1_BRIDGE=<cardona_bridge_address>

# Signer Configuration
USER1_PRIVATE_KEY=<server_signer_key>
```

### 7.2 Network Configuration

```typescript
const configuration = {
  0: {  // Sepolia
    rpcUrl: process.env.NETWORK_0_RPC,
    bridgeAddress: process.env.NETWORK_0_BRIDGE,
    bridgeExtensionAddress: "0x...",
    routerAddress: "0x..."
  },
  1: {  // Cardona
    rpcUrl: process.env.NETWORK_1_RPC,
    bridgeAddress: process.env.NETWORK_1_BRIDGE,
    bridgeExtensionAddress: "0x...",
    routerAddress: "0x..."
  }
};
```

***
