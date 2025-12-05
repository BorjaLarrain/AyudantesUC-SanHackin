import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="relative z-20 w-full px-6 py-4 bg-blue-950/50 backdrop-blur-sm border-b border-blue-400/20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-white">
                        Ayudantes<span className="text-yellow-400">UC</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-6">
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
                </div>
            </div>
        </nav>
    );
}

export default Navbar;