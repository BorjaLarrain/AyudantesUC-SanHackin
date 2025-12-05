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
    const [coursePrefixes, setCoursePrefixes] = useState([]);
    const [loading, setLoading] = useState(false);

    // configurar la paginacion
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const reviewsPerPage = 25;

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

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            // Construir la query base
            let query = supabase
                .from('Reviews')
                .select(`
                    *,
                    Courses (
                        id,
                        name,
                        initial,
                        Course_prefixes (
                            prefix
                        )
                    )
                `);

            // Filtrar por sigla de curso
            if (filters.courseInitial) {
                query = query.eq('Courses.initial', filters.courseInitial.toUpperCase());
            }

            // Filtrar por prefijo
            if (filters.coursePrefix) {
                query = query.eq('Courses.Course_prefixes.prefix', filters.coursePrefix);
            }

            // Filtrar por salario mínimo
            if (filters.minSalary) {
                query = query.gte('min_salary', parseInt(filters.minSalary));
            }

            // Para el rating, necesitarías calcular el promedio de reviews por curso
            // Esto podría requerir una función o vista en Supabase
            // Por ahora, lo dejamos como comentario

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching reviews:', error);
            } else {
                console.log('Resultados:', data);
                // Aquí procesarías y mostrarías los resultados
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            courseInitial: '',
            coursePrefix: '',
            minRating: '',
            minSalary: ''
        });
        setSearchQuery('');
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
                <form onSubmit={handleSearch} className="w-full mb-8">
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
                                <option value="4.5" className="bg-blue-900">4.5+ ⭐</option>
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
                        <button
                            onClick={applyFilters}
                            disabled={loading}
                            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Buscando...' : 'Aplicar filtros'}
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-transparent border-2 border-blue-400 text-white font-semibold rounded-lg hover:bg-blue-400/20 transition-all duration-200"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {/* Aquí irán los resultados cuando implementes la búsqueda */}
                {searchQuery && (
                    <div className="mt-8 text-center text-white/70">
                        <p>Buscando: <span className="font-semibold text-white">{searchQuery}</span></p>
                        <p className="text-sm mt-2">Los resultados aparecerán aquí cuando conectes la base de datos</p>
                    </div>
                )}
                {/* Lista de reviews */}
                {loading ? (
                    <div className="text-center text-white/70 py-12">
                        <p>Cargando reviews...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mb-8">
                            {reviews.map((review) => (
                                <div key={review.id} onClick={() => handleReviewClick(review.id)}>
                                <ReviewCard key={review.id} review={review} />
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