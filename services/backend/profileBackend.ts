import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * Sincroniza el perfil del usuario con el backend de Supabase
 */
export const syncUserProfile = async (
    userId: string,
    bellotas: number,
    purchasedGoods: string[],
    formalityStreak: number,
    lastFormalExpenseDate: string | null,
    unlockedBadges: string[]
): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    try {
        const { error } = await supabase!
            .from('user_profiles')
            .upsert({
                user_id: userId,
                bellotas,
                purchased_goods: purchasedGoods,
                formality_streak: formalityStreak,
                last_formal_expense_date: lastFormalExpenseDate,
                unlocked_badges: unlockedBadges,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id',
            });

        if (error) {
            console.error('Error syncing user profile to Supabase:', error);
            throw error;
        }
    } catch (error) {
        console.error('Failed to sync user profile:', error);
        // No lanzar el error para no interrumpir la experiencia del usuario
    }
};

/**
 * Obtiene el perfil del usuario desde el backend
 */
export const fetchUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) return null;
    try {
        const { data, error } = await supabase!
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile from Supabase:', error);
            return null;
        }

        return {
            bellotas: data.bellotas || 0,
            purchasedGoods: data.purchased_goods || [],
            formalityStreak: data.formality_streak || 0,
            lastFormalExpenseDate: data.last_formal_expense_date,
            unlockedBadges: data.unlocked_badges || [],
        };
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
    }
};

/**
 * Compra un bien virtual y actualiza el perfil del usuario
 */
export const purchaseVirtualGood = async (
    userId: string,
    goodId: string,
    cost: number
): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    try {
        // Intentar decrementar las bellotas
        const { data: decrementResult, error: decrementError } = await supabase!.rpc('decrement_bellotas', {
            p_user_id: userId,
            p_amount: cost,
        });

        if (decrementError) throw decrementError;
        if (!decrementResult) return false; // No hay suficientes bellotas

        // Añadir el bien comprado
        const { error: goodError } = await supabase!.rpc('add_purchased_good', {
            p_user_id: userId,
            p_good_id: goodId,
        });

        if (goodError) throw goodError;

        return true;
    } catch (error) {
        console.error('Failed to purchase virtual good:', error);
        return false;
    }
};
