import React, { useState } from 'react';
import { Badge, allBadges, getRarityColor, getRarityName } from '../services/badgeService';

interface BadgeCollectionProps {
    unlockedBadges: string[];
}

const BadgeCard: React.FC<{ badge: Badge; isUnlocked: boolean }> = ({ badge, isUnlocked }) => {
    const rarityColor = getRarityColor(badge.rarity);
    const rarityName = getRarityName(badge.rarity);

    return (
        <div className={`relative bg-surface rounded-xl p-4 transition-all ${isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
            {/* Indicador de rareza */}
            <div className={`absolute top-2 right-2 ${rarityColor} px-2 py-0.5 rounded-full`}>
                <span className="text-xs font-bold text-white">{rarityName}</span>
            </div>

            {/* Icono del badge */}
            <div className="text-center mb-3">
                <div className="text-6xl mb-2">{badge.icon}</div>
                {isUnlocked && (
                    <div className="inline-block bg-primary px-2 py-0.5 rounded-full">
                        <span className="text-xs font-bold text-primary-dark">✓ Desbloqueado</span>
                    </div>
                )}
            </div>

            {/* Información del badge */}
            <h4 className="font-bold text-on-surface text-center mb-1">{badge.name}</h4>
            <p className="text-xs text-on-surface-secondary text-center">{badge.description}</p>

            {/* Candado si no está desbloqueado */}
            {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl opacity-50">🔒</div>
                </div>
            )}
        </div>
    );
};

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ unlockedBadges }) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | Badge['category']>('all');

    const filteredBadges = selectedCategory === 'all' 
        ? allBadges 
        : allBadges.filter(b => b.category === selectedCategory);

    const unlockedCount = allBadges.filter(b => unlockedBadges.includes(b.id)).length;
    const totalCount = allBadges.length;
    const completionPercentage = (unlockedCount / totalCount) * 100;

    return (
        <div className="p-4">
            {/* Header con progreso */}
            <div className="bg-surface rounded-2xl p-4 mb-4">
                <h3 className="text-lg font-bold text-on-surface mb-2">🏅 Colección de Badges</h3>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-on-surface-secondary">Progreso Total</span>
                    <span className="font-bold text-on-surface">{unlockedCount}/{totalCount}</span>
                </div>
                <div className="h-3 w-full bg-active-surface rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Filtros por categoría */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === 'all' 
                            ? 'bg-primary text-primary-dark' 
                            : 'bg-surface text-on-surface-secondary hover:bg-active-surface'
                    }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setSelectedCategory('achievement')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === 'achievement' 
                            ? 'bg-primary text-primary-dark' 
                            : 'bg-surface text-on-surface-secondary hover:bg-active-surface'
                    }`}
                >
                    🎯 Logros
                </button>
                <button
                    onClick={() => setSelectedCategory('mastery')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === 'mastery' 
                            ? 'bg-primary text-primary-dark' 
                            : 'bg-surface text-on-surface-secondary hover:bg-active-surface'
                    }`}
                >
                    🏆 Maestría
                </button>
                <button
                    onClick={() => setSelectedCategory('exploration')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === 'exploration' 
                            ? 'bg-primary text-primary-dark' 
                            : 'bg-surface text-on-surface-secondary hover:bg-active-surface'
                    }`}
                >
                    🧭 Exploración
                </button>
                <button
                    onClick={() => setSelectedCategory('social')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === 'social' 
                            ? 'bg-primary text-primary-dark' 
                            : 'bg-surface text-on-surface-secondary hover:bg-active-surface'
                    }`}
                >
                    👥 Social
                </button>
            </div>

            {/* Grid de badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredBadges.map(badge => (
                    <BadgeCard 
                        key={badge.id}
                        badge={badge}
                        isUnlocked={unlockedBadges.includes(badge.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BadgeCollection;
