import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

type MapTab = {
  id: 'campus' | 'coliseo';
  label: string;
  subtitle: string;
  src: string;
  icon: React.ReactNode;
};

const MAP_TABS: MapTab[] = [
  {
    id: 'campus',
    label: 'Mapa Campus',
    subtitle: 'Universidad de Medellín',
    src: '/campus.png',
    icon: <MapPin size={18} />,
  },
  {
    id: 'coliseo',
    label: 'Mapa Coliseo',
    subtitle: 'Distribución interna del recinto',
    src: '/coliseo.png',
    icon: <Building2 size={18} />,
  },
];

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? '8%' : '-8%',
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-8%' : '8%',
    opacity: 0,
    scale: 0.97,
  }),
};

const SLIDE_TRANSITION = {
  duration: 0.7,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

export function MapasSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);

  const currentMap = MAP_TABS[activeIndex];

  const handleGoTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (activeIndex === 0) return;
    handleGoTo(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex === MAP_TABS.length - 1) return;
    handleGoTo(activeIndex + 1);
  };

  // Auto-play: advance every 4 seconds, pause when lightbox is open
  React.useEffect(() => {
    if (isLightboxOpen) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % MAP_TABS.length);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [isLightboxOpen, activeIndex]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const threshold = 60;
    if (info.offset.x < -threshold) handleNext();
    else if (info.offset.x > threshold) handlePrev();
  };

  const handleOpenLightbox = () => setIsLightboxOpen(true);
  const handleCloseLightbox = () => setIsLightboxOpen(false);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft' && isLightboxOpen) handlePrev();
      if (e.key === 'ArrowRight' && isLightboxOpen) handleNext();
    };
    document.addEventListener('keydown', handleKey);
    if (isLightboxOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, activeIndex]);

  return (
    <>
      <section className="bg-(--card-bg) rounded-[2.5rem] border border-(--border-color) -mx-4 px-4 py-8 md:mx-0 md:px-8 lg:px-12 lg:py-12 relative overflow-hidden transition-all duration-300">
        {/* Background glow */}
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-(--page-text) mb-2 uppercase tracking-tight transition-colors">
              Sede del Evento
            </h2>
            <p className="text-(--text-muted) text-sm max-w-md mx-auto transition-colors">
              Asambleas Regionales · Medellín 2026
            </p>
            <div className="w-16 h-1 bg-(--institutional-blue) mx-auto rounded-full mt-4 shadow-[0_2px_10px_rgba(74,109,167,0.3)]" />
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex gap-2 p-1.5 bg-(--page-bg) rounded-2xl border border-(--border-color)">
              {MAP_TABS.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => handleGoTo(idx)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300',
                    activeIndex === idx
                      ? 'bg-(--institutional-blue) text-white shadow-md'
                      : 'text-(--text-muted) hover:text-(--page-text)'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Prev arrow */}
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Imagen anterior"
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                'bg-white/95 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
                'hover:scale-110 active:scale-95',
                activeIndex === 0 || !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}
            >
              <ChevronLeft size={20} className="text-slate-700" />
            </button>

            {/* Next arrow */}
            <button
              onClick={handleNext}
              disabled={activeIndex === MAP_TABS.length - 1}
              aria-label="Siguiente imagen"
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                'bg-white/95 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
                'hover:scale-110 active:scale-95',
                activeIndex === MAP_TABS.length - 1 || !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}
            >
              <ChevronRight size={20} className="text-slate-700" />
            </button>

            {/* Slide area — fixed aspect ratio so absolute slides can overlap */}
            <div
              className="relative overflow-hidden rounded-2xl border border-(--border-color) shadow-xl aspect-4/3 bg-slate-100 dark:bg-slate-900 cursor-zoom-in group"
              onClick={handleOpenLightbox}
            >
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={SLIDE_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SLIDE_TRANSITION}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.06}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 select-none"
                >
                  <img
                    src={currentMap.src}
                    alt={currentMap.label}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Hover overlay */}
              <div className={cn(
                "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none z-10",
                !showControls && "opacity-0"
              )}>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm text-slate-700 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                  <ZoomIn size={16} />
                  Ver en pantalla completa
                </div>
              </div>
            </div>

            {/* Dots + caption */}
            <div className={cn(
              "mt-4 flex flex-col items-center gap-3 transition-opacity duration-300",
              !showControls && "opacity-0 pointer-events-none"
            )}>
              <div className="flex items-center gap-2">
                {MAP_TABS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGoTo(idx)}
                    aria-label={`Ir a ${MAP_TABS[idx].label}`}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      activeIndex === idx
                        ? 'w-6 h-2 bg-(--institutional-blue)'
                        : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                    )}
                  />
                ))}
              </div>

              <div className="text-xs text-(--text-muted) flex items-center gap-1.5">
                {currentMap.icon}
                <span>{currentMap.subtitle}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={handleCloseLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative max-w-6xl w-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowControls(!showControls);
              }}
            >
              {/* Close button */}
              <button
                onClick={handleCloseLightbox}
                className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>

              <img
                src={currentMap.src}
                alt={currentMap.label}
                className="w-full h-auto rounded-2xl shadow-2xl object-contain max-h-[75vh]"
                draggable={false}
              />

              {/* Lightbox Navigation - Repositioned to bottom to avoid overlapping content */}
              <div className={cn(
                "mt-6 flex items-center justify-between gap-4 transition-all duration-300",
                !showControls && "opacity-0 pointer-events-none translate-y-4"
              )}>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  disabled={activeIndex === 0}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10",
                    activeIndex === 0 && "opacity-20 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft size={24} />
                </button>

                <p className="text-center text-white/80 text-sm font-medium flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/5">
                  {currentMap.icon}
                  {currentMap.label}
                </p>

                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  disabled={activeIndex === MAP_TABS.length - 1}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10",
                    activeIndex === MAP_TABS.length - 1 && "opacity-20 cursor-not-allowed"
                  )}
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <p className={cn(
                "text-center text-white/40 text-[10px] mt-4 uppercase tracking-widest transition-opacity duration-300",
                !showControls && "opacity-0"
              )}>
                {currentMap.subtitle}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
