import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, MapPin, Building2, ChevronLeft, ChevronRight, ZoomOut } from 'lucide-react';
import { cn } from '../lib/cn';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Zoom } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/zoom';

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
    src: '/mapa_campus.svg',
    icon: <MapPin size={18} />,
  },
  {
    id: 'coliseo',
    label: 'Mapa Coliseo',
    subtitle: 'Distribución interna del recinto',
    src: '/mapa_coliseo.png',
    icon: <Building2 size={18} />,
  },
];

export function MapasSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const mainSwiperRef = React.useRef<SwiperType | null>(null);
  const lightboxSwiperRef = React.useRef<SwiperType | null>(null);

  const currentMap = MAP_TABS[activeIndex];

  const handleGoTo = (index: number) => {
    setActiveIndex(index);
    if (mainSwiperRef.current) mainSwiperRef.current.slideToLoop(index);
    if (lightboxSwiperRef.current) lightboxSwiperRef.current.slideTo(index);
  };

  const handlePrev = () => {
    if (isLightboxOpen) {
      if (lightboxSwiperRef.current) lightboxSwiperRef.current.slidePrev();
    } else {
      if (mainSwiperRef.current) mainSwiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (isLightboxOpen) {
      if (lightboxSwiperRef.current) lightboxSwiperRef.current.slideNext();
    } else {
      if (mainSwiperRef.current) mainSwiperRef.current.slideNext();
    }
  };

  const handleOpenLightbox = () => {
    setIsLightboxOpen(true);
  };
  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxSwiperRef.current?.zoom) {
      lightboxSwiperRef.current.zoom.in();
    }
  };
  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxSwiperRef.current?.zoom) {
      lightboxSwiperRef.current.zoom.out();
    }
  };
  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxSwiperRef.current?.zoom) {
      lightboxSwiperRef.current.zoom.out();
    }
  };

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
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-(--page-text) mb-2 uppercase tracking-tight transition-colors">
              Sede del Evento
            </h2>
            <p className="text-(--text-muted) text-sm max-w-md mx-auto transition-colors">
              Asambleas Regionales · Medellín 2026
            </p>
            <div className="w-16 h-1 bg-(--institutional-blue) mx-auto rounded-full mt-4 shadow-[0_2px_10px_rgba(74,109,167,0.3)]" />
          </div>

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

          <div className="relative group">
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-20 md:hidden pointer-events-none">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 pointer-events-auto border border-slate-100 dark:border-slate-700"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 pointer-events-auto border border-slate-100 dark:border-slate-700"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="rounded-2xl border border-(--border-color) shadow-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative min-h-[320px] md:min-h-[450px]">
              <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={true}
                autoplay={{ delay: 8000, disableOnInteraction: false }}
                pagination={{ clickable: true, el: '.custom-pagination' }}
                onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                className="w-full h-full"
              >
                {MAP_TABS.map((map) => (
                  <SwiperSlide key={map.id}>
                    <div className="w-full h-full cursor-zoom-in relative flex items-center justify-center p-4 md:p-8" onClick={handleOpenLightbox}>
                      <img
                        src={map.src}
                        alt={map.label}
                        className="max-w-full max-h-[400px] md:max-h-[550px] object-contain select-none transition-transform duration-500 hover:scale-[1.01] rounded-lg shadow-sm"
                        loading="lazy"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center group/zoom">
                        <div className="opacity-100 md:opacity-0 md:group-hover/zoom:opacity-100 transition-all transform scale-90 md:scale-100 bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold text-white shadow-2xl border border-white/20">
                          <ZoomIn size={18} className="text-blue-400" />
                          Ampliar mapa
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="custom-pagination flex items-center gap-2 !static" />
              <div className="flex items-center gap-2 text-sm font-medium text-(--text-muted) bg-(--page-bg) px-4 py-2 rounded-full border border-(--border-color) shadow-sm transition-all duration-300">
                {currentMap.icon}
                <span>{currentMap.subtitle}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex flex-col bg-black/95 backdrop-blur-2xl"
            onClick={handleCloseLightbox}
          >
            <div className="flex-none p-4 md:px-8 flex items-center justify-between z-50 bg-black/60 border-b border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/5">
                  {currentMap.icon}
                </div>
                <div className="hidden xs:block">
                  <h3 className="text-white font-bold leading-tight">{currentMap.label}</h3>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">{currentMap.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 mr-4 pr-4 border-r border-white/10">
                  <button onClick={handleZoomIn} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/5">
                    <ZoomIn size={20} />
                  </button>
                  <button onClick={handleZoomOut} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/5">
                    <ZoomOut size={20} />
                  </button>
                  <button onClick={handleResetZoom} className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[10px] font-black border border-white/5">
                    1:1
                  </button>
                </div>
                <button onClick={handleCloseLightbox} className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center group border border-red-500/10">
                  <X size={22} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <Swiper
                modules={[Navigation, Zoom]}
                zoom={{
                  maxRatio: 5,
                  minRatio: 1,
                  toggle: true, // Allow double tap to zoom
                }}
                initialSlide={activeIndex}
                onSwiper={(swiper) => {
                  lightboxSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                   setActiveIndex(swiper.realIndex);
                }}
                className="w-full h-full"
              >
                {MAP_TABS.map((map) => (
                  <SwiperSlide key={map.id} className="overflow-hidden">
                    <div className="swiper-zoom-container w-full h-full flex items-center justify-center p-4 md:p-12 lg:p-20" onClick={e => e.stopPropagation()}>
                      <img
                        src={map.src}
                        alt={map.label}
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                        draggable={false}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button onClick={handlePrev} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center hidden lg:flex border border-white/5 shadow-2xl">
                <ChevronLeft size={32} />
              </button>
              <button onClick={handleNext} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center hidden lg:flex border border-white/5 shadow-2xl">
                <ChevronRight size={32} />
              </button>
            </div>

            <div className="sm:hidden absolute bottom-28 right-6 flex flex-col gap-3 z-50">
              <button onClick={handleZoomIn} className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xl text-white flex items-center justify-center border border-white/20 shadow-2xl">
                <ZoomIn size={24} />
              </button>
              <button onClick={handleZoomOut} className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xl text-white flex items-center justify-center border border-white/20 shadow-2xl">
                <ZoomOut size={24} />
              </button>
            </div>

            <div className="flex-none p-6 flex flex-col items-center gap-3">
              <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                {activeIndex + 1} / {MAP_TABS.length}
              </div>
              <p className="text-white/20 text-[9px] uppercase tracking-widest font-medium">Doble toque para zoom · Desliza para cambiar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-pagination .swiper-pagination-bullet {
          width: 8px; height: 8px; background: #cbd5e1; opacity: 1; transition: all 0.3s ease; border-radius: 4px;
        }
        .custom-pagination .swiper-pagination-bullet-active { width: 24px; background: #4a6da7; }
        .dark .custom-pagination .swiper-pagination-bullet { background: #334155; }
        .dark .custom-pagination .swiper-pagination-bullet-active { background: #5b7bb1; }
        
        .swiper-zoom-container {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
      `}} />
    </>
  );
}
