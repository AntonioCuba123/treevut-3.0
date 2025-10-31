import { supabase, SupabaseUserChallenge } from '../../lib/supabase';
import { UserChallenge, ChallengeStatus } from '../../types';

/**
 * Sincroniza los desafíos del usuario con el backend de Supabase
 */
export const syncUserChallenges = async (userId: string, challenges: UserChallenge[]): Promise<void> => {
    try {
        // Convertir desafíos locales al formato de Supabase
        const supabaseChallenges = challenges.map(challenge => ({
            user_id: userId,
            challenge_id: challenge.challengeId,
            status: challenge.status,
            current_progress: challenge.currentProgress,
            start_date: challenge.startDate,
            end_date: challenge.endDate,
            updated_at: new Date().toISOString(),
        }));

        // Upsert (insertar o actualizar) en Supabase
        const { error } = await supabase
            .from('user_challenges')
            .upsert(supabaseChallenges, {
                onConflict: 'user_id,challenge_id',
            });

        if (error) {
            console.error('Error syncing challenges to Supabase:', error);
            throw error;
        }
    } catch (error) {
        console.error('Failed to sync challenges:', error);
        // No lanzar el error para no interrumpir la experiencia del usuario
    }
};

/**
 * Obtiene los desafíos del usuario desde el backend
 */
export const fetchUserChallenges = async (userId: string): Promise<UserChallenge[]> => {
    try {
        const { data, error } = await supabase
            .from('user_challenges')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching challenges from Supabase:', error);
            return [];
        }

        // Convertir del formato de Supabase al formato local
        return (data as SupabaseUserChallenge[]).map(challenge => ({
            challengeId: challenge.challenge_id,
            status: challenge.status as ChallengeStatus,
            currentProgress: challenge.current_progress,
            startDate: challenge.start_date,
            endDate: challenge.end_date,
        }));
    } catch (error) {
        console.error('Failed to fetch challenges:', error);
        return [];
    }
};

/**
 * Marca un desafío como reclamado y otorga las bellotas al usuario
 */
export const claimChallengeReward = async (
    userId: string,
    challengeId: string,
    rewardBellotas: number
): Promise<boolean> => {
    try {
        // Iniciar una transacción
        const { error: challengeError } = await supabase
            .from('user_challenges')
            .update({ status: 'claimed', updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('challenge_id', challengeId);

        if (challengeError) throw challengeError;

        // Actualizar las bellotas del usuario
        const { error: profileError } = await supabase.rpc('increment_bellotas', {
            p_user_id: userId,
            p_amount: rewardBellotas,
        });

        if (profileError) throw profileError;

        return true;
    } catch (error) {
        console.error('Failed to claim challenge reward:', error);
        return false;
    }
};
