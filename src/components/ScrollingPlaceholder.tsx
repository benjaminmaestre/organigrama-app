import { motion } from 'framer-motion';

type ScrollingPlaceholderProps = {
  texts: string[];
  intervalMs?: number;
  className?: string;
};

export function ScrollingPlaceholder({
  texts,
  className = '',
}: ScrollingPlaceholderProps) {
  // Unimos los textos con un separador elegante
  const scrollingText = texts.join('  ') + '  ';

  return (
    <div className={`pointer-events-none overflow-hidden whitespace-nowrap relative ${className}`}>
      {/* Máscara opcional para suavizar los bordes si el contenedor es estrecho */}
      <div className="flex" style={{ width: 'max-content' }}>
        <motion.div
          animate={{
            x: [0, '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 35, // Ajusta este número para cambiar la velocidad de la cinta
              ease: 'linear',
            },
          }}
          className="flex whitespace-nowrap"
        >
          <span className="pr-4">{scrollingText}</span>
          <span className="pr-4">{scrollingText}</span>
          <span className="pr-4">{scrollingText}</span>
          <span className="pr-4">{scrollingText}</span>
        </motion.div>
      </div>
    </div>
  );
}
