import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// NOTA: Estas variables deben ser configuradas en las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface SupabaseUserChallenge {
    id: string;
    user_id: string;
    challenge_id: string;
    status: 'active' | 'completed' | 'claimed';
    current_progress: number;
    start_date: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface SupabaseUserProfile {
    id: string;
    user_id: string;
    bellotas: number;
    purchased_goods: string[];
    formality_streak: number;
    last_formal_expense_date?: string;
    unlocked_badges: string[];
    created_at: string;
    updated_at: string;
}

export interface SupabaseLeaderboardEntry {
    user_id: string;
    user_name: string;
    user_picture: string;
    formality_index: number;
    rank: number;
    week_start: string;
}
