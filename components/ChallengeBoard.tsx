import React from 'react';
import { Challenge, UserChallenge, ChallengeStatus } from '../types';
import { allChallenges } from '../services/challengeService';
import { CheckIcon, LockClosedIcon } from './Icons';

interface ChallengeBoardProps {
    // En el futuro, pasaríamos los desafíos activos del usuario
}

const ChallengeCard: React.FC<{ challenge: Challenge, isCompleted: boolean }> = ({ challenge, isCompleted }) => {
    const progress = isCompleted ? 100 : Math.floor(Math.random() * 80); // Placeholder progress

    return (
        <div className={`bg-background rounded-2xl p-4 flex items-start space-x-4 ${isCompleted ? 'opacity-60' : ''}`}>
            <div className="text-4xl mt-1">{challenge.icon}</div>
            <div className="flex-grow">
                <h4 className={`font-bold text-on-surface ${isCompleted ? 'line-through' : ''}`}>{challenge.title}</h4>
                <p className="text-xs text-on-surface-secondary mt-1">{challenge.description}</p>
                <div className="mt-3">
                    <div className="flex justify-between items-center text-xs text-on-surface-secondary mb-1">
                        <span>Progreso</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-active-surface rounded-full">
                        <div
                            className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                {isCompleted ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary">
                        <CheckIcon className="w-6 h-6 text-primary-dark" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-active-surface">
                        <p className="font-bold text-primary text-sm">{challenge.rewardBellotas}🌰</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChallengeBoard: React.FC<ChallengeBoardProps> = () => {
    // Simulación: Algunos desafíos ya completados
    const completedChallenges = ['onboarding_1'];

    const onceChallenges = allChallenges.filter(c => c.frequency === 'once');
    const weeklyChallenges = allChallenges.filter(c => c.frequency === 'weekly');
    const monthlyChallenges = allChallenges.filter(c => c.frequency === 'monthly');

    return (
        <div className="p-4 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Desafíos de Inicio</h3>
                <div className="space-y-3">
                    {onceChallenges.map(challenge => (
                        <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            isCompleted={completedChallenges.includes(challenge.id)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Desafíos Semanales</h3>
                <div className="space-y-3">
                    {weeklyChallenges.map(challenge => (
                        <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            isCompleted={false} // Placeholder
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Desafíos Mensuales</h3>
                <div className="space-y-3">
                    {monthlyChallenges.map(challenge => (
                        <ChallengeCard 
                            key={challenge.id} 
                            challenge={challenge} 
                            isCompleted={false} // Placeholder
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChallengeBoard;
