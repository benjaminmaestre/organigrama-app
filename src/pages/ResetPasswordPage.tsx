import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { Lock, KeyRound, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../features/seguimiento/api/supabaseClient';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        throw updateErr;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/seguimiento', { replace: true });
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la contraseña.';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
              <KeyRound size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-(--page-text) tracking-tight">
              Establecer Nueva Contraseña
            </h2>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-2">
              Ingresa tu nueva contraseña para actualizar el acceso a tu cuenta.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 size={24} className="shrink-0 text-emerald-500" />
                <div className="text-left text-xs font-semibold">
                  ¡Contraseña actualizada exitosamente! Redirigiendo al panel...
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
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
                <label htmlFor="newPassword" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                  Nueva Contraseña
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-(--page-text) uppercase tracking-wider pl-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Guardando contraseña...</span>
                  </>
                ) : (
                  <span>Actualizar Contraseña</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-(--text-muted) hover:text-(--page-text) transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Volver al inicio de sesión</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
