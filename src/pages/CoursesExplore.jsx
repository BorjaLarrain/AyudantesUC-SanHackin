import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import supabase from '../config/supabaseClient';
import CourseCard from '../components/CourseCard';

const CoursesExplore = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        courseInitial: '', // Sigla del curso
        coursePrefix: '', // Prefijo del curso
        maxAvgHours: '', // Horas mensuales máximas promedio
        minAvgSalary: '' // Salario promedio mínimo
    });

    // Estados debounced (valores que se usan para la búsqueda después de que el usuario deja de escribir)
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [debouncedFilters, setDebouncedFilters] = useState({
        courseInitial: '',
        coursePrefix: '',
        maxAvgHours: '',
        minAvgSalary: ''
    });

    const [coursePrefixes, setCoursePrefixes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coursesStats, setCoursesStats] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const coursesPerPage = 25;

    // Cargar prefijos de cursos desde Supabase
    useEffect(() => {
        const fetchCoursePrefixes = async () => {
            try {
                const { data, error } = await supabase
                    .from('Course_prefixes')
                    .select('*')
                    .order('prefix', { ascending: true });

                if (error) {
                    console.error('Error fetching course prefixes:', error);
                } else {
                    setCoursePrefixes(data || []);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchCoursePrefixes();
    }, []);

    // Función para cargar cursos con paginación y filtros
    const fetchCoursesStats = async (page = 1) => {
        setLoading(true);
        try {
            const hasActiveFilters = debouncedFilters.courseInitial || 
                                     debouncedFilters.coursePrefix || 
                                     debouncedFilters.maxAvgHours || 
                                     debouncedFilters.minAvgSalary ||
                                     debouncedSearchQuery;

            // Para filtros de rango de salario, no enviar p_min_salary al backend
            // porque el frontend manejará el filtrado por rango completo
            const params = {
                p_page: page,
                p_page_size: coursesPerPage,
                p_course_initial: debouncedFilters.courseInitial?.trim() || null,
                p_course_prefix: debouncedFilters.coursePrefix?.trim() || null,
                p_max_hours: debouncedFilters.maxAvgHours?.trim() ? parseFloat(debouncedFilters.maxAvgHours) : null,
                p_min_salary: null, // Siempre null, el frontend maneja el filtrado por rango
                p_search_query: debouncedSearchQuery?.trim() || null
            };

            const { data, error } = await supabase.rpc('get_courses_stats_paginated', params);

            if (error) {
                console.error('Error fetching courses stats:', error);
                setCoursesStats([]);
                setTotalCourses(0);
                setTotalPages(0);
            } else if (data && Array.isArray(data)) {
                // Filtrar cursos sin reviews solo cuando hay filtros de datos numéricos
                // (no cuando solo se busca por sigla/prefijo/texto)
                let filteredData = data;
                const hasDataFilters = debouncedFilters.maxAvgHours || debouncedFilters.minAvgSalary;
                
                if (hasDataFilters) {
                    filteredData = data.filter(course => {
                        // Excluir cursos sin reviews cuando hay filtros de datos
                        if (!course.reviews_count || course.reviews_count === 0) {
                            return false;
                        }
                        
                        // Si se filtra por salario, aplicar filtro de rango
                        if (debouncedFilters.minAvgSalary) {
                            const minSalary = parseFloat(debouncedFilters.minAvgSalary);
                            
                            // Excluir cursos con N/A en salario
                            if (!course.avg_salary_midpoint || course.avg_salary_midpoint === null) {
                                return false;
                            }
                            
                            // Si es "250 mil o más", mostrar todos los cursos >= 250k
                            if (minSalary === 250000) {
                                if (course.avg_salary_midpoint < 250000) {
                                    return false;
                                }
                            } else {
                                // Para rangos, incluir cursos cuyo salario promedio esté dentro del rango
                                // Ejemplo: rango "$10.000 - $20.000" incluye cursos con salario entre 10.000 y 19.999.99
                                const maxSalary = minSalary + 10000;
                                if (course.avg_salary_midpoint < minSalary || course.avg_salary_midpoint >= maxSalary) {
                                    return false;
                                }
                            }
                        }
                        
                        // Si se filtra por horas máximas, excluir cursos con N/A en horas
                        if (debouncedFilters.maxAvgHours && 
                            (!course.avg_month_hours || course.avg_month_hours === null)) {
                            return false;
                        }
                        
                        return true;
                    });
                }
                
                setCoursesStats(filteredData);
                // Obtener el total original de la función RPC
                const originalTotal = data.length > 0 ? (data[0].total_count || 0) : 0;
                // Cuando hay filtros activos y filtramos cursos sin datos,
                // el total puede ser menor, pero mantenemos el original para la paginación
                // ya que el backend ya aplicó los filtros principales
                setTotalCourses(originalTotal);
                setTotalPages(Math.ceil(originalTotal / coursesPerPage));
                setCurrentPage(page);
            } else {
                setCoursesStats([]);
                setTotalCourses(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error:', error);
            setCoursesStats([]);
            setTotalCourses(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // Debounce para searchQuery (espera 500ms después de que el usuario deja de escribir)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounce para filtros (espera 500ms después de que el usuario deja de escribir)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    // Cargar cursos cuando cambian los filtros debounced (resetea a página 1)
    useEffect(() => {
        setCurrentPage(1);
        fetchCoursesStats(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, debouncedFilters]);

    // Cambiar de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && !loading) {
            fetchCoursesStats(newPage);
            // Scroll al inicio de la página
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            courseInitial: '',
            coursePrefix: '',
            maxAvgHours: '',
            minAvgSalary: ''
        });
        setSearchQuery('');
        // También limpiar los valores debounced inmediatamente
        setDebouncedFilters({
            courseInitial: '',
            coursePrefix: '',
            maxAvgHours: '',
            minAvgSalary: ''
        });
        setDebouncedSearchQuery('');
        setCurrentPage(1);
    };

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

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                {/* Título */}
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                    Buscador de cursos
                </h1>

                {/* Subtítulo */}
                <p className="text-xl text-white/90 mb-8">
                    Explora cursos y conoce las <span className='text-yellow-400'>estadísticas promedio</span> basadas en las experiencias de ayudantes!
                </p>

                {/* Barra de búsqueda */}
                <form onSubmit={(e) => e.preventDefault()} className="w-full mb-8">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none z-10">
                            <svg
                                className="w-6 h-6 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre de curso o sigla..."
                            className="w-full pl-16 pr-6 py-5 text-lg bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                        />
                    </div>
                </form>

                {/* Filtros rápidos */}
                <div className="bg-white/5 backdrop-blur-sm border-2 border-blue-400/20 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Filtros rápidos</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filtro por sigla de curso */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Sigla del curso
                            </label>
                            <input
                                type="text"
                                value={filters.courseInitial}
                                onChange={(e) => handleFilterChange('courseInitial', e.target.value)}
                                placeholder="Ej: IIC2143"
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all uppercase"
                                maxLength={10}
                            />
                        </div>

                        {/* Filtro por prefijo */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Prefijo del curso
                            </label>
                            <select
                                value={filters.coursePrefix}
                                onChange={(e) => handleFilterChange('coursePrefix', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            >
                                <option value="">Todos los prefijos</option>
                                {coursePrefixes.map((prefix) => (
                                    <option key={prefix.id} value={prefix.prefix} className="bg-blue-900">
                                        {prefix.prefix}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por horas mensuales máximas promedio */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Horas mensuales máximas promedio
                            </label>
                            <input
                                type="number"
                                value={filters.maxAvgHours}
                                onChange={(e) => handleFilterChange('maxAvgHours', e.target.value)}
                                placeholder="Ej: 30"
                                min="0"
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            />
                        </div>

                        {/* Filtro por salario promedio mínimo */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Salario promedio mínimo (CLP)
                            </label>
                            <select
                                value={filters.minAvgSalary}
                                onChange={(e) => handleFilterChange('minAvgSalary', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            >
                                <option value="">Sin mínimo</option>
                                <option value="0" className="bg-blue-900">$0 - $10.000</option>
                                <option value="10000" className="bg-blue-900">$10.000 - $20.000</option>
                                <option value="20000" className="bg-blue-900">$20.000 - $30.000</option>
                                <option value="30000" className="bg-blue-900">$30.000 - $40.000</option>
                                <option value="40000" className="bg-blue-900">$40.000 - $50.000</option>
                                <option value="50000" className="bg-blue-900">$50.000 - $60.000</option>
                                <option value="60000" className="bg-blue-900">$60.000 - $70.000</option>
                                <option value="70000" className="bg-blue-900">$70.000 - $80.000</option>
                                <option value="80000" className="bg-blue-900">$80.000 - $90.000</option>
                                <option value="90000" className="bg-blue-900">$90.000 - $100.000</option>
                                <option value="100000" className="bg-blue-900">$100.000 - $110.000</option>
                                <option value="110000" className="bg-blue-900">$110.000 - $120.000</option>
                                <option value="120000" className="bg-blue-900">$120.000 - $130.000</option>
                                <option value="130000" className="bg-blue-900">$130.000 - $140.000</option>
                                <option value="140000" className="bg-blue-900">$140.000 - $150.000</option>
                                <option value="150000" className="bg-blue-900">$150.000 - $160.000</option>
                                <option value="160000" className="bg-blue-900">$160.000 - $170.000</option>
                                <option value="170000" className="bg-blue-900">$170.000 - $180.000</option>
                                <option value="180000" className="bg-blue-900">$180.000 - $190.000</option>
                                <option value="190000" className="bg-blue-900">$190.000 - $200.000</option>
                                <option value="200000" className="bg-blue-900">$200.000 - $210.000</option>
                                <option value="210000" className="bg-blue-900">$210.000 - $220.000</option>
                                <option value="220000" className="bg-blue-900">$220.000 - $230.000</option>
                                <option value="230000" className="bg-blue-900">$230.000 - $240.000</option>
                                <option value="240000" className="bg-blue-900">$240.000 - $250.000</option>
                                <option value="250000" className="bg-blue-900">$250.000 o más</option>
                            </select>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4 mt-6">
                        {loading && (
                            <div className="px-6 py-3 bg-yellow-400/50 text-blue-950 font-semibold rounded-lg flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-950"></div>
                                Buscando...
                            </div>
                        )}
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-transparent border-2 border-blue-400 text-white font-semibold rounded-lg hover:bg-blue-400/20 transition-all duration-200"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {/* Lista de cursos */}
                {loading ? (
                    <div className="text-center text-white/70 py-12">
                        <p>Cargando cursos...</p>
                    </div>
                ) : coursesStats.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {coursesStats.map((course) => (
                                <CourseCard key={course.course_id} courseStats={course} />
                            ))}
                        </div>

                        {/* Controles de paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 text-white rounded-lg hover:bg-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Anterior
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Mostrar solo algunas páginas alrededor de la actual
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 2 && page <= currentPage + 2)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    disabled={loading}
                                                    className={`px-4 py-2 rounded-lg transition-all ${
                                                        currentPage === page
                                                            ? 'bg-yellow-400 text-blue-950 font-semibold'
                                                            : 'bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 text-white hover:bg-blue-400/20'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 3 ||
                                            page === currentPage + 3
                                        ) {
                                            return <span key={page} className="text-white/50">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || loading}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 text-white rounded-lg hover:bg-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-white/70 py-12">
                        <p>No se encontraron cursos con estos filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CoursesExplore;
