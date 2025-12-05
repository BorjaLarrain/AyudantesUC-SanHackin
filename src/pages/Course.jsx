import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import supabase from '../config/supabaseClient';

const Course = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400 rounded-full font-semibold text-lg">
                                {course.initial || course.sigla || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Course;
