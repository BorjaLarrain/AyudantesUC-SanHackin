import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import supabase from '../config/supabaseClient';
import ReviewCard from '../components/ReviewCard';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        courseInitial: '', // Sigla del curso
        coursePrefix: '', // Prefijo del curso
        minRating: '', // Rating mínimo
        minSalary: '' // Salario mínimo
    });

    // Estados debounced (valores que se usan para la búsqueda después de que el usuario deja de escribir)
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [debouncedFilters, setDebouncedFilters] = useState({
        courseInitial: '',
        coursePrefix: '',
        minRating: '',
        minSalary: ''
    });

    const [coursePrefixes, setCoursePrefixes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    // configurar la paginacion
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const reviewsPerPage = 25;

    // Cargar prefijos de cursos desde Supabase
    // useEffect que obtiene los prefijos de Supabase cuando se monta el componente
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

    // Función para cargar todas las reviews con paginación
    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            console.log('Fetching reviews for page:', page);
            // Primero, contar el total de reviews
            const { count, error: countError } = await supabase
                .from('Reviews')
                .select('*', { count: 'exact', head: true });

            if (countError) {
                console.error('Error counting reviews:', countError);
            } else {
                setTotalReviews(count || 0);
                const totalPagesCalc = Math.ceil((count || 0) / reviewsPerPage);
                setTotalPages(totalPagesCalc);
            }

            // Calcular el rango para la paginación
            const start = (page - 1) * reviewsPerPage;
            const end = start + reviewsPerPage - 1;

            // Obtener las reviews con paginación
            // Ajusta esta query según la estructura de tu tabla Reviews
            const { data, error } = await supabase
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
                .order('created_at', { ascending: false }) // Ordenar por más reciente
                .range(start, end);

            if (error) {
                console.error('Error fetching reviews:', error);
            } else {
                setReviews(data || []);
                console.log('Reviews fetched:', data);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar reviews cuando se monta el componente
    useEffect(() => {
        fetchReviews(1);
    }, []);

    // Cambiar de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchReviews(newPage);
            // Scroll al inicio de la página
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Aquí irá la lógica de búsqueda con filtros
        console.log('Buscando:', searchQuery);
        console.log('Filtros:', filters);
        applyFilters();
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

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // useEffect para buscar las reviews a supabase
    // Ahora usa los valores debounced en lugar de los valores en tiempo real
    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);

            try {
                // Paso 1: Obtener IDs de cursos que coincidan con búsqueda de texto y filtros
                let courseQuery = supabase
                    .from("Courses")
                    .select("id, name, initial");

                // Si hay filtro por sigla, aplicarlo
                if (debouncedFilters.courseInitial) {
                    courseQuery = courseQuery.ilike("initial", `%${debouncedFilters.courseInitial.toUpperCase()}%`);
                }

                // Si hay búsqueda por texto, buscar en cursos
                if (debouncedSearchQuery) {
                    courseQuery = courseQuery.or(`name.ilike.%${debouncedSearchQuery}%,initial.ilike.%${debouncedSearchQuery}%`);
                }

                const { data: matchingCourses, error: courseError } = await courseQuery;

                if (courseError) {
                    console.error("Error fetching courses:", courseError);
                }

                // Filtrar por prefijo si está activo O si la búsqueda de texto parece ser un prefijo
                let filteredCourseIds = null;

                // Si hay filtro de prefijo específico
                if (debouncedFilters.coursePrefix) {
                    const coursesWithPrefix = (matchingCourses || []).filter(course => {
                        const coursePrefix = course.initial?.substring(0, 3).toUpperCase();
                        return coursePrefix === debouncedFilters.coursePrefix.toUpperCase();
                    });
                    filteredCourseIds = coursesWithPrefix.length > 0 ? coursesWithPrefix.map(c => c.id) : [];
                }
                // Si hay búsqueda de texto, también buscar por prefijo (primeras 3 letras)
                else if (debouncedSearchQuery && debouncedSearchQuery.length <= 3) {
                    // Si la búsqueda tiene 3 caracteres o menos, probablemente es un prefijo
                    const searchUpper = debouncedSearchQuery.toUpperCase();
                    const coursesWithPrefix = (matchingCourses || []).filter(course => {
                        const coursePrefix = course.initial?.substring(0, 3).toUpperCase();
                        return coursePrefix === searchUpper;
                    });

                    // También incluir cursos que coincidan por nombre o sigla completa
                    const allMatchingCourses = new Set([
                        ...coursesWithPrefix.map(c => c.id),
                        ...(matchingCourses || []).map(c => c.id)
                    ]);
                    filteredCourseIds = Array.from(allMatchingCourses);
                }
                // Si hay búsqueda de texto más larga, buscar también por prefijo
                else if (debouncedSearchQuery) {
                    const searchUpper = debouncedSearchQuery.toUpperCase();
                    // Buscar cursos donde el prefijo coincida (si la búsqueda tiene al menos 3 caracteres)
                    const coursesWithPrefix = (matchingCourses || []).filter(course => {
                        const coursePrefix = course.initial?.substring(0, 3).toUpperCase();
                        return coursePrefix === searchUpper.substring(0, 3);
                    });

                    // Combinar todos los cursos que coincidan
                    const allMatchingCourses = new Set([
                        ...coursesWithPrefix.map(c => c.id),
                        ...(matchingCourses || []).map(c => c.id)
                    ]);
                    filteredCourseIds = Array.from(allMatchingCourses);
                }
                else if (matchingCourses && matchingCourses.length > 0) {
                    filteredCourseIds = matchingCourses.map(c => c.id);
                }

                // Paso 2: Construir la query de Reviews
                let reviewsQuery = supabase
                    .from("Reviews")
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
                `);

                // Si hay filtros de curso específicos (sigla o prefijo), aplicarlos
                if (debouncedFilters.courseInitial || debouncedFilters.coursePrefix) {
                    if (filteredCourseIds && filteredCourseIds.length > 0) {
                        reviewsQuery = reviewsQuery.in("course_id", filteredCourseIds);
                    } else {
                        // Si hay filtros de curso pero no se encontraron cursos, no hay resultados
                        setResults([]);
                        setLoading(false);
                        return;
                    }
                } else if (filteredCourseIds && filteredCourseIds.length > 0 && debouncedSearchQuery) {
                    // Si hay búsqueda de texto Y encontramos cursos, incluir reviews de esos cursos
                    reviewsQuery = reviewsQuery.in("course_id", filteredCourseIds);
                }

                // Búsqueda por texto en título de reviews (SIEMPRE si hay búsqueda de texto)
                if (debouncedSearchQuery) {
                    if (filteredCourseIds && filteredCourseIds.length > 0 && (debouncedFilters.courseInitial || debouncedFilters.coursePrefix)) {
                        // Si hay filtros de curso Y búsqueda de texto, buscar en título también
                        reviewsQuery = reviewsQuery.or(`title.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`);
                    } else if (filteredCourseIds && filteredCourseIds.length > 0) {
                        // Si solo hay búsqueda de texto y encontramos cursos, buscar en título O en esos cursos
                        reviewsQuery = reviewsQuery.or(`title.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`);
                    } else {
                        // Si solo hay búsqueda de texto y NO encontramos cursos, buscar solo en título
                        reviewsQuery = reviewsQuery.or(`title.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`);
                    }
                }

                // Filtrar por rating mínimo
                console.log(debouncedFilters.minRating)
                if (debouncedFilters.minRating) {
                    console.log("ENTRO ACA!")
                    reviewsQuery = reviewsQuery.gte("rating", parseFloat(debouncedFilters.minRating));
                }

                // Filtrar por salario mínimo
                if (debouncedFilters.minSalary) {
                    reviewsQuery = reviewsQuery.gte("min_salary", parseInt(debouncedFilters.minSalary));
                }

                // Ejecutar la query
                const { data, error } = await reviewsQuery;

                if (error) {
                    console.error("Ocurrió un error:", error);
                    setResults([]);
                } else {
                    // Procesar los datos
                    let processedData = data || [];

                    // Filtrado post-procesamiento para asegurar que coincida con la búsqueda
                    if (debouncedSearchQuery && processedData.length > 0) {
                        const searchLower = debouncedSearchQuery.toLowerCase();
                        const searchUpper = debouncedSearchQuery.toUpperCase();
                        processedData = processedData.filter(review => {
                            // Debe coincidir en título de review O en nombre/sigla/prefijo del curso
                            const matchesTitle = review.title?.toLowerCase().includes(searchLower);
                            const matchesCourseName = review.Courses?.name?.toLowerCase().includes(searchLower);
                            const matchesCourseInitial = review.Courses?.initial?.toLowerCase().includes(searchLower);

                            // También verificar el prefijo (primeras 3 letras)
                            const coursePrefix = review.Courses?.initial?.substring(0, 3).toUpperCase();
                            const matchesPrefix = coursePrefix === searchUpper.substring(0, 3);

                            return matchesTitle || matchesCourseName || matchesCourseInitial || matchesPrefix;
                        });
                    }

                    // Ordenar: reviews con rating más alto primero
                    processedData.sort((a, b) => {
                        return (b.rating || 0) - (a.rating || 0);
                    });
                    setResults(processedData);
                    console.log("Resultados encontrados:", processedData);
                }
            } catch (error) {
                console.error("Error en fetchResults:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedSearchQuery, debouncedFilters]);

    const clearFilters = () => {
        setFilters({
            courseInitial: '',
            coursePrefix: '',
            minRating: '',
            minSalary: ''
        });
        setSearchQuery('');
        // También limpiar los valores debounced inmediatamente
        setDebouncedFilters({
            courseInitial: '',
            coursePrefix: '',
            minRating: '',
            minSalary: ''
        });
        setDebouncedSearchQuery('');
    };

    const handleReviewClick = (reviewId) => {
        navigate(`/review/${reviewId}`);
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
                    Buscador de reseñas
                </h1>

                {/* Subtítulo */}
                <p className="text-xl text-white/90 mb-8">
                    Encuentra la <span className='text-yellow-400'>ayudantía perfecta para ti</span> y conoce las experiencias de otros estudiantes!
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
                            placeholder="Buscar por curso, profesor o palabra clave..."
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

                        {/* Filtro por rating mínimo */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Rating mínimo
                            </label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            >
                                <option value="">Sin mínimo</option>
                                <option value="1" className="bg-blue-900">1+ ⭐</option>
                                <option value="2" className="bg-blue-900">2+ ⭐</option>
                                <option value="3" className="bg-blue-900">3+ ⭐</option>
                                <option value="4" className="bg-blue-900">4+ ⭐</option>
                                <option value="5" className="bg-blue-900">5 ⭐</option>
                            </select>
                        </div>

                        {/* Filtro por salario mínimo */}
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Salario mínimo (CLP)
                            </label>
                            <input
                                type="number"
                                value={filters.minSalary}
                                onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                                placeholder="Ej: 200000"
                                min="0"
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                            />
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

                {/* Lista de reviews */}
                {loading ? (
                    <div className="text-center text-white/70 py-12">
                        <p>Cargando reviews...</p>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mb-8">
                            {results.map((review) => (
                                <div key={review.id} onClick={() => handleReviewClick(review.id)}>
                                <ReviewCard key={review.id} review={review} className="hover:pointer-cursor"/>
                                </div>
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
                        <p>No se encontraron reviews.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Explore;