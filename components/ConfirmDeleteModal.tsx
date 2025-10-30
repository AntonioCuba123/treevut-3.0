
import React from 'react';
import { ExclamationTriangleIcon, TrashIcon } from './Icons';

interface ConfirmDeleteModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm animate-slide-in-up">
                <div className="p-5 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger/20">
                        <ExclamationTriangleIcon className="h-6 w-6 text-danger" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-on-surface">
                        Eliminar Gasto
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-on-surface-secondary">
                            ¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-background/50 border-t border-active-surface/50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-6 py-2 text-sm font-bold text-white bg-danger rounded-xl hover:bg-red-600 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-red-500"
                    >
                        <TrashIcon className="w-5 h-5 mr-1.5"/>
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;