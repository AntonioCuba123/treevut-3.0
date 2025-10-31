-- Esquema de base de datos para Treevüt 3.0 Gamificación
-- Este archivo debe ejecutarse en el SQL Editor de Supabase

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    bellotas INTEGER DEFAULT 0,
    purchased_goods JSONB DEFAULT '[]'::jsonb,
    formality_streak INTEGER DEFAULT 0,
    last_formal_expense_date DATE,
    unlocked_badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de desafíos de usuario
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'claimed')),
    current_progress NUMERIC DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Tabla de leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_picture TEXT,
    formality_index NUMERIC NOT NULL,
    rank INTEGER,
    week_start DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_start ON leaderboard(week_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_formality_index ON leaderboard(formality_index DESC);

-- Función para incrementar bellotas de forma atómica
CREATE OR REPLACE FUNCTION increment_bellotas(p_user_id TEXT, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (user_id, bellotas, updated_at)
    VALUES (p_user_id, p_amount, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        bellotas = user_profiles.bellotas + p_amount,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para decrementar bellotas (para compras)
CREATE OR REPLACE FUNCTION decrement_bellotas(p_user_id TEXT, p_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_bellotas INTEGER;
BEGIN
    SELECT bellotas INTO current_bellotas
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    IF current_bellotas IS NULL OR current_bellotas < p_amount THEN
        RETURN FALSE;
    END IF;
    
    UPDATE user_profiles
    SET bellotas = bellotas - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para añadir un bien comprado
CREATE OR REPLACE FUNCTION add_purchased_good(p_user_id TEXT, p_good_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_profiles (user_id, purchased_goods, updated_at)
    VALUES (p_user_id, jsonb_build_array(p_good_id), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        purchased_goods = user_profiles.purchased_goods || jsonb_build_array(p_good_id),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view own challenges" ON user_challenges
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own challenges" ON user_challenges
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own challenges" ON user_challenges
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- El leaderboard es público para lectura
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard
    FOR SELECT USING (true);

-- Solo los usuarios pueden actualizar su propia entrada en el leaderboard
CREATE POLICY "Users can update own leaderboard entry" ON leaderboard
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own leaderboard entry" ON leaderboard
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
