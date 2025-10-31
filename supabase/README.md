# Configuración de Supabase para Treevüt 3.0

Este directorio contiene el esquema de base de datos y las instrucciones para configurar Supabase como backend de gamificación.

## Pasos de Configuración

### 1. Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta si aún no tienes una
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la clave anónima (anon key)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 3. Ejecutar el Esquema de Base de Datos

1. Abre el SQL Editor en tu proyecto de Supabase
2. Copia y pega el contenido del archivo `schema.sql`
3. Ejecuta el script

Esto creará:
- Tabla `user_profiles` - Perfiles de usuario con bellotas, bienes comprados, rachas y badges
- Tabla `user_challenges` - Desafíos activos, completados y reclamados por usuario
- Tabla `leaderboard` - Clasificación semanal de usuarios
- Funciones auxiliares para operaciones atómicas
- Políticas de seguridad (RLS) para proteger los datos

### 4. Configurar Autenticación (Opcional)

Si deseas usar la autenticación de Supabase en lugar de Firebase:

1. Ve a Authentication > Providers en tu proyecto de Supabase
2. Habilita los proveedores que desees (Google, GitHub, etc.)
3. Actualiza el código de autenticación en `contexts/AuthContext.tsx`

## Estructura de las Tablas

### user_profiles

| Campo | Tipo | Descripción |
|:------|:-----|:------------|
| id | UUID | ID único del registro |
| user_id | TEXT | ID del usuario (de Firebase Auth) |
| bellotas | INTEGER | Moneda virtual del usuario |
| purchased_goods | JSONB | Array de IDs de bienes comprados |
| formality_streak | INTEGER | Racha actual de días con gastos formales |
| last_formal_expense_date | DATE | Última fecha con gasto formal |
| unlocked_badges | JSONB | Array de IDs de badges desbloqueados |

### user_challenges

| Campo | Tipo | Descripción |
|:------|:-----|:------------|
| id | UUID | ID único del registro |
| user_id | TEXT | ID del usuario |
| challenge_id | TEXT | ID del desafío |
| status | TEXT | Estado: 'active', 'completed', 'claimed' |
| current_progress | NUMERIC | Progreso actual del desafío |
| start_date | TIMESTAMP | Fecha de inicio |
| end_date | TIMESTAMP | Fecha de finalización (opcional) |

### leaderboard

| Campo | Tipo | Descripción |
|:------|:-----|:------------|
| id | UUID | ID único del registro |
| user_id | TEXT | ID del usuario |
| user_name | TEXT | Nombre del usuario |
| user_picture | TEXT | URL de la foto del usuario |
| formality_index | NUMERIC | Índice de formalidad del usuario |
| rank | INTEGER | Posición en el ranking |
| week_start | DATE | Fecha de inicio de la semana |

## Funciones Disponibles

### increment_bellotas(user_id, amount)

Incrementa las bellotas de un usuario de forma atómica.

```sql
SELECT increment_bellotas('user123', 50);
```

### decrement_bellotas(user_id, amount)

Decrementa las bellotas de un usuario si tiene suficientes. Retorna `true` si la operación fue exitosa.

```sql
SELECT decrement_bellotas('user123', 100);
```

### add_purchased_good(user_id, good_id)

Añade un bien virtual al inventario del usuario.

```sql
SELECT add_purchased_good('user123', 'vg_pot_gold');
```

## Seguridad

Las tablas están protegidas con Row Level Security (RLS):

- Los usuarios solo pueden ver y modificar sus propios perfiles y desafíos
- El leaderboard es público para lectura, pero los usuarios solo pueden actualizar su propia entrada
- Todas las operaciones requieren autenticación

## Sincronización

El código de la aplicación sincroniza automáticamente:

- Los desafíos se sincronizan después de cada actualización
- El leaderboard se actualiza cuando cambia el índice de formalidad del usuario
- Las bellotas se sincronizan al completar desafíos y realizar compras

## Próximos Pasos

1. Implementar webhooks para notificaciones en tiempo real
2. Añadir analytics para rastrear el engagement
3. Implementar caché local para reducir llamadas a la API
4. Añadir sincronización offline con cola de operaciones
