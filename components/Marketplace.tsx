import React from 'react';
import { VirtualGood } from '../types';
import { allVirtualGoods } from '../services/marketService';
import { CheckIcon } from './Icons';

interface MarketplaceProps {
    userBellotas: number;
    purchasedGoods: string[];
    onPurchase: (goodId: string, price: number) => void;
}

const GoodCard: React.FC<{ good: VirtualGood, isPurchased: boolean, canAfford: boolean, onPurchase: () => void }> = ({ good, isPurchased, canAfford, onPurchase }) => {
    return (
        <div className={`bg-background rounded-2xl p-4 flex flex-col items-center text-center transition-opacity ${isPurchased ? 'opacity-50' : ''}`}>
            <div className="text-6xl mb-2">{good.icon}</div>
            <h4 className="font-bold text-on-surface text-md">{good.name}</h4>
            <p className="text-xs text-on-surface-secondary mt-1 flex-grow">{good.description}</p>
            <button 
                onClick={onPurchase}
                disabled={isPurchased || !canAfford}
                className={`w-full mt-4 py-2 px-4 rounded-lg font-bold text-sm transition-colors ${isPurchased 
                    ? 'bg-active-surface text-on-surface-secondary cursor-not-allowed'
                    : canAfford 
                        ? 'bg-primary text-primary-dark hover:opacity-90'
                        : 'bg-surface text-on-surface-secondary cursor-not-allowed'}`}>
                {isPurchased ? 'Adquirido' : `${good.price} 🌰`}
            </button>
        </div>
    );
};

const Marketplace: React.FC<MarketplaceProps> = ({ userBellotas, purchasedGoods, onPurchase }) => {
    return (
        <div className="p-4">
            <div className="bg-surface rounded-2xl p-4 mb-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-on-surface">El Mercado Treevüt</h3>
                <div className="flex items-center space-x-2 bg-background px-3 py-1.5 rounded-full">
                    <span className="text-lg font-bold text-yellow-400">{userBellotas}</span>
                    <span className="text-2xl">🌰</span>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allVirtualGoods.map(good => (
                    <GoodCard 
                        key={good.id}
                        good={good}
                        isPurchased={purchasedGoods.includes(good.id)}
                        canAfford={userBellotas >= good.price}
                        onPurchase={() => onPurchase(good.id, good.price)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
