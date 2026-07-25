import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Redirigir si ya tiene sesión activa
  React.useEffect(() => {
    if (localStorage.getItem('mock-session') === 'true') {
      navigate('/seguimiento', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Pequeño timeout para simular latencia de red de forma elegante
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cleanedEmail = email.toLowerCase().trim();
    
    // Lista de usuarios válidos para el seguimiento de Alojamiento
    const validEmails = ['dartjfe@gmail.com', 'benjaminmaestre@gmail.com'];

    if (!cleanedEmail || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      setLoading(false);
      return;
    }

    if (!validEmails.includes(cleanedEmail)) {
      setError('Este correo no está registrado en la Superintendencia de Alojamiento.');
      setLoading(false);
      return;
    }

    // Aceptamos cualquier contraseña mock para la Fase 1
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    // Configurar sesión mock
    const fullName = cleanedEmail === 'dartjfe@gmail.com' ? 'Jhonny Florez' : 'Benjamín Pérez';
    localStorage.setItem('mock-session', 'true');
    localStorage.setItem('mock-user', JSON.stringify({
      email: cleanedEmail,
      full_name: fullName,
      role: cleanedEmail === 'dartjfe@gmail.com' ? 'accommodation_superintendent' : 'accommodation_assistant'
    }));

    setLoading(false);
    navigate('/seguimiento');
  };

  return (
    <div className="min-h-screen flex flex-col bg-(--page-bg) text-(--page-text) font-sans overflow-x-hidden transition-colors duration-300">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] md:w-[40%] md:h-[40%] bg-blue-500/10 blur-[60px] md:blur-[120px] rounded-full opacity-(--blob-opacity)" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] md:w-[40%] md:h-[40%] bg-purple-500/10 blur-[60px] md:blur-[120px] rounded-full opacity-(--blob-opacity)" />
      </div>

      <AppHeader />

      <main className="grow flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="w-full max-w-md bg-white/60 dark:bg-slate-900/30 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
              <Lock size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-(--page-text) tracking-tight">Acceso Privado</h2>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-2">
              Ingresa tus credenciales autorizadas de la Superintendencia de Alojamiento.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@jwpub.org"
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-(--institutional-blue) hover:brightness-110 active:brightness-95 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-98 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
