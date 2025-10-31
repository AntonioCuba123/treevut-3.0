import React from 'react';
import { StreakData, getNextMilestone, STREAK_MILESTONES } from '../services/streakService';

interface StreakTrackerProps {
    streakData: StreakData;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ streakData }) => {
    const nextMilestone = getNextMilestone(streakData.currentStreak);
    const progressToNext = nextMilestone 
        ? (streakData.currentStreak / nextMilestone.days) * 100 
        : 100;

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🔥 Racha de Formalidad</h3>
                {streakData.currentStreak > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-2xl font-bold">{streakData.currentStreak}</span>
                        <span className="text-sm ml-1">días</span>
                    </div>
                )}
            </div>

            {streakData.currentStreak === 0 ? (
                <div className="text-center py-4">
                    <p className="text-white/90 mb-2">¡Comienza tu racha hoy!</p>
                    <p className="text-sm text-white/70">Registra un gasto formal para iniciar tu camino hacia las recompensas.</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/90">Progreso al siguiente hito</span>
                            {nextMilestone && (
                                <span className="font-bold">{nextMilestone.days} días</span>
                            )}
                        </div>
                        <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressToNext}%` }}
                            ></div>
                        </div>
                    </div>

                    {nextMilestone && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm">{nextMilestone.name}</p>
                                    <p className="text-xs text-white/70">Faltan {nextMilestone.days - streakData.currentStreak} días</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-yellow-300">{nextMilestone.reward}</p>
                                    <p className="text-xs text-white/70">bellotas</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-white/70">Racha más larga</p>
                            <p className="font-bold text-lg">{streakData.longestStreak} días</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/70">Última actividad</p>
                            <p className="font-bold text-sm">
                                {streakData.lastFormalExpenseDate 
                                    ? new Date(streakData.lastFormalExpenseDate).toLocaleDateString('es-ES', { 
                                        day: 'numeric', 
                                        month: 'short' 
                                    })
                                    : 'Nunca'}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Mostrar hitos alcanzados */}
            {streakData.currentStreak > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs text-white/70 mb-2">Hitos Alcanzados</p>
                    <div className="flex flex-wrap gap-2">
                        {STREAK_MILESTONES.filter(m => m.days <= streakData.currentStreak).map(milestone => (
                            <div 
                                key={milestone.days}
                                className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold"
                                title={`${milestone.name} - ${milestone.reward} bellotas`}
                            >
                                ✓ {milestone.days}d
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreakTracker;
