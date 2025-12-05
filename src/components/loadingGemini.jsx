import React from 'react';

const LoadingGemini = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-blue-950 via-purple-900 to-indigo-950 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-blue-400/30 shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                    {/* Icono de Gemini con animación */}
                    <div className="relative">
                        {/* Glow effect exterior */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                        
                        {/* Glow effect medio */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full blur-xl opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        
                        {/* Contenedor principal del icono */}
                        <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-full p-6 shadow-2xl">
                            {/* Estrella de Gemini */}
                            <svg 
                                className="w-16 h-16 text-white animate-spin" 
                                viewBox="0 0 24 24" 
                                fill="currentColor"
                                style={{ animationDuration: '3s' }}
                            >
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            
                            {/* Partículas decorativas animadas */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                        </div>
                    </div>
                    
                    {/* Texto de validación */}
                    <div className="text-center space-y-3">
                        <h3 className="text-white font-bold text-2xl flex items-center justify-center gap-2">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Google Gemini
                            </span>
                            <span className="text-white">está validando</span>
                        </h3>
                        <p className="text-white/80 text-base">
                            Analizando el documento PDF...
                        </p>
                        <p className="text-white/60 text-sm">
                            Por favor espera, esto puede tomar unos momentos
                        </p>
                    </div>
                    
                    {/* Barra de progreso animada */}
                    <div className="w-full max-w-xs">
                        <div className="h-3 bg-blue-900/50 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 via-pink-400 to-blue-400 rounded-full"
                                style={{
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s ease-in-out infinite',
                                }}
                            ></div>
                        </div>
                    </div>
                    
                    {/* Indicador de puntos animados */}
                    <div className="flex gap-2">
                        <div 
                            className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0s' }}
                        ></div>
                        <div 
                            className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div 
                            className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.4s' }}
                        ></div>
                    </div>
                </div>
            </div>
            
            {/* Estilos inline para la animación shimmer si no está en tu CSS global */}
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoadingGemini;
