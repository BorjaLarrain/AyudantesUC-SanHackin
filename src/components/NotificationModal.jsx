import React, { useEffect } from 'react';

const NotificationModal = ({ isOpen, onClose, title, message, type = 'success', duration = 3000 }) => {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const colors = {
        success: {
            bg: 'bg-green-600',
            icon: 'text-green-500',
            border: 'border-green-400/30'
        },
        error: {
            bg: 'bg-red-600',
            icon: 'text-red-500',
            border: 'border-red-400/30'
        },
        info: {
            bg: 'bg-blue-600',
            icon: 'text-blue-500',
            border: 'border-blue-400/30'
        },
        warning: {
            bg: 'bg-yellow-400',
            icon: 'text-yellow-400',
            border: 'border-yellow-400/30'
        }
    };

    const currentColors = colors[type] || colors.success;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className={`bg-blue-950 border-2 ${currentColors.border} rounded-2xl p-8 max-w-md w-full mx-4`}>
                <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`${currentColors.icon} flex-shrink-0`}>
                        {type === 'success' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {type === 'error' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {type === 'info' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {type === 'warning' && (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {title}
                        </h3>
                        <p className="text-white/80">
                            {message}
                        </p>
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;