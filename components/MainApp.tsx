import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Header from './Header';
import Alert from './Alert';
import { useAuth } from './../contexts/AuthContext';
import { useData } from './../contexts/DataContext';
import { Expense } from './../types';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import DeveloperNotice from './DeveloperNotice';
import LearnView from './LearnView';

// Critical components loaded immediately
const ActionButtons = React.lazy(() => import('./ActionButtons'));
const WalletView = React.lazy(() => import('./WalletView'));
const ChallengeBoard = React.lazy(() => import(/* webpackChunkName: "challenges" */ './ChallengeBoard'));
const Marketplace = React.lazy(() => import(/* webpackChunkName: "market" */ './Marketplace'));
const CommunityForest = React.lazy(() => import(/* webpackChunkName: "community" */ './CommunityForest'));
const NotificationPermissionPrompt = React.lazy(() => import(/* webpackChunkName: "notifications" */ './NotificationPermissionPrompt'));
const BadgeCollection = React.lazy(() => import(/* webpackChunkName: "badges" */ './BadgeCollection'));

// Secondary components loaded on demand
const AddExpenseModal = React.lazy(() => 
  import(/* webpackChunkName: "expense-modal" */ './AddExpenseModal')
);
const SetBudgetModal = React.lazy(() => 
  import(/* webpackChunkName: "budget-modal" */ './SetBudgetModal')
);
const AnalysisView = React.lazy(() => 
  import(/* webpackChunkName: "analysis" */ './AnalysisView')
);
const OnboardingTour = React.lazy(() => 
  import(/* webpackChunkName: "onboarding" */ './OnboardingTour')
);
const AIAssistantChat = React.lazy(() => 
  import(/* webpackChunkName: "ai-chat" */ './AIAssistantChat')
);
const ConfirmDeleteModal = React.lazy(() => 
  import(/* webpackChunkName: "modals" */ './ConfirmDeleteModal')
);
const UserProfile = React.lazy(() => 
  import(/* webpackChunkName: "profile" */ './UserProfile')
);

export type ActiveTab = 'gastos' | 'analisis' | 'consejos' | 'senda' | 'mercado' | 'bosque' | 'badges';
type ExpenseModalAction = 'camera' | 'file';
type ScanMode = 'receipt' | 'products' | 'verify';

