import { supabase, SupabaseLeaderboardEntry } from '../../lib/supabase';
import { LeaderboardEntry } from '../../types';

/**
 * Obtiene el leaderboard semanal desde el backend
 */
export const fetchWeeklyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        // Calcular el inicio de la semana actual
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar cuando es domingo
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('week_start', weekStart.toISOString().split('T')[0])
            .order('formality_index', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching leaderboard from Supabase:', error);
            return [];
        }

        // Convertir del formato de Supabase al formato local
        return (data as SupabaseLeaderboardEntry[]).map((entry, index) => ({
            userId: entry.user_id,
            userName: entry.user_name,
            userPicture: entry.user_picture,
            score: entry.formality_index,
            rank: index + 1,
        }));
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        return [];
    }
};

/**
 * Actualiza la entrada del usuario en el leaderboard
 */
export const updateUserLeaderboardEntry = async (
    userId: string,
    userName: string,
    userPicture: string,
    formalityIndex: number
): Promise<void> => {
    try {
        // Calcular el inicio de la semana actual
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);

        const { error } = await supabase
            .from('leaderboard')
            .upsert({
                user_id: userId,
                user_name: userName,
                user_picture: userPicture,
                formality_index: formalityIndex,
                week_start: weekStart.toISOString().split('T')[0],
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,week_start',
            });

        if (error) {
            console.error('Error updating leaderboard entry:', error);
            throw error;
        }
    } catch (error) {
        console.error('Failed to update leaderboard entry:', error);
    }
};
