import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboardData } from '../services/socialService';
import { TrophyIcon, ShareIcon } from './Icons';

const LeaderboardCard: React.FC<{ entry: LeaderboardEntry, isCurrentUser: boolean }> = ({ entry, isCurrentUser }) => {
    return (
        <div className={`flex items-center p-3 rounded-xl ${isCurrentUser ? 'bg-primary-dark' : 'bg-background'}`}>
            <span className={`font-bold text-lg w-8 text-center ${isCurrentUser ? 'text-white' : 'text-on-surface-secondary'}`}>{entry.rank}</span>
            <img src={entry.userPicture || '/default-avatar.png'} alt={entry.userName} className="w-10 h-10 rounded-full mx-3"/>
            <span className={`font-semibold flex-grow ${isCurrentUser ? 'text-white' : 'text-on-surface'}`}>{entry.userName}</span>
            <span className={`font-bold text-primary ${isCurrentUser ? 'text-yellow-300' : ''}`}>{entry.score.toFixed(1)}%</span>
        </div>
    );
};

const CommunityForest: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        setLeaderboard(getLeaderboardData());
    }, []);

    const currentUser = leaderboard.find(u => u.userName === 'Tu');

    return (
        <div className="p-4">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-on-surface">🌳 Bosque Comunitario 🌳</h3>
                <p className="text-on-surface-secondary mt-1">Compite con otros ahorradores y haz crecer tu árbol más rápido.</p>
            </div>

            <div className="bg-surface rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-on-surface flex items-center"><TrophyIcon className="w-5 h-5 mr-2 text-primary"/>Leaderboard Semanal</h4>
                    <button className="flex items-center space-x-2 bg-primary text-primary-dark px-3 py-1.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                        <ShareIcon className="w-4 h-4"/>
                        <span>Compartir</span>
                    </button>
                </div>
                <div className="space-y-2">
                    {leaderboard.map(entry => (
                        <LeaderboardCard key={entry.userId} entry={entry} isCurrentUser={entry.userName === 'Tu'} />
                    ))}
                </div>
            </div>

            {currentUser && (
                 <div className="mt-6 text-center bg-primary-dark/20 border border-primary-dark rounded-2xl p-4">
                    <h4 className="font-bold text-primary">¡Sigue así!</h4>
                    <p className="text-on-surface-secondary text-sm mt-1">Estás en el puesto <span className="font-bold text-on-surface">#{currentUser.rank}</span>. ¡Un pequeño esfuerzo más y subirás en el ranking!</p>
                </div>
            )}
        </div>
    );
};

export default CommunityForest;
