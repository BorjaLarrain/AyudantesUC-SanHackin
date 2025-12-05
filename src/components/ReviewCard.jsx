import React from 'react';

const ReviewCard = ({ review }) => {
    return (
        <div className="rounded-lg border border-blue-400/20 bg-white/10 text-gray-900 shadow-sm group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:cursor-pointer">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 shrink-0 font-mono text-xs">
                                {review.Courses?.initial || 'N/A'}
                            </div>
                            {review.validated ? (
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
                                    className="h-4 w-4 text-green-500 shrink-0"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="m9 12 2 2 4-4"></path>
                                </svg>
                            ) : (
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
                                    className="h-4 w-4 text-red-500 shrink-0"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                </svg>
                            )}
                        </div>
                        <h3 className="font-semibold text-lg leading-tight text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {review.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    disabled 
                                    className="transition-transform"
                                >
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
                                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                                    >
                                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white text-xs border-gray-200">
                        {review.TaTypes?.name || 'N/A'}
                    </div>
                    <span className="text-xs text-white">{review.Courses?.name || 'N/A'}</span>
                </div>
            </div>
            <div className="p-6 pt-0">
                <p className="text-sm text-white line-clamp-2 mb-4">
                    {review.description || 'Sin descripción'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
                            ${review.min_salary?.toLocaleString() || '0'} - ${review.max_salary?.toLocaleString() || '0'}
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
                            className="h-4 w-4 text-blue-600"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span className="text-white">{review.month_hours || 0}h/mes</span>
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
                            className="h-4 w-4 text-yellow-500"
                        >
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </svg>
                        <span className="text-white">{review.semester || 'N/A'}</span>
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
                            className="h-4 w-4"
                        >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="truncate text-white">{review.professor || 'N/A'}</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
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
                        <span className="truncate text-white">Ingeniería • San Joaquín</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;