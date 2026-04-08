import React from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/cn';

interface ExportMenuProps {
  className?: string;
  dropDirection?: 'up' | 'down';
  fullWidth?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  className,
  dropDirection = 'down',
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<'xlsx' | 'pdf' | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleXlsx = async () => {
    setLoading('xlsx');
    try {
      // Carga dinámica de la utilidad y sus librerías pesadas
      const { flattenOrgData, exportToXlsx } = await import('../lib/exportUtils');
      await exportToXlsx(flattenOrgData());
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  };

  const handlePdf = async () => {
    setLoading('pdf');
    try {
      // Carga dinámica para no saturar el bundle inicial
      const { flattenOrgData, exportToPdf } = await import('../lib/exportUtils');
      await exportToPdf(flattenOrgData());
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  };

  const dropdownStyle = dropDirection === 'up'
    ? { bottom: '100%', marginBottom: '0.5rem', transformOrigin: 'bottom right' }
    : { top: '100%', marginTop: '0.5rem', transformOrigin: 'top right' };

  return (
    <div ref={ref} className={cn('relative', fullWidth && 'w-full', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center gap-2 px-5 py-2.5 bg-(--institutional-blue) hover:brightness-110 active:brightness-95',
          'text-white rounded-xl font-bold transition-all',
          'shadow-[0_4px_12px_rgba(74,109,167,0.35)] active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-(--institutional-blue) focus:ring-offset-2 focus:ring-offset-(--page-bg)',
          fullWidth && 'w-full'
        )}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        <span>Exportar</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: dropDirection === 'up' ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: dropDirection === 'up' ? 8 : -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.8 }}
            style={{ ...dropdownStyle, position: 'absolute', right: 0, zIndex: 50 }}
            className="w-56 bg-(--card-bg) border border-(--border-color) rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <button
              onClick={handleXlsx}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-(--page-text) hover:bg-(--page-bg) transition-colors border-b border-(--border-color) disabled:opacity-50 text-left focus:outline-none focus:bg-(--page-bg)"
            >
              <FileSpreadsheet size={18} className="text-emerald-600 shrink-0" />
              <span>{loading === 'xlsx' ? 'Exportando...' : 'Exportar como Excel'}</span>
            </button>
            <button
              onClick={handlePdf}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-(--page-text) hover:bg-(--page-bg) transition-colors disabled:opacity-50 text-left focus:outline-none focus:bg-(--page-bg)"
            >
              <FileText size={18} className="text-red-600 shrink-0" />
              <span>{loading === 'pdf' ? 'Generando PDF...' : 'Exportar como PDF'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
