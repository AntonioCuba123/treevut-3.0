import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, IdentificationIcon, CheckIcon, DocumentArrowDownIcon, TrashIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import GamificationProgress from './GamificationProgress';
import { useData } from '../contexts/DataContext';

interface UserProfileProps {
    onClose: () => void;
    onOpenBudgetModal: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose, onOpenBudgetModal }) => {
    const { user, signOut, updateUserDocumentId } = useAuth();
    const { expenses, budget, annualIncome } = useData();

    const [isEditingDocId, setIsEditingDocId] = useState(false);
    const [docIdValue, setDocIdValue] = useState(user?.documentId || '');
    const [validationMessage, setValidationMessage] = useState('');

    if (!user) return null;

    const handleSignOut = () => {
        signOut();
        onClose();
    }

    const handleSaveDocId = () => {
        if (docIdValue.length !== 8) {
            setValidationMessage('El DNI debe tener 8 dígitos.');
            return;
        }
        updateUserDocumentId(docIdValue);
        setIsEditingDocId(false);
        setValidationMessage('');
    };
    
    const handleEditClick = () => {
        setDocIdValue(user.documentId || '');
        setIsEditingDocId(true);
        setValidationMessage('');
    }

    const handleExportData = () => {
        if (!user) return;
        const dataToExport = {
            user,
            expenses,
            budget,
            annualIncome,
            exportDate: new Date().toISOString(),
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataToExport, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `treevut-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleResetData = () => {
        const confirmation = window.confirm(
            "¿Estás seguro de que quieres reiniciar la aplicación? Se borrarán todos tus gastos, presupuesto, ingreso y datos de perfil. Esta acción no se puede deshacer."
        );
        if (confirmation) {
            localStorage.removeItem('treevut-expenses');
            localStorage.removeItem('treevut-budget');
            localStorage.removeItem('treevut-annualIncome');
            localStorage.removeItem('treevut-tour-completed');
            signOut(); // This removes the user and triggers a re-render to the Welcome screen
            onClose();
        }
    };

    const renderDocIdContent = () => {
        if (isEditingDocId) {
            return (
                <div className="w-full mt-2 animate-fade-in">
                    <div className="flex items-center space-x-2">
                         <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={docIdValue}
                            onChange={(e) => setDocIdValue(e.target.value.replace(/\D/g, ''))}
                            maxLength={8}
                            placeholder="Ingresa tu DNI"
                            className="flex-grow bg-background border border-active-surface rounded-lg p-2 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button
                            onClick={handleSaveDocId}
                            className="bg-primary text-primary-dark font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                        >
                            <CheckIcon className="w-5 h-5" />
                        </button>
                    </div>
                     {validationMessage && (
                        <p className="text-xs mt-2 text-center text-danger">
                            {validationMessage}
                        </p>
                    )}
                </div>
            )
        }
        
        return (
            <div className="flex items-center space-x-2 text-on-surface-secondary">
                <IdentificationIcon className="w-5 h-5"/>
                <span className="flex-grow">{user.documentId || 'No has añadido un DNI'}</span>
                <button onClick={handleEditClick} className="text-primary hover:opacity-80">
                     <PencilIcon className="w-5 h-5"/>
                </button>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm animate-slide-in-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-active-surface/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-on-surface">Mi Senda treev<span className="text-danger">ü</span>t</h2>
                    <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex flex-col items-center">
                    <div className="flex flex-col items-center text-center space-y-2">
                        {user.name ? (
                            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-active-surface">
                                <span className="text-5xl font-bold text-primary-dark">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                        ) : (
                            <img src={user.picture} alt="User" className="w-24 h-24 rounded-full object-cover border-4 border-active-surface"/>
                        )}
                        <div>
                            <h3 className="text-2xl font-bold text-on-surface">{user.name}</h3>
                            <p className="text-on-surface-secondary">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="w-full mt-4 p-3 bg-background rounded-2xl">
                        {renderDocIdContent()}
                    </div>

                    <div className="w-full mt-4">
                        <GamificationProgress user={user} />
                    </div>
                    
                    <div className="w-full mt-4 pt-4 border-t border-active-surface/50 space-y-3">
                        <button 
                            onClick={onOpenBudgetModal} 
                            className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                        >
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Editar Presupuesto
                        </button>

                         <button 
                            onClick={handleExportData}
                            className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                        >
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            Exportar Datos (Guardar)
                        </button>

                        <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                        >
                            Cerrar Sesión
                        </button>
                        
                        <div className="pt-2">
                            <button 
                                onClick={handleResetData}
                                className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-danger rounded-xl hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-danger"
                            >
                                <TrashIcon className="w-5 h-5 mr-2" />
                                Reiniciar App (Testing)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;