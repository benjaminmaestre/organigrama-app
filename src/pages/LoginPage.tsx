import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Mail, Lock, Loader2, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../features/seguimiento/api/supabaseClient';

type AuthMode = 'login' | 'forgot' | 'change';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<AuthMode>('login');
  
  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  // UI states
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Redirigir si ya tiene sesión activa real en Supabase
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/seguimiento', { replace: true });
      }
    });
  }, [navigate]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanedEmail = email.toLowerCase().trim();

    if (!cleanedEmail || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      setLoading(false);
      return;
    }

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });

    if (authErr || !data.session) {
      setError(authErr?.message || 'No fue posible iniciar sesión con Supabase Auth.');
      setLoading(false);
      return;
    }

    localStorage.removeItem('mock-session');
    localStorage.removeItem('mock-user');

    setLoading(false);
    navigate('/seguimiento', { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanedEmail = email.toLowerCase().trim();

    if (!cleanedEmail) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
      redirectTo: redirectUrl,
    });

    if (resetErr) {
      setError(resetErr.message || 'No se pudo enviar el correo de restablecimiento.');
    } else {
      setSuccessMsg('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
    }

    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanedEmail = email.toLowerCase().trim();

    if (!cleanedEmail || !password || !newPassword || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setLoading(true);

    // 1. Re-autenticar con credenciales actuales
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });

    if (authErr || !data.session) {
      setError('Contraseña actual incorrecta o usuario no encontrado.');
      setLoading(false);
      return;
    }

    // 2. Actualizar contraseña
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      setError(updateErr.message || 'Error al actualizar la contraseña.');
    } else {
      setSuccessMsg('Contraseña actualizada exitosamente. Redirigiendo...');
      setTimeout(() => {
        navigate('/seguimiento', { replace: true });
      }, 2000);
    }

    setLoading(false);
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
          {/* VISTA 1: INICIAR SESIÓN */}
          {mode === 'login' && (
            <>
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
                  <div className="flex items-center justify-between pl-1 pr-1">
                    <label htmlFor="password" className="text-xs font-bold text-(--page-text) uppercase tracking-wider">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-all"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
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

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('change')}
                    className="text-xs font-bold text-(--text-muted) hover:text-(--page-text) transition-colors underline"
                  >
                    ¿Deseas cambiar tu contraseña?
                  </button>
                </div>
              </form>
            </>
          )}

          {/* VISTA 2: RECUPERAR CONTRASEÑA */}
          {mode === 'forgot' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
                  <KeyRound size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-(--page-text) tracking-tight">Recuperar Contraseña</h2>
                <p className="text-xs sm:text-sm text-(--text-muted) mt-2">
                  Ingresa tu correo registrado para recibir un enlace de restablecimiento.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
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

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-500" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="emailForgot" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      id="emailForgot"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@jwpub.org"
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
                      <span>Enviando solicitud...</span>
                    </>
                  ) : (
                    <span>Enviar Enlace de Recuperación</span>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-(--text-muted) hover:text-(--page-text) transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver al inicio de sesión</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* VISTA 3: CAMBIAR CONTRASEÑA */}
          {mode === 'change' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
                  <KeyRound size={28} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-(--page-text) tracking-tight">Cambiar Contraseña</h2>
                <p className="text-xs sm:text-sm text-(--text-muted) mt-2">
                  Ingresa tus datos actuales y tu nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
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

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-500" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label htmlFor="emailChange" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      id="emailChange"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@jwpub.org"
                      className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="currentPassword" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                    Contraseña Actual
                  </label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      id="currentPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="newPassChange" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      id="newPassChange"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmPassChange" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      id="confirmPassChange"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
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
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Actualizar Contraseña</span>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-(--text-muted) hover:text-(--page-text) transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver al inicio de sesión</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
