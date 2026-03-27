import React from 'react';
import { orgData } from './data';
import { MemberCard } from './components/MemberCard';
import { Layout, Search, Filter, Download, Users, Shield, Radio, Bed, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'coordination' | 'program' | 'accommodation'>('coordination');

  // Extract Committee members and their departments
  const coordinationDept = orgData.subDepartments?.find(d => d.name === "Coordinación del Comité");
  const programDept = orgData.subDepartments?.find(d => d.name === "Programa");
  const accommodationDept = orgData.subDepartments?.find(d => d.name === "Alojamiento y Servicios");

  // Section 2 Data: President only (without repeating the committee departments)
  const presidencyData = { ...orgData, subDepartments: [] };

  const tabs = [
    { id: 'coordination', label: 'Coordinación', icon: Shield, color: 'text-blue-500', data: coordinationDept },
    { id: 'program', label: 'Programa', icon: Radio, color: 'text-purple-500', data: programDept },
    { id: 'accommodation', label: 'Alojamiento', icon: Bed, color: 'text-emerald-500', data: accommodationDept },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)?.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(30,144,255,0.4)]">
              <Layout className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Asamblea Regional 2026</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Medellín 4 • Felices Para Siempre</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_4px_10px_rgba(30,144,255,0.3)] hover:scale-105 active:scale-95">
              <Download size={18} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-12 relative flex flex-col gap-24">
        
        {/* Section 1: Executive Dashboard (Fixed High-Level Roles) */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Comité de Asamblea</h2>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tabs.map((tab) => (
              <div key={tab.id} className="space-y-6">
                <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 py-2 rounded-xl border border-slate-800/50 shadow-inner">{tab.label}</div>
                <div className="space-y-6">
                  {tab.data && (
                    <>
                      <MemberCard member={tab.data.head} showDepartments={false} initiallyExpanded={true} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Presidency Section inside the Dashboard */}
          <div className="pt-12 border-t border-slate-800/20 max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Presidencia</h3>
            </div>

            <div className="flex justify-center">
              <MemberCard member={presidencyData} isMain={true} initiallyExpanded={true} />
            </div>
          </div>
        </section>

        {/* Section 2: Department Explorer (The Interactive Idea) */}
        <section className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Explorador de Departamentos</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">Selecciona una categoría para ver los departamentos correspondientes y sus superintendentes.</p>
            </div>

            {/* Tab Selector */}
            <div className="flex flex-wrap justify-center gap-3 p-2 bg-slate-950/80 rounded-2xl border border-slate-800 mb-16 shadow-2xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-blue-600 text-white shadow-[0_4px_15px_rgba(30,144,255,0.4)] scale-105" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                  )}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? "text-white" : tab.color} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Department Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {activeTabData?.head.subDepartments?.map((dept, idx) => (
                  <div key={idx} className="group flex flex-col gap-3">
                    <div className="flex items-center gap-2 pl-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em] transition-colors group-hover:text-blue-400">
                      <GraduationCap size={14} />
                      {dept.name}
                    </div>
                    <MemberCard member={dept.head} initiallyExpanded={true} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <footer className="pt-12 text-center text-slate-600 text-[10px] pb-12 tracking-[0.3em] uppercase font-bold border-t border-slate-800/20">
          &copy; 2026 Asamblea Regional Medellin 4 • Felices Para Siempre
        </footer>
      </main>
    </div>
  );
}

// Utility for class merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default App;
