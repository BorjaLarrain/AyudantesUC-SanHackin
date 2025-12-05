import { useState } from "react";
import { useNavigate , Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { UserAuth } from "../context/AuthContext";


export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(""); // Nuevo estado para el teléfono
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  
  // Manejar login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  // Manejar registro
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError("El nombre es requerido");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          display_name: fullName.trim(),
          phone: phone.trim(), // Guardar el teléfono en user_metadata
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone(""); // Limpiar el campo de teléfono también
      setError(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 relative">
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

      

      {/* Contenido del formulario */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
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
              Volver al inicio
            </Link>
          </div>

            {/* Tabs */}
            <div dir="ltr" data-orientation="horizontal" className="w-full">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => {
                    setActiveTab("signin");
                    setError(null);
                    setSuccess(false);
                  }}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === "signin"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    setActiveTab("signup");
                    setError(null);
                    setSuccess(false);
                  }}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === "signup"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Registrarse
                </button>
              </div>
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && activeTab === "signup" && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                ¡Registro exitoso! Revisa tu email para confirmar tu cuenta.
              </div>
            )}

            {/* Formulario de Iniciar Sesión */}
            {activeTab === "signin" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="signin-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Correo UC
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.email@uc.cl"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signin-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contraseña
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Funcionalidad de recuperar contraseña próximamente");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>
              </form>
            )}

            {/* Formulario de Registrarse */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre Completo
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Número de Teléfono
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Correo UC
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.email@uc.cl"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contraseña
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Registrando..." : "Registrarse"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}