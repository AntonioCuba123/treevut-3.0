import React from 'react';
import { User, TreevutLevel } from '../types';
import { CheckIcon } from './Icons';

interface GamificationProgressProps {
    user: User;
}

interface LevelInfo {
    name: string;
    icon: string;
    nextLevel: TreevutLevel | null;
    goals: Partial<Record<keyof User['progress'], number>>;
}

const levelData: Record<TreevutLevel, LevelInfo> = {
    [TreevutLevel.Brote]: {
        name: "Brote Novato",
        icon: "🌱",
        nextLevel: TreevutLevel.Plantón,
        goals: {
            expensesCount: 5,
        }
    },
    [TreevutLevel.Plantón]: {
        name: "Plantón Aspirante",
        icon: "🌳",
        nextLevel: TreevutLevel.Arbusto,
        goals: {
            expensesCount: 15,
            formalityIndex: 60,
        }
    },
    [TreevutLevel.Arbusto]: {
        name: "Arbusto Consciente",
        icon: "🌿",
        nextLevel: TreevutLevel.Roble,
        goals: {
            expensesCount: 40,
            formalityIndex: 75,
        }
    },
    [TreevutLevel.Roble]: {
        name: "Roble Formal",
        icon: "🌲",
        nextLevel: TreevutLevel.Bosque,
        goals: {
            expensesCount: 100,
            formalityIndex: 90,
        }
    },
    [TreevutLevel.Bosque]: {
        name: "Bosque Ancestral",
        icon: "🏞️",
        nextLevel: null,
        goals: {}
    }
};

const GamificationProgress: React.FC<GamificationProgressProps> = ({ user }) => {
    const currentLevelData = levelData[user.level];
    const nextLevelData = currentLevelData.nextLevel ? levelData[currentLevelData.nextLevel] : null;

    if (!currentLevelData) return null;

    const progressItems = nextLevelData 
        ? (Object.keys(nextLevelData.goals) as Array<keyof User['progress']>)
            .map((key) => {
                const targetValue = nextLevelData.goals[key];
                if (targetValue === undefined) return null;

                const currentValue = user.progress[key] || 0;
                const isComplete = currentValue >= targetValue;
                const progressPercentage = Math.min((currentValue / targetValue) * 100, 100);
                
                let text = '';
                if (key === 'expensesCount') text = `Registra ${targetValue} gastos (${currentValue}/${targetValue})`;
                if (key === 'formalityIndex') text = `Alcanza ${targetValue}% de formalidad (${currentValue.toFixed(0)}%/${targetValue}%)`;

                return { key, text, isComplete, progressPercentage };
            })
            .filter(item => item !== null) as { key: string; text: string; isComplete: boolean; progressPercentage: number }[]
        : [];

    const overallProgress = progressItems.length > 0
        ? progressItems.reduce((acc, item) => acc + item.progressPercentage, 0) / progressItems.length
        : 100;

    return (
        <div className="bg-background rounded-2xl p-4 w-full">
            <div className="flex items-center space-x-3">
                <span className="text-4xl">{currentLevelData.icon}</span>
                <div>
                    <p className="text-sm text-on-surface-secondary">Tu Nivel Actual</p>
                    <h3 className="text-lg font-bold text-primary">{currentLevelData.name}</h3>
                </div>
            </div>
            
            {nextLevelData && (
                 <div className="mt-4">
                    <div className="flex justify-between items-center text-xs text-on-surface-secondary mb-1">
                        <span>Progreso a <span className="font-bold">{nextLevelData.name}</span></span>
                        <span>{overallProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-active-surface rounded-full">
                        <div
                            className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}
            
            {progressItems.length > 0 && (
                <div className="mt-4 space-y-2">
                    {progressItems.map(item => (
                        <div key={item.key} className="flex items-center text-sm">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${item.isComplete ? 'bg-primary' : 'border-2 border-active-surface'}`}>
                                {item.isComplete && <CheckIcon className="w-3 h-3 text-primary-dark" />}
                            </div>
                            <span className={item.isComplete ? 'text-on-surface-secondary line-through' : 'text-on-surface'}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            
            {user.level === TreevutLevel.Bosque && (
                 <p className="mt-4 text-center text-yellow-400 font-semibold">¡Felicidades! Has alcanzado el máximo nivel de maestría financiera en treev<span className="text-danger">ü</span>t.</p>
            )}
        </div>
    );
};

export default GamificationProgress;