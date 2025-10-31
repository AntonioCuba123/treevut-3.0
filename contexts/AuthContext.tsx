import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { type User, TreevutLevel } from '../types';

console.log('🔐 [AuthContext] Loading AuthContext...');

interface AuthContextType {
    user: User | null;
    signIn: () => void;
    signInWithEmail: () => void;
    signUpWithEmail: (name: string, email: string) => void;
    signOut: () => void;
    updateUserProgress: (progress: Partial<User['progress']>) => void;
    updateUserDocumentId: (docId: string) => void;
    updateUserName: (name: string) => void;
    completeProfileSetup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    console.log('🔐 [AuthContext] AuthProvider rendering...');
    const [user, setUser] = useState<User | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        console.log('🔐 [AuthContext] useEffect running - loading user from localStorage...');
        try {
            let savedUser = localStorage.getItem('treevut-user');
            if (!savedUser) {
                const oldUser = localStorage.getItem('treebu-user');
                if (oldUser) {
                    savedUser = oldUser;
                    localStorage.setItem('treevut-user', oldUser);
                    localStorage.removeItem('treebu-user');
                }
            }

            if (savedUser) {
                const parsedUser = JSON.parse(savedUser) as User;
                // --- Backward compatibility for existing users ---
                if (!parsedUser.id) {
                    parsedUser.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
                if (parsedUser.level === undefined) {
                    parsedUser.level = TreevutLevel.Brote;
                }
                if (parsedUser.progress === undefined) {
                    parsedUser.progress = { expensesCount: 0, formalityIndex: 100 };
                }
                if (parsedUser.isProfileComplete === undefined) {
                    // Assume existing users have completed their profile
                    parsedUser.isProfileComplete = true;
                }
                if (parsedUser.bellotas === undefined) {
                    parsedUser.bellotas = 0;
                }
                if (parsedUser.completedChallenges === undefined) {
                    parsedUser.completedChallenges = [];
                }
                if (parsedUser.purchasedGoods === undefined) {
                    parsedUser.purchasedGoods = [];
                }
                setUser(parsedUser);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('treevut-user');
            localStorage.removeItem('treebu-user');
        }
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        if (isInitialLoad) return;
        try {
            if (user) {
                localStorage.setItem('treevut-user', JSON.stringify(user));
            } else {
                localStorage.removeItem('treevut-user');
            }
        } catch (e) {
            console.error("Failed to save user to localStorage", e);
        }
    }, [user, isInitialLoad]);

    const updateUserProgress = (progress: Partial<User['progress']>) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedProgress = { ...currentUser.progress, ...progress };
            return { ...currentUser, progress: updatedProgress };
        });
    };

    const updateUserDocumentId = (docId: string) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, documentId: docId };
        });
    };

    const updateUserName = (name: string) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, name: name };
        });
    };

    const completeProfileSetup = () => {
        setUser(currentUser => {
            if (!currentUser) return null;
            return { ...currentUser, isProfileComplete: true };
        });
    };
    
    const baseNewUser: Omit<User, 'id' | 'name' | 'email' | 'picture'> = {
        level: TreevutLevel.Brote,
        documentId: undefined,
        bellotas: 0,
        progress: {
            expensesCount: 0,
            formalityIndex: 100
        },
        completedChallenges: [],
        purchasedGoods: [],
        isProfileComplete: false, // New users must complete the profile setup
    };

    const signIn = () => {
        const mockUser: User = {
            ...baseNewUser,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "",
            email: "google.user@treevut.pe",
            picture: `https://ui-avatars.com/api/?name=G&background=1EFF78&color=000&size=128&bold=true`
        };
        setUser(mockUser);
    };

    const signInWithEmail = () => {
        const mockUser: User = {
            ...baseNewUser,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: "",
            email: "amigo@treevut.pe",
            picture: `https://ui-avatars.com/api/?name=T&background=1EFF78&color=000&size=128&bold=true`
        };
        setUser(mockUser);
    };

    const signUpWithEmail = (name: string, email: string) => {
        const initials = name.split(' ').map(n => n[0]).join('');
        const mockUser: User = {
            ...baseNewUser,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            email: email,
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1EFF78&color=000&size=128&bold=true`
        };
        setUser(mockUser);
    };

    const signOut = () => {
        setUser(null);
    };

    const value = useMemo(() => ({
        user,
        signIn,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserProgress,
        updateUserDocumentId,
        updateUserName,
        completeProfileSetup,
    }), [user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};