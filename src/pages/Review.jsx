import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UserAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';

const Review = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session, loading: authLoading } = UserAuth();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handlePublishReview = () => {
        if (authLoading) return; // Esperar a que cargue la autenticación
        
        if (!session) {
            // Si no está logueado, redirigir a signin
            navigate('/signin');
        } else {
            // Si está logueado, redirigir a la página del curso con el modal abierto
            const courseId = review?.Courses?.id;
            if (courseId) {
                navigate(`/course/${courseId}?publish=true`);
            } else {
                // Si no hay courseId, redirigir a explore
                navigate('/explore');
            }
        }
    };

    useEffect(() => {
        const fetchReview = async () => {
            if (!id) {
                setError('No se proporcionó un ID de review');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('Reviews')
                    .select(`
                        *,
                        Courses (
                            id,
                            name,
                            initial
                        ),
                        TaTypes (
                            id,
                            name
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (fetchError) {
                    console.error('Error fetching review:', fetchError);
                    setError('No se pudo cargar la review');
                } else {
                    setReview(data);
                }
            } catch (err) {
                console.error('Error:', err);
                setError('Error al cargar la review');
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [id]);

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Función para obtener el rating (si existe, sino mostrar 4.0 como ejemplo)
    const getRating = () => {
        // Si tienes un campo rating en la base de datos, úsalo aquí
        // Por ahora, retornamos 4.0 como valor por defecto
        return review?.rating || 4.0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center text-white">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                        <p>Cargando review...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !review) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center text-white">
                        <p className="text-xl mb-4">{error || 'Review no encontrada'}</p>
                        <Link 
                            to="/explore"
                            className="px-6 py-3 bg-yellow-400 text-blue-950 font-semibold rounded-lg hover:bg-yellow-500 transition"
                        >
                            Volver a Explore
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const rating = getRating();
    const formattedDate = formatDate(review.created_at);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
            {/* Patrón de fondo con signos + */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(147, 197, 253, 0.1) 50px, rgba(147, 197, 253, 0.1) 51px),
                                     repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(147, 197, 253, 0.1) 50px, rgba(147, 197, 253, 0.1) 51px)`,
                    backgroundSize: '50px 50px'
                }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-blue-300 text-6xl font-light opacity-20" style={{
                            fontFamily: 'monospace',
                            letterSpacing: '20px'
                        }}>+ + +</div>
                    </div>
                </div>
            </div>

            <Navbar />
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Botón para volver */}
                <Link 
                    to="/explore"
                    className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
                >
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Volver a Explore
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna principal - Card de Review */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 rounded-lg shadow-xl p-8">
                            {/* Header con badge, verificación y rating */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex items-center rounded-full border px-3 py-1 font-semibold bg-gray-100 text-gray-900 font-mono text-sm">
                                        {review.Courses?.initial || 'N/A'}
                                    </div>
                                    {review.validated ? (
                                        <div className="flex items-center gap-1">
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="20" 
                                                height="20" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                className="h-5 w-5 text-green-500"
                                            >
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="m9 12 2 2 4-4"></path>
                                            </svg>
                                            <span className="text-sm text-green-600 font-medium">Verificada</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-red-500 font-medium">No verificada</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">{rating}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const isFull = star <= rating;
                                            const isHalf = star > rating && star - 0.5 <= rating;
                                            
                                            return (
                                                <div key={star} className="relative h-5 w-5">
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
                                                        className="h-5 w-5 text-gray-300 absolute inset-0"
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
                                                            className="h-5 w-5 text-yellow-400 absolute inset-0"
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
                                                                className="h-5 w-5 text-yellow-400"
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

                            {/* Título */}
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {review.title}
                            </h1>

                            {/* Descripción */}
                            <div className="mb-6">
                                <p className="text-white whitespace-pre-wrap leading-relaxed">
                                    {review.description || 'Sin descripción'}
                                </p>
                            </div>


                            {/* Rango Salarial y Carga Horaria */}
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="20" 
                                            height="20" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            className="h-5 w-5 text-green-600"
                                        >
                                            <line x1="12" x2="12" y1="2" y2="22"></line>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                        <h3 className="text-sm font-medium text-white">Rango Salarial</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ${review.min_salary?.toLocaleString() || '0'} - ${review.max_salary?.toLocaleString() || '0'}
                                    </p>
                                    <p className="text-sm text-white">mensuales</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="20" 
                                            height="20" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            className="h-5 w-5 text-blue-600"
                                        >
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                        <h3 className="text-sm font-medium text-white">Carga Horaria</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {review.month_hours || 0} horas
                                    </p>
                                    <p className="text-sm text-white">por mes</p>
                                    <line x1="12" x2="12" y1="2" y2="22"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </div>
                            
                            
                            {/* Metadata: Semestre y Fecha */}
                            <div className="flex items-center gap-2 text-white text-sm mb-6">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="h-4 w-4"
                                >
                                    <path d="M8 2v4"></path>
                                    <path d="M16 2v4"></path>
                                    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                    <path d="M3 10h18"></path>
                                </svg>
                                
                                <span>Publicada el {formattedDate}</span>
                            </div>
                            </div>
                            
                        </div>
                    </div>

                    {/* Sidebar - Información adicional */}
                    <div className="space-y-6">
                        {/* Card de Profesor/a */}
                        <div className="bg-white/10 rounded-lg shadow-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="h-5 w-5 text-white"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <h2 className="text-lg font-semibold text-white">Profesor/a</h2>
                            </div>
                            <p className="text-sm text-white">
                                {review.professor || 'N/A'}
                            </p>
                        </div>

                        {/* Card de Información del Curso */}
                        <div className="bg-white/10 rounded-lg shadow-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="h-5 w-5 text-white"
                                >
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                </svg>
                                <h2 className="text-lg font-semibold text-white">Información de la Ayudantía</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-white">Nombre Curso: {review.Courses?.name || 'N/A'}</p>
                                    <p className="text-sm font-medium text-white">Sigla: {review.Courses?.initial || 'N/A'}</p>
                                    <p className="text-sm font-medium text-white">Cargo: {review.TaTypes?.name || 'N/A'}</p>
                                    <p className="text-sm font-medium text-white">Semestre: {review.semester || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card de Call to Action */}
                        <div className="bg-white/10 rounded-lg shadow-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-2">
                                ¿También fuiste ayudante de este curso?
                            </h2>
                            <p className="text-sm text-white mb-4">
                                Comparte tu experiencia y ayuda a otros estudiantes.
                            </p>
                            <button
                                onClick={handlePublishReview}
                                className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Publicar mi Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Review;