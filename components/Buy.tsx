import { useState } from 'react';
import { ethers } from 'ethers';

interface BuyProps {
  provider: any;
  price: number;
  crowdsale: any;
  setIsLoading: (loading: boolean) => void;
}

const Buy = ({ provider, price, crowdsale, setIsLoading }: BuyProps) => {
  const [amount, setAmount] = useState('0');
  const [isWaiting, setIsWaiting] = useState(false);

  const buyHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaiting(true);

    try {
      const signer = await provider.getSigner();

      // Calculate the required ETH to buy the tokens
      const value = ethers.parseUnits((Number(amount) * price).toString(), 'ether');
      const formattedAmount = ethers.parseUnits(amount.toString(), 'ether');

      const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: value });
      await transaction.wait();
    } catch {
      window.alert('User rejected or transaction reverted');
    }

    setIsWaiting(false);
    setIsLoading(true);
  };

  return (
    <form onSubmit={buyHandler} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="flex-1 px-6 py-4 bg-purple-900/50 backdrop-blur-sm border-2 border-purple-600 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
      />
      <button
        type="submit"
        disabled={isWaiting}
        className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white text-xl font-bold hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isWaiting ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Buying...</span>
          </div>
        ) : (
          'Buy Tokens'
        )}
      </button>
    </form>
  );
};

export default Buy;