const MainApp: React.FC = () => {
    const { user } = useAuth(); // Although AppRouter checks this, it's needed for other user-related logic
    const { expenses, deleteExpense, budget, totalExpenses, alert, setAlert, unlockedBadges } = useData();
    
    // UI State
    const [expenseModalState, setExpenseModalState] = useState<{
        isOpen: boolean; 
        initialAction: ExpenseModalAction | null;
        scanMode: ScanMode | null;
    }>({isOpen: false, initialAction: null, scanMode: null});
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('gastos');
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ isOpen: boolean; expenseId: string | null }>({ isOpen: false, expenseId: null });
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Onboarding State
    const [isTourActive, setIsTourActive] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [isAssistantChatOpen, setIsAssistantChatOpen] = useState(false);
    
    // Refs for tour targets
    const headerRef = useRef<HTMLDivElement>(null);
    const billeteraTabRef = useRef<HTMLButtonElement>(null);
    const analisisTabRef = useRef<HTMLButtonElement>(null);
    const fabRef = useRef<HTMLDivElement>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);

    // Custom hook for swipe navigation (solo en móviles)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const { swipeHandlers, swipeOffset, isSwiping } = useSwipeNavigation(
        activeTab,
        (newTab) => handleTabClick(newTab),
        { enabled: isMobile }
    );

    // --- Effects ---
    useEffect(() => {
        if (!user) return;

        let tourCompleted = localStorage.getItem('treevut-tour-completed');
        if (!tourCompleted) {
            const oldTourCompleted = localStorage.getItem('treebu-tour-completed');
            if (oldTourCompleted) {
                tourCompleted = oldTourCompleted;
                localStorage.setItem('treevut-tour-completed', oldTourCompleted);
                localStorage.removeItem('treebu-tour-completed');
            }
        }

        if (!tourCompleted) {
            setTimeout(() => setIsTourActive(true), 300);
        }

    }, [user]);

     // Effect to check budget status
    useEffect(() => {
        setAlert(currentAlert => {
            if (budget === null || budget === 0) return null;

            const percentage = (totalExpenses / budget) * 100;

            if (percentage >= 100) {
                const message = "¡Presupuesto excedido! Has superado tu límite. Analicemos juntos tus gastos.";
                if (currentAlert?.message !== message) return { message, type: 'danger' };
            } else if (percentage >= 90) {
                const message = "¡Atención! Estás al 90% de tu límite. Considera frenar gastos no esenciales.";
                 if (currentAlert?.message !== message) return { message, type: 'warning' };
            }
            // Clear alert if budget is no longer in a warning/danger state
            else if (currentAlert?.type === 'warning' || currentAlert?.type === 'danger') {
                return null;
            }
            return currentAlert;
        });
    }, [budget, totalExpenses, setAlert]);

    // --- Search Logic ---
    const filteredExpenses = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return expenses;
        return expenses.filter(expense =>
            expense.razonSocial.toLowerCase().includes(lowercasedQuery) ||
            expense.categoria.toLowerCase().includes(lowercasedQuery) ||
            expense.total.toString().includes(lowercasedQuery)
        );
    }, [expenses, searchQuery]);


    // --- Onboarding Tour ---
    const tourSteps = [
        { targetRef: headerRef, text: '¡Bienvenido a treevüt! Aquí verás un resumen de tus gastos y un consejo financiero para empezar tu día.', position: 'top' as const },
        { targetRef: billeteraTabRef, text: "Esta es la pestaña de Transacciones. Aquí verás tu presupuesto y la lista de todos tus gastos.", position: 'bottom' as const },
        { targetRef: analisisTabRef, text: "En 'Insights' exploraremos tus hábitos para ayudarte a entender a dónde va tu dinero.", position: 'bottom' as const },
        { targetRef: fabRef, text: '¡Todo listo! Toca este botón para añadir gastos o hablar con tu asistente. ¡Pruébalo para finalizar el tour!', position: 'top' as const, isInteractive: true },
    ];

    const handleNextStep = () => {
        if (tourStep < tourSteps.length - 1) setTourStep(prev => prev + 1);
        else handleEndTour();
    };
    
    const handleEndTour = () => {
        setIsTourActive(false);
        setTourStep(0);
        localStorage.setItem('treevut-tour-completed', 'true');
    };

    const handleFabClickAndEndTour = () => {
        if (isTourActive && tourStep === tourSteps.length - 1) handleEndTour();
    };
    
    const handleConfirmDelete = () => {
        if (confirmDeleteModal.expenseId) deleteExpense(confirmDeleteModal.expenseId);
        setConfirmDeleteModal({ isOpen: false, expenseId: null });
    };
    
    // --- Event Handlers for Modals/UI ---
    const handleOpenExpenseModal = (action: ExpenseModalAction, mode: ScanMode) => setExpenseModalState({ isOpen: true, initialAction: action, scanMode: mode });
    
    const handleEditExpense = (expenseId: string) => {
        const expense = expenses.find(e => e.id === expenseId);
        if (expense) {
            setExpenseToEdit(expense);
            setExpenseModalState({ isOpen: true, initialAction: null, scanMode: null });
        }
    };
    const handleCloseExpenseModal = () => {
        setExpenseModalState({ isOpen: false, initialAction: null, scanMode: null });
        setExpenseToEdit(null);
    };
    
    const handleTabClick = (tab: ActiveTab) => {
        setActiveTab(tab);
    };

    const handleOpenBudgetFromProfile = () => {
        setIsProfileOpen(false);
        // Use a timeout to allow the profile modal to animate out before the budget modal animates in
        setTimeout(() => {
            setIsBudgetModalOpen(true);
        }, 200);
    };

    const tabs: ActiveTab[] = ['gastos', 'analisis', 'consejos', 'senda', 'mercado', 'bosque', 'badges'];
    const activeIndex = tabs.indexOf(activeTab);
    const transformValue = -activeIndex * 100;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div ref={headerRef} className="flex-shrink-0">
                <Header onOpenProfile={() => setIsProfileOpen(true)} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            </div>

            <div className="sticky top-0 bg-background z-20 shadow-md">
                <nav className="max-w-3xl mx-auto flex p-1 px-4 gap-2">
                    <button ref={billeteraTabRef} onClick={() => handleTabClick('gastos')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'gastos' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Gastos</button>
                    <button ref={analisisTabRef} onClick={() => handleTabClick('analisis')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'analisis' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Análisis</button>
                    <button onClick={() => handleTabClick('consejos')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'consejos' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Consejos</button>
                    <button onClick={() => handleTabClick('senda')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'senda' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Senda</button>
<button onClick={() => handleTabClick('mercado')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'mercado' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Mercado</button>
<button onClick={() => handleTabClick('bosque')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'bosque' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Bosque</button>
<button onClick={() => handleTabClick('badges')} className={`flex-1 text-center py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${activeTab === 'badges' ? 'bg-active-surface text-on-surface' : 'text-on-surface-secondary hover:bg-surface'}`}>Badges</button>
                </nav>
            </div>
            
            <main ref={contentAreaRef} className="flex-1 max-w-3xl w-full mx-auto flex flex-col overflow-hidden">
                <div className="px-4 pt-4">
                    {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}
                </div>
                 <div className="overflow-x-hidden flex-1">
                    <div 
                        {...swipeHandlers}
                        className="flex w-[700%] h-full"
                        style={{ 
                            transform: `translateX(calc(${transformValue}% + ${swipeOffset}px))`,
                            transition: isSwiping ? 'none' : 'transform 0.3s ease-in-out'
                        }}
                    >
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                 <WalletView
                                    expenses={filteredExpenses}
                                    searchQuery={searchQuery}
                                    onEdit={handleEditExpense}
                                    onDelete={(id) => setConfirmDeleteModal({ isOpen: true, expenseId: id })}
                                    onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                                 />
                            </div>
                        </div>
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                <AnalysisView />
                            </div>
                        </div>
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                <LearnView />
                            </div>
                        </div>
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                <Suspense fallback={<Spinner />}><ChallengeBoard /></Suspense>
                            </div>
                        </div>
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                <Suspense fallback={<Spinner />}><Marketplace userBellotas={user?.bellotas || 0} purchasedGoods={user?.purchasedGoods || []} onPurchase={() => {}} /></Suspense>
                            </div>
                        </div>
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                <Suspense fallback={<Spinner />}><CommunityForest /></Suspense>
                            </div>
                        </div>
                        <div className="w-1/7 flex-shrink-0 h-full overflow-y-auto">
                            <div className="px-4 pb-32">
                                <Suspense fallback={<Spinner />}><BadgeCollection unlockedBadges={unlockedBadges} /></Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
             <ActionButtons 
                ref={fabRef} 
                onAddReceiptCamera={() => handleOpenExpenseModal('camera', 'receipt')} 
                onAddReceiptFile={() => handleOpenExpenseModal('file', 'receipt')} 
                onAddProductsCamera={() => handleOpenExpenseModal('camera', 'products')} 
                onOpenChat={() => setIsAssistantChatOpen(true)} 
                onMainButtonClick={handleFabClickAndEndTour} 
            />
            {expenseModalState.isOpen && <AddExpenseModal onClose={handleCloseExpenseModal} initialAction={expenseModalState.initialAction} scanMode={expenseModalState.scanMode} expenseToEdit={expenseToEdit} />}
            {isBudgetModalOpen && <SetBudgetModal onClose={() => setIsBudgetModalOpen(false)} />}
            {isProfileOpen && <UserProfile onClose={() => setIsProfileOpen(false)} onOpenBudgetModal={handleOpenBudgetFromProfile} />}
            {confirmDeleteModal.isOpen && <ConfirmDeleteModal onClose={() => setConfirmDeleteModal({ isOpen: false, expenseId: null })} onConfirm={handleConfirmDelete} />}
            {isTourActive && <OnboardingTour step={tourSteps[tourStep]} onNext={handleNextStep} onSkip={handleEndTour} />}
            {isAssistantChatOpen && <AIAssistantChat onClose={() => setIsAssistantChatOpen(false)} />}
            <NotificationPermissionPrompt />
            <DeveloperNotice />
        </div>
    );
};

export default MainApp;