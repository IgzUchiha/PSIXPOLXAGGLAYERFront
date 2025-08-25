# Cross-Chain Swap Design Pattern ( WIP )

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