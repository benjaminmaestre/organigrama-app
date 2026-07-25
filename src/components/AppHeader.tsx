import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, ArrowLeft } from 'lucide-react';

interface AppHeaderProps {
  user?: { email: string; full_name?: string } | null;
  onLogout?: () => Promise<void>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const isLoginPage = location.pathname === '/login';
  const isSeguimientoPage = location.pathname === '/seguimiento';

  return (
    <header className="sticky top-0 z-50 bg-(--header-bg) backdrop-blur-xl border-b border-(--header-border) transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo and Titles */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden transition-colors">
            <img src="/jwevent.png" alt="JW.ORG Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center gap-0.5 md:gap-1.5">
            <h1 className="text-base sm:text-lg md:text-2xl font-black text-(--page-text) tracking-tight leading-tight transition-colors">
              Organigrama Asamblea Regional 2026
            </h1>
            <p className="text-[9px] md:text-[11px] text-(--text-muted) font-bold uppercase tracking-[0.2em] transition-colors">
              Medellín 4 • Felices Para Siempre
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-(--input-bg) border border-slate-300 dark:border-(--border-color) text-(--page-text) hover:bg-(--page-bg) hover:text-(--institutional-blue) focus:outline-none focus:ring-2 focus:ring-(--institutional-blue)/30 transition-all shadow-sm active:scale-95 flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Navigation/Session Buttons */}
          {isLoginPage ? (
            <button
              onClick={() => navigate('/')}
              className="p-2.5 rounded-xl bg-(--input-bg) border border-slate-300 dark:border-(--border-color) text-(--page-text) hover:bg-(--page-bg) hover:text-(--institutional-blue) focus:outline-none focus:ring-2 focus:ring-(--institutional-blue)/30 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 min-h-[44px] px-3 font-semibold text-xs sm:text-sm"
            >
              <ArrowLeft size={18} />
              <span>Volver al Organigrama</span>
            </button>
          ) : isSeguimientoPage ? (
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-(--page-text)">{user.full_name || user.email}</span>
                  <span className="text-[10px] text-(--text-muted) uppercase font-semibold">Superintendencia de Alojamiento</span>
                </div>
              )}
              <button
                onClick={() => navigate('/')}
                className="p-2.5 rounded-xl bg-(--input-bg) border border-slate-300 dark:border-(--border-color) text-(--page-text) hover:bg-(--page-bg) hover:text-(--institutional-blue) focus:outline-none focus:ring-2 focus:ring-(--institutional-blue)/30 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 min-h-[44px] px-3 font-semibold text-xs sm:text-sm"
              >
                <span>Organigrama</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 min-h-[44px] px-3 font-semibold text-xs sm:text-sm"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
