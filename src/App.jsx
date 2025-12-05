import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { UserAuth } from './context/AuthContext';

function App() {
  const { session, loading } = UserAuth();
  const navigate = useNavigate();

  const handlePublishReview = () => {
    if (loading) return; // Esperar a que cargue la autenticación
    
    if (!session) {
      // Si no está logueado, redirigir a signin
      navigate('/signin');
    } else {
      // Si está logueado, redirigir a explore donde puede seleccionar un curso
      navigate('/explore');
    }
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

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16">
        {/* Badge */}
        <div className="mb-8 px-6 py-3 rounded-full bg-blue-400/20 border-2 border-blue-400 flex items-center gap-3 backdrop-blur-sm">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M12 14l-9-5M12 14l9-5M12 14v-9" />
          </svg>
          <span className="text-white font-semibold text-lg">Plataforma de Reviews de Ayudantías</span>
        </div>

        {/* Headline */}
        <h1 className="text-center mb-6 max-w-4xl">
          <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2">
            Encuentra la
          </span>
          <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-yellow-400 mb-2">
            ayudantía perfecta
          </span>
          <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-white">
            en la UC
          </span>
        </h1>

        {/* Description */}
        <p className="text-center text-white/90 text-lg md:text-xl max-w-2xl mb-12 px-4 leading-relaxed">
          Descubre experiencias reales de estudiantes que han sido ayudantes. Conoce salarios, carga horaria y recomendaciones antes de postular.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            to="/explore"
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-semibold rounded-full flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar Reviews
          </Link>

          <button
            onClick={handlePublishReview}
            className="px-8 py-4 bg-transparent border-2 border-blue-400 text-white font-semibold rounded-full flex items-center gap-3 transition-all duration-200 hover:bg-blue-400/20 hover:border-blue-300 shadow-lg hover:shadow-xl hover:scale-105 hover:cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Publicar Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;