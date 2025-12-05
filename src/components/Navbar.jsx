import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';

const Navbar = () => {
    const { session, loading } = UserAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const displayName =
        session?.user?.user_metadata?.display_name ||
        session?.user?.user_metadata?.full_name ||
        session?.user?.email?.split('@')[0] ||
        'Usuario';

    return (
        <nav className="relative z-20 w-full px-6 py-4 bg-blue-950/50 backdrop-blur-sm border-b border-blue-400/20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-white">
                        Ayudantes<span className="text-yellow-400">UC</span>
                    </div>
                </Link>

                {/* Botones centrales - Explorar */}
                <div className="flex items-center gap-3">
                    {/* <Link
                        to="/explore"
                        className="px-6 py-2 bg-yellow-400 text-blue-950 font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                    >
                        Explorar Reseñas
                    </Link> */}
                    <Link
                        to="/courses"
                        className="px-6 py-2 bg-yellow-400 text-blue-950 font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                    >
                        Explorar Cursos
                    </Link>
                    {/* <Link
                        to="/courses"
                        className="px-6 py-2 bg-transparent border-2 border-blue-400 text-white font-semibold rounded-full hover:bg-blue-400/20 transition-colors"
                    >
                        Explorar Cursos
                    </Link> */}
                </div>

                {/* Navigation Links */}
                <div className="flex items-center gap-6">
                    {loading ? (
                        // Mientras carga, mostrar un placeholder
                        <div className="w-20 h-8 bg-gray-700/50 rounded animate-pulse"></div>
                    ) : session ? (
                        // Si hay sesión, mostrar nombre de usuario y botón de cerrar sesión
                        <>
                            <span className="text-white/90">
                                Hola, {displayName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors hover:cursor-pointer"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        // Si no hay sesión, mostrar botones de login y registro
                        <>
                            <Link
                                to="/signin"
                                className="text-white/90 hover:text-white transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 bg-yellow-400 text-blue-950 font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;