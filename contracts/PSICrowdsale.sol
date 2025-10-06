// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title PSICrowdsale
 * @dev Simple crowdsale contract for PSI tokens on Cardona
 */
contract PSICrowdsale {
    // The PSI token contract
    IERC20 public token;
    
    // Owner of the crowdsale
    address public owner;
    
    // Price: 1 PSI = 0.001 ETH (or 1000 PSI = 1 ETH)
    uint256 public constant PRICE = 0.001 ether;
    
    // Minimum purchase: 1 PSI token
    uint256 public constant MIN_PURCHASE = 1 ether; // 1 PSI (18 decimals)
    
    // Maximum purchase: 10,000 PSI tokens
    uint256 public constant MAX_PURCHASE = 10000 ether;
    
    // Track total raised
    uint256 public totalRaised;
    
    // Track total tokens sold
    uint256 public totalTokensSold;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event Withdrawal(address indexed owner, uint256 amount);
    event TokensWithdrawn(address indexed owner, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        token = IERC20(_tokenAddress);
        owner = msg.sender;
    }
    
    /**
     * @dev Buy PSI tokens with ETH
     * @param amount The amount of PSI tokens to buy (in wei, 18 decimals)
     */
    function buyTokens(uint256 amount) external payable {
        require(amount >= MIN_PURCHASE, "Amount too small");
        require(amount <= MAX_PURCHASE, "Amount too large");
        
        // Calculate required ETH
        uint256 cost = (amount * PRICE) / 1 ether;
        require(msg.value >= cost, "Insufficient ETH sent");
        
        // Check crowdsale has enough tokens
        uint256 crowdsaleBalance = token.balanceOf(address(this));
        require(crowdsaleBalance >= amount, "Insufficient tokens in crowdsale");
        
        // Transfer tokens to buyer
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        
        // Update stats
        totalRaised += cost;
        totalTokensSold += amount;
        
        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit TokensPurchased(msg.sender, amount, cost);
    }
    
    /**
     * @dev Withdraw ETH from crowdsale (owner only)
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        payable(owner).transfer(balance);
        emit Withdrawal(owner, balance);
    }
    
    /**
     * @dev Withdraw remaining tokens (owner only)
     */
    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        require(token.transfer(owner, balance), "Token transfer failed");
        emit TokensWithdrawn(owner, balance);
    }
    
    /**
     * @dev Get crowdsale token balance
     */
    function getTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev Get ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Calculate cost for a given amount of tokens
     */
    function calculateCost(uint256 amount) external pure returns (uint256) {
        return (amount * PRICE) / 1 ether;
    }
}

