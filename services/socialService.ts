import { LeaderboardEntry } from '../types';

// Base de datos simulada de usuarios para el leaderboard
export const getLeaderboardData = (): LeaderboardEntry[] => {
    // En una implementación real, esto vendría de un backend
    const users = [
        { userId: 'user1', userName: 'Ana', userPicture: 'https://randomuser.me/api/portraits/women/1.jpg', score: 95.5 },
        { userId: 'user2', userName: 'Carlos', userPicture: 'https://randomuser.me/api/portraits/men/2.jpg', score: 92.1 },
        { userId: 'user3', userName: 'Beatriz', userPicture: 'https://randomuser.me/api/portraits/women/3.jpg', score: 88.7 },
        { userId: 'user4', userName: 'David', userPicture: 'https://randomuser.me/api/portraits/men/4.jpg', score: 85.4 },
        { userId: 'user5', userName: 'Elena', userPicture: 'https://randomuser.me/api/portraits/women/5.jpg', score: 82.9 },
        { userId: 'user6', userName: 'Tu', userPicture: '', score: 78.2 }, // Usuario actual
        { userId: 'user7', userName: 'Felipe', userPicture: 'https://randomuser.me/api/portraits/men/6.jpg', score: 75.1 },
        { userId: 'user8', userName: 'Gabriela', userPicture: 'https://randomuser.me/api/portraits/women/7.jpg', score: 72.3 },
    ];

    return users
        .sort((a, b) => b.score - a.score)
        .map((user, index) => ({ ...user, rank: index + 1 }));
};
