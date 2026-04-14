import { 
  Shield, GraduationCap, Users, ShieldCheck, 
  Calculator, Car, HeartPulse, Video, Droplets, Home, 
  Info, Hammer, Sparkles, Archive, Truck, 
  Wifi, Volume2, AppWindow
} from 'lucide-react';

export const getDeptIcon = (name: string, size: number = 20) => {
  const n = name.toLowerCase();
  
  // Audio & Video group specifics
  if (n === 'audio') return <Volume2 size={size} />;
  if (n === 'video') return <Video size={size} />;
  if (n === 'plataforma') return <AppWindow size={size} />;
  if (n === 'stream' || n === 'jw stream') return <Wifi size={size} />;

  // General departments
  if (n.includes('acomodador')) return <Users size={size} />;
  if (n.includes('coordinador de seguridad')) return <ShieldCheck size={size} />;
  if (n.includes('contabilidad')) return <Calculator size={size} />;
  if (n.includes('estacionamiento')) return <Car size={size} />;
  if (n.includes('primeros auxilios')) return <HeartPulse size={size} />;
  if (n.includes('seguridad')) return <Shield size={size} />;
  if (n.includes('audio') && n.includes('video')) return (
    <div className="flex items-center gap-1">
      <Volume2 size={size} />
      <Video size={size} />
    </div>
  );
  if (n.includes('audio')) return <Volume2 size={size} />;
  if (n.includes('video')) return <Video size={size} />;
  if (n.includes('bautismo')) return <Droplets size={size} />;
  if (n.includes('alojamiento')) return <Home size={size} />;
  if (n.includes('información')) return <Info size={size} />;
  if (n.includes('instalación')) return <Hammer size={size} />;
  if (n.includes('limpieza')) return <Sparkles size={size} />;
  if (n.includes('objetos perdidos') || n.includes('guardarropa')) return <Archive size={size} />;
  if (n.includes('transporte') || n.includes('materiales')) return <Truck size={size} />;
  
  return <GraduationCap size={size} />;
};
