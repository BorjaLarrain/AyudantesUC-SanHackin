import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ courseStats }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/course/${courseStats.course_id}`);
    };

    const rating = courseStats.avg_rating || 0;
    const reviewsCount = courseStats.reviews_count || 0;

    return (
        <div 
            onClick={handleCardClick}
            className="rounded-lg border border-blue-400/20 bg-white/10 text-gray-900 shadow-sm group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:cursor-pointer"
        >
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 shrink-0 font-mono text-xs">
                                {courseStats.initial || 'N/A'}
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg leading-tight text-white line-clamp-2 group-hover:text-yellow-400 transition-colors">
                            {courseStats.name || 'Nombre del Curso'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFull = star <= rating;
                                const isHalf = star > rating && star - 0.5 <= rating;
                                
                                return (
                                    <div key={star} className="relative h-3.5 w-3.5">
                                        {/* Estrella de fondo (siempre gris) */}
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="24" 
                                            height="24" 
                                            viewBox="0 0 24 24" 
                                            fill="none"
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            className="h-3.5 w-3.5 text-gray-300 absolute inset-0"
                                        >
                                            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                        </svg>
                                        
                                        {/* Estrella amarilla (completa o media) */}
                                        {isFull && (
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="24" 
                                                height="24" 
                                                viewBox="0 0 24 24" 
                                                fill="currentColor"
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                className="h-3.5 w-3.5 text-yellow-400 absolute inset-0"
                                            >
                                                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                            </svg>
                                        )}
                                        
                                        {/* Media estrella */}
                                        {isHalf && (
                                            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    width="24" 
                                                    height="24" 
                                                    viewBox="0 0 24 24" 
                                                    fill="currentColor"
                                                    stroke="currentColor" 
                                                    strokeWidth="2" 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    className="h-3.5 w-3.5 text-yellow-400"
                                                >
                                                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="h-4 w-4 text-blue-600"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span className="text-white">
                            {courseStats.avg_month_hours 
                                ? `${Math.round(courseStats.avg_month_hours)}h/mes`
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="h-4 w-4 text-green-600"
                        >
                            <line x1="12" x2="12" y1="2" y2="22"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span className="truncate text-white">
                            {courseStats.avg_salary_midpoint 
                                ? `$${Math.round(courseStats.avg_salary_midpoint).toLocaleString('es-CL')}`
                                : 'N/A'}
                        </span>
                    </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="h-3 w-3"
                        >
                            <path d="M12 7v14"></path>
                            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                        </svg>
                        <span className="truncate text-white">
                            {reviewsCount > 0 
                                ? `Basado en ${reviewsCount} ${reviewsCount === 1 ? 'reseña' : 'reseñas'}`
                                : 'Sin reseñas aún'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
