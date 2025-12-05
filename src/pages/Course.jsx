import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReviewModal from '../components/ReviewModal';
import supabase from '../config/supabaseClient';

const Course = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [course, setCourse] = useState(null);
    const [courseStats, setCourseStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);

                // Query the Courses table (with capital C as confirmed in database)
                let query = supabase
                    .from('Courses')
                    .select('*');

                if (id) {
                    query = query.eq('id', id);
                }

                const { data, error: fetchError } = await query.limit(1).maybeSingle();

                if (fetchError) {
                    console.error('Supabase error details:', fetchError);
                    throw fetchError;
                }

                if (!data) {
                    setError(id ? `No se encontró un curso con ID ${id}` : 'No se encontraron cursos');
                    return;
                }

                setCourse(data);

                // Fetch course statistics if course ID is available
                if (id) {
                    const { data: statsData, error: statsError } = await supabase
                        .rpc('get_course_stats', { p_course_id: parseInt(id) });

                    if (statsError) {
                        console.error('Error fetching course stats:', statsError);
                        // Don't throw error, just log it - stats are optional
                    } else if (statsData && statsData.length > 0) {
                        setCourseStats(statsData[0]);
                    } else {
                        // No reviews yet, set empty stats
                        setCourseStats(null);
                    }
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                
                // Provide more detailed error message
                let errorMessage = 'Error al cargar el curso';
                
                if (err.message) {
                    errorMessage = err.message;
                }
                
                if (err.code) {
                    errorMessage = `Error ${err.code}: ${err.message || 'No se pudo acceder a la base de datos'}`;
                }
                
                // Check for API key issues
                if (err.message?.includes('secret API key') || err.message?.includes('Forbidden')) {
                    errorMessage = 'Error de configuración: Estás usando la clave incorrecta. Verifica que VITE_SUPABASE_ANON_KEY en tu archivo .env use la clave "anon" (no "service_role").';
                }
                
                // Check if it's an RLS policy issue
                if (err.code === 'PGRST301' || err.message?.includes('permission denied') || err.code === '42501') {
                    errorMessage = 'No tienes permiso para ver este curso. Verifica las políticas de seguridad (RLS) en Supabase.';
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    // Abrir el modal automáticamente si viene el query parameter publish=true
    useEffect(() => {
        const shouldPublish = searchParams.get('publish') === 'true';
        if (shouldPublish && !loading && course) {
            setIsReviewModalOpen(true);
            // Limpiar el query parameter después de abrir el modal
            setSearchParams({});
        }
    }, [searchParams, loading, course, setSearchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-white text-xl">Cargando...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-red-400 text-xl">Error: {error}</div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                    <div className="text-white text-xl">No se encontró el curso</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
            <Navbar />
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
                <div className="bg-blue-950/50 backdrop-blur-sm border-2 border-blue-400/20 rounded-2xl p-8 shadow-xl">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {course.name || 'Nombre del Curso'}
                        </h1>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400 rounded-full font-semibold text-lg">
                                {course.initial || course.sigla || 'N/A'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Publicar Reseña
                        </button>
                    </div>

                    {/* Course Statistics Section */}
                    {courseStats && courseStats.reviews_count > 0 ? (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Average Monthly Hours */}
                            <div className="bg-blue-900/30 border border-blue-400/20 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-white font-semibold text-lg">Horas Mensuales</h3>
                                </div>
                                <p className="text-yellow-400 text-2xl font-bold">
                                    {courseStats.avg_month_hours ? courseStats.avg_month_hours.toFixed(1) : 'N/A'}
                                </p>
                                <p className="text-white/60 text-sm mt-1">Promedio mensual</p>
                            </div>

                            {/* Average Salary */}
                            <div className="bg-blue-900/30 border border-blue-400/20 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-white font-semibold text-lg">Salario Promedio</h3>
                                </div>
                                <p className="text-yellow-400 text-2xl font-bold">
                                    {courseStats.avg_salary_midpoint 
                                        ? `$${Math.round(courseStats.avg_salary_midpoint).toLocaleString('es-CL')}`
                                        : 'N/A'}
                                </p>
                                <p className="text-white/60 text-sm mt-1">
                                    {courseStats.avg_min_salary && courseStats.avg_max_salary
                                        ? `Rango: $${Math.round(courseStats.avg_min_salary).toLocaleString('es-CL')} - $${Math.round(courseStats.avg_max_salary).toLocaleString('es-CL')}`
                                        : 'CLP mensual'}
                                </p>
                            </div>

                            {/* Average Rating */}
                            <div className="bg-blue-900/30 border border-blue-400/20 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <h3 className="text-white font-semibold text-lg">Calificación</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-yellow-400 text-2xl font-bold">
                                        {courseStats.avg_rating ? courseStats.avg_rating.toFixed(1) : 'N/A'}
                                    </p>
                                    <span className="text-white/60 text-lg">/ 5</span>
                                </div>
                                <p className="text-white/60 text-sm mt-1">
                                    {courseStats.reviews_count} {courseStats.reviews_count === 1 ? 'reseña' : 'reseñas'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 bg-blue-900/20 border border-blue-400/10 rounded-xl p-6">
                            <p className="text-white/70 text-center">
                                Aún no hay reseñas para este curso. ¡Sé el primero en compartir tu experiencia!
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                courseId={id ? parseInt(id) : null}
            />
        </div>
    );
};

export default Course;
