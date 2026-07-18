import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', showCancelButton = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={24} />
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
                </div>

                <div className={`flex gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl ${showCancelButton ? '' : 'justify-center'}`}>
                    {showCancelButton && (
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        className={showCancelButton ? "flex-1" : "w-full"}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
