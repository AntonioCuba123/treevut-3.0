import React, { useState } from 'react';
import { TreeIcon, GoogleIcon, EnvelopeIcon, ArrowLeftIcon, LockClosedIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import GoogleSecurityCheck from './GoogleSecurityCheck';

const Welcome: React.FC = () => {
    const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
    const [view, setView] = useState<'initial' | 'emailForm' | 'registerForm' | 'googleSecurityCheck'>('initial');
    
    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register state
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    const [error, setError] = useState('');

    const handleEmailLoginAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor, ingresa un correo válido.');
            return;
        }

        // --- Mock Authentication ---
        if (email === 'amigo@treevut.pe' && password === 'password') {
            signInWithEmail();
        } else {
            setError('Credenciales incorrectas. Inténtalo de nuevo.');
        }
    };

    const handleRegisterAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(registerEmail)) {
            setError('Por favor, ingresa un correo válido.');
            return;
        }
        if (registerPassword.length < 6) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (registerPassword !== registerConfirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        signUpWithEmail(registerName, registerEmail);
    };


    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-between p-8 text-on-surface text-center z-[100] overflow-hidden animate-welcome-fade-in">
            
            {view === 'googleSecurityCheck' && (
                <GoogleSecurityCheck onSuccess={signIn} />
            )}
            
            <div className="flex flex-col items-center w-full max-w-sm mt-14">
                {/* Main container for transitions */}
                <div className="relative w-full min-h-[450px] flex items-center justify-center">

                    {/* Initial View */}
                    <div 
                        className={`absolute inset-x-0 transition-all duration-300 ease-in-out flex flex-col justify-between h-full ${
                            view === 'initial' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
                        }`}
                    >
                        {/* Top Group */}
                        <div className="flex flex-col items-center">
                            <div className="animate-grow-and-fade-in">
                            </div>
                            
                            <div className="mt-6 animate-fade-in-down" style={{animationDelay: '200ms'}}>
                                <h1 className="text-center">
                                    <span className="block text-2xl md:text-3xl font-light text-on-surface">
                                        Únete a
                                    </span>
                                    <span className="block mt-1 text-6xl md:text-7xl font-black text-on-surface">
                                        treev<span className="text-danger">ü</span>t
                                    </span>
                                </h1>
                            </div>
                        </div>

                        {/* Middle Group (Slogan) */}
                        <p className="max-w-sm text-xl text-on-surface/90 mt-8 mb-12 animate-fade-in-down" style={{animationDelay: '400ms'}}>
                           <span className="block">Siembra gastos <span className="font-bold text-primary">formales</span>,</span>
                           <span className="block">Cosecha ahorros <span className="font-bold text-primary">fiscales</span>.</span>
                        </p>

                        {/* Bottom Group */}
                        <div className="w-full">
                            <div className="w-full animate-slide-in-up-buttons space-y-4" style={{animationDelay: '600ms'}}>
                                <button
                                    onClick={() => setView('googleSecurityCheck')}
                                    className="w-full bg-white text-gray-800 font-bold py-3 px-6 rounded-xl shadow-lg text-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-background focus:ring-white flex items-center justify-center space-x-3"
                                >
                                    <GoogleIcon className="w-6 h-6"/>
                                    <span>Continuar con Google</span>
                                </button>
                                <button
                                    onClick={() => { setError(''); setView('emailForm'); }} // Switch view
                                    className="w-full bg-primary/20 text-primary font-bold py-3 px-6 rounded-xl shadow-lg text-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-background focus:ring-primary flex items-center justify-center space-x-3"
                                >
                                    <EnvelopeIcon className="w-6 h-6"/>
                                    <span>Iniciar con correo electrónico </span>
                                </button>
                            </div>
                            <div className="mt-8 mb-6 text-center animate-fade-in-down" style={{animationDelay: '700ms'}}>
                                <p className="text-base text-on-surface-secondary">
                                    ¿No tienes una cuenta?
                                </p>
                                <button onClick={() => { setError(''); setView('registerForm'); }} className="mt-1 font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                                    Regístrate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Email Form View */}
                    <div 
                        className={`absolute inset-x-0 transition-all duration-300 ease-in-out ${
                            view === 'emailForm' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}
                    >
                        <div className="flex flex-col items-center">
                            <h2 className="text-3xl font-bold mb-6">Iniciar Sesión</h2>
                            <form onSubmit={handleEmailLoginAttempt} className="w-full space-y-4 text-left">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    className="w-full bg-surface border border-transparent rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    className="w-full bg-surface border border-transparent rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                                />
                                {error && <p role="alert" className="text-danger text-sm text-center">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-primary-dark font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
                                >
                                    Continuar
                                </button>
                            </form>
                             <p className="text-sm text-on-surface-secondary mt-4">
                                ¿No tienes cuenta?{' '}
                                <button onClick={() => { setError(''); setView('registerForm'); }} className="font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                                    Regístrate
                                </button>
                            </p>
                            <button
                                onClick={() => setView('initial')}
                                className="mt-4 text-on-surface-secondary font-semibold text-sm flex items-center"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Volver
                            </button>
                        </div>
                    </div>

                    {/* Register Form View */}
                    <div 
                        className={`absolute inset-x-0 transition-all duration-300 ease-in-out ${
                            view === 'registerForm' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}
                    >
                        <div className="flex flex-col items-center">
                            <h2 className="text-3xl font-bold mb-6">Crear Cuenta</h2>
                            <form onSubmit={handleRegisterAttempt} className="w-full space-y-3 text-left">
                                <input
                                    type="text"
                                    value={registerName}
                                    onChange={(e) => setRegisterName(e.target.value)}
                                    placeholder="Nombre completo"
                                    className="w-full bg-surface border border-transparent rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                                />
                                 <input
                                    type="email"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    className="w-full bg-surface border border-transparent rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                                />
                                <input
                                    type="password"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    placeholder="Contraseña (mín. 6 caracteres)"
                                    className="w-full bg-surface border border-transparent rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                                />
                                 <input
                                    type="password"
                                    value={registerConfirmPassword}
                                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                    placeholder="Confirmar contraseña"
                                    className="w-full bg-surface border border-transparent rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                                />
                                {error && <p role="alert" className="text-danger text-sm !mt-2 text-center">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-primary-dark font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 !mt-4"
                                >
                                    Crear Cuenta
                                </button>
                            </form>
                             <p className="text-sm text-on-surface-secondary mt-4">
                                ¿Ya tienes una cuenta?{' '}
                                <button onClick={() => { setError(''); setView('emailForm'); }} className="font-bold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                                    Inicia sesión
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-on-surface-secondary animate-fade-in-down" style={{animationDelay: '800ms'}}>
                <p>Built in Sinapsis Innovadora</p>
                <p className="mt-1 italic">Powered by Gemini</p>
            </div>
        </div>
    );
};

export default Welcome;