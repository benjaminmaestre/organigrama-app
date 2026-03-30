import React from 'react';
import { orgData } from './data';
import { MemberCard } from './components/MemberCard';
import { ExportMenu } from './components/ExportMenu';
import { cn } from './lib/cn';
import { Layout, Search, Shield, Radio, Bed, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'coordination' | 'program' | 'accommodation'>('coordination');
  const [showWhatsAppTip, setShowWhatsAppTip] = React.useState(false);
  const [pendingScrollId, setPendingScrollId] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeDeptIdxs, setActiveDeptIdxs] = React.useState<number[]>([]);
  const deptRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [activeCommitteeCards, setActiveCommitteeCards] = React.useState<string[]>([]);
  const committeeRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const presidencyRef = React.useRef<HTMLDivElement | null>(null);

  const [observerTrigger, setObserverTrigger] = React.useState(0);

  const buildMemberId = (member: any) => {
    const raw = `${member.name ?? ''}-${member.role ?? ''}-${member.phone ?? ''}-${member.email ?? ''}`;
    return `member-${raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}`;
  };

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (!isMobile) return;

    const showTimer = window.setTimeout(() => {
      setShowWhatsAppTip(true);
    }, 5000);

    const hideTimer = window.setTimeout(() => {
      setShowWhatsAppTip(false);
    }, 10000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isMobile]);

  React.useEffect(() => {
    const entries = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (observed) => {
        observed.forEach((e) => entries.set(e.target, e.intersectionRatio));
        const active: number[] = [];
        deptRefs.current.forEach((el, idx) => {
          if (!el) return;
          const ratio = entries.get(el) ?? 0;
          const threshold = el.offsetHeight > window.innerHeight * 0.6 ? 0.08 : 0.45;
          if (ratio > threshold) {
            active.push(idx);
          }
        });
        setActiveDeptIdxs(active);
      },
      { threshold: [0, 0.05, 0.08, 0.1, 0.25, 0.45, 0.75, 1] }
    );
    deptRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeTab, observerTrigger]);

  React.useEffect(() => {
    const entriesMap = new Map<Element, number>();
    const ids = ['coordination', 'program', 'accommodation', 'presidency'];
    const observer = new IntersectionObserver(
      (observed) => {
        observed.forEach((e) => entriesMap.set(e.target, e.intersectionRatio));
        const active: string[] = [];
        const allRefs = [...committeeRefs.current, presidencyRef.current];
        allRefs.forEach((el, idx) => {
          if (!el) return;
          const ratio = entriesMap.get(el) ?? 0;
          if (ratio > 0.5) {
            active.push(ids[idx]);
          }
        });
        setActiveCommitteeCards(active);
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.75, 1] }
    );
    [...committeeRefs.current, presidencyRef.current].forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const coordinationDept = orgData.subDepartments?.find((d) => d.name === 'Coordinación del Comité');
  const programDept = orgData.subDepartments?.find((d) => d.name === 'Programa');
  const accommodationDept = orgData.subDepartments?.find((d) => d.name === 'Alojamiento y Servicios');

  const presidencyData = { ...orgData, subDepartments: [] };

  const tabs = [
    { id: 'coordination', label: 'Coordinación', icon: Shield, color: 'text-blue-500', data: coordinationDept },
    { id: 'program', label: 'Programa', icon: Radio, color: 'text-purple-500', data: programDept },
    { id: 'accommodation', label: 'Alojamiento', icon: Bed, color: 'text-emerald-500', data: accommodationDept },
  ] as const;

  const normalizedSearch = searchTerm.toLowerCase().trim();

  const matchesText = (value?: string) => {
    if (!normalizedSearch) return true;
    return value?.toLowerCase().includes(normalizedSearch) ?? false;
  };

  const memberDirectMatch = (member: any) => {
    if (!normalizedSearch) return true;

    return (
      matchesText(member.name) ||
      matchesText(member.role) ||
      matchesText(member.congregation) ||
      matchesText(member.email) ||
      matchesText(member.phone)
    );
  };

  const memberMatchesSearch = (member: any): boolean => {
    if (!normalizedSearch) return true;

    const directMatch = memberDirectMatch(member);
    if (directMatch) return true;

    const auxiliariesMatch = member.auxiliaries?.some((aux: any) => memberMatchesSearch(aux)) ?? false;
    if (auxiliariesMatch) return true;

    const groupsMatch =
      member.groups?.some((group: any) => {
        if (matchesText(group.name)) return true;
        return group.members?.some((groupMember: any) => memberMatchesSearch(groupMember));
      }) ?? false;

    if (groupsMatch) return true;

    const subDepartmentsMatch =
      member.subDepartments?.some((dept: any) => {
        if (matchesText(dept.name)) return true;
        return memberMatchesSearch(dept.head);
      }) ?? false;

    return subDepartmentsMatch;
  };

  const globalSearchResults = React.useMemo(() => {
    if (!normalizedSearch) return [];

    const results: Array<{
      memberId: string;
      name: string;
      role: string;
      department: string;
      tabId: 'coordination' | 'program' | 'accommodation';
      phone?: string;
      email?: string;
    }> = [];

    const pushIfMatch = (
      member: any,
      tabId: 'coordination' | 'program' | 'accommodation',
      department: string
    ) => {
      if (!member) return;

      if (memberDirectMatch(member)) {
        const memberId = buildMemberId(member);

        const alreadyExists = results.some(
          (item) =>
            item.memberId === memberId &&
            item.department === department &&
            item.tabId === tabId
        );

        if (!alreadyExists) {
          results.push({
            memberId,
            name: member.name,
            role: member.role,
            department,
            tabId,
            phone: member.phone,
            email: member.email,
          });
        }
      }

      member.auxiliaries?.forEach((aux: any) => pushIfMatch(aux, tabId, department));

      member.groups?.forEach((group: any) => {
        group.members?.forEach((groupMember: any) =>
          pushIfMatch(groupMember, tabId, `${department} • ${group.name}`)
        );
      });

      member.subDepartments?.forEach((dept: any) => {
        if (matchesText(dept.name)) {
          const memberId = buildMemberId(dept.head);

          const exists = results.some(
            (item) =>
              item.memberId === memberId &&
              item.department === dept.name &&
              item.tabId === tabId
          );

          if (!exists) {
            results.push({
              memberId,
              name: dept.head.name,
              role: dept.head.role,
              department: dept.name,
              tabId,
              phone: dept.head.phone,
              email: dept.head.email,
            });
          }
        }

        pushIfMatch(dept.head, tabId, dept.name);
      });
    };

    tabs.forEach((tab) => {
      if (tab.data?.head) {
        pushIfMatch(tab.data.head, tab.id, tab.label);
      }
    });

    return results;
  }, [normalizedSearch]);

  React.useEffect(() => {
    if (!normalizedSearch || globalSearchResults.length === 0 || pendingScrollId) return;

    const firstMatchTab = globalSearchResults[0].tabId;

    if (activeTab !== firstMatchTab) {
      setActiveTab(firstMatchTab);
    }
  }, [normalizedSearch, globalSearchResults, activeTab, pendingScrollId]);

  React.useEffect(() => {
    if (!pendingScrollId) return;

    const timer = window.setTimeout(() => {
      const element = document.getElementById(pendingScrollId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        const htmlElement = element as HTMLElement;
        const previousOutline = htmlElement.style.outline;
        const previousBoxShadow = htmlElement.style.boxShadow;
        const previousBorderRadius = htmlElement.style.borderRadius;

        htmlElement.style.outline = '2px solid rgba(59, 130, 246, 0.95)';
        htmlElement.style.boxShadow = '0 0 0 6px rgba(59, 130, 246, 0.18)';
        htmlElement.style.borderRadius = '18px';

        window.setTimeout(() => {
          htmlElement.style.outline = previousOutline;
          htmlElement.style.boxShadow = previousBoxShadow;
          htmlElement.style.borderRadius = previousBorderRadius;
        }, 1800);
      }

      setPendingScrollId(null);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pendingScrollId, activeTab]);

  const filteredTabs = tabs
    .map((tab) => {
      if (!tab.data) return tab;

      if (!normalizedSearch) return tab;

      const filteredSubDepartments =
        tab.data.head.subDepartments?.filter((dept) => {
          return matchesText(dept.name) || memberMatchesSearch(dept.head);
        }) ?? [];

      const tabHeadMatches = memberMatchesSearch(tab.data.head);
      const tabNameMatches = matchesText(tab.label);

      if (!tabHeadMatches && !tabNameMatches && filteredSubDepartments.length === 0) {
        return {
          ...tab,
          data: undefined,
        };
      }

      return {
        ...tab,
        data: {
          ...tab.data,
          head: {
            ...tab.data.head,
            subDepartments: filteredSubDepartments,
          },
        },
      };
    })
    .filter((tab) => !normalizedSearch || tab.data);

  const filteredActiveTabData = filteredTabs.find((t) => t.id === activeTab)?.data;

  const handleSearchResultClick = (item: {
    memberId: string;
    tabId: 'coordination' | 'program' | 'accommodation';
    name: string;
  }) => {
    setActiveTab(item.tabId);
    setPendingScrollId(item.memberId);
    setSearchTerm(item.name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden font-sans pb-20">
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
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />

            <input
              type="text"
              placeholder="Buscar por nombre, departamento, correo, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-slate-600"
            />

            {normalizedSearch && (
              <div className="absolute top-full mt-2 w-full bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                {globalSearchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {globalSearchResults.map((item, idx) => (
                      <button
                        key={`${item.memberId}-${idx}`}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800/80 transition-colors border-b border-slate-800 last:border-b-0"
                      >
                        <div className="text-white text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {item.role} • {item.department}
                        </div>
                        {(item.phone || item.email) && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            {item.phone ? item.phone : item.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-400">
                    No se encontraron resultados.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ExportMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8 md:py-12 relative flex flex-col gap-16 md:gap-24">
        <div className="md:hidden flex items-center gap-2 w-full">
          <div className="relative group flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
            <input
              type="text"
              placeholder="Buscar nombre, correo, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white placeholder:text-slate-600 shadow-lg"
            />

            {normalizedSearch && (
              <div className="absolute top-full mt-2 w-full bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                {globalSearchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {globalSearchResults.map((item, idx) => (
                      <button
                        key={`${item.memberId}-${idx}-mobile`}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-800/80 transition-colors border-b border-slate-800 last:border-b-0"
                      >
                        <div className="text-white text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {item.role} • {item.department}
                        </div>
                        {(item.phone || item.email) && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            {item.phone ? item.phone : item.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-400">
                    No se encontraron resultados.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <ExportMenu dropDirection="down" />
          </div>
        </div>

        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Comité de Asamblea</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {filteredTabs.map((tab, tabIdx) => (
              <div
                key={tab.id}
                ref={(el) => {
                  committeeRefs.current[tabIdx] = el;
                }}
                className="space-y-4 md:space-y-6"
              >
                <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 py-2 rounded-xl border border-slate-800/50 shadow-inner">
                  {tab.label}
                </div>
                <div className="space-y-4 md:space-y-6">
                  {tab.data && (
                    <MemberCard
                      member={tab.data.head}
                      showDepartments={false}
                      initiallyExpanded={true}
                      isHighlighted={activeCommitteeCards.includes(tab.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {memberMatchesSearch(presidencyData) && (
            <div
              ref={presidencyRef}
              className="pt-12 border-t border-slate-800/20 max-w-6xl mx-auto w-full"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Presidencia</h3>
              </div>

              <div className="flex justify-center">
                <MemberCard
                  member={presidencyData}
                  isMain={true}
                  initiallyExpanded={true}
                  isHighlighted={activeCommitteeCards.includes('presidency')}
                  desktopHorizontalAuxiliaries={true}
                />
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 mx-[-1rem] px-1 py-8 md:mx-0 md:px-8 lg:px-12 lg:py-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="text-center mb-10 px-4 md:px-0">
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Explorador de Departamentos</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Selecciona una categoría para ver los departamentos correspondientes y sus superintendentes.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 p-2 bg-slate-950/80 rounded-2xl border border-slate-800 mb-16 shadow-2xl mx-4 md:mx-0">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'coordination' | 'program' | 'accommodation')}
                  className={cn(
                    'flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(30,144,255,0.4)] scale-105'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  )}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : tab.color} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onAnimationStart={() => setObserverTrigger((prev) => prev + 1)}
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-0 md:px-0"
              >
                {filteredActiveTabData?.head.subDepartments?.map((dept, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      deptRefs.current[idx] = el;
                    }}
                    className={cn(
                      'group flex flex-col gap-3 transition-all duration-500',
                      dept.name === 'Audio y Video' ? 'lg:col-span-3 md:col-span-2' : 'col-span-1'
                    )}
                  >
                    <div className="flex items-center gap-2 px-4 md:pl-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em] transition-colors group-hover:text-blue-400">
                      <GraduationCap size={14} />
                      {dept.name}
                    </div>
                    <div className="px-0 md:px-0">
                      <MemberCard
                        member={dept.head}
                        initiallyExpanded={true}
                        isHighlighted={activeDeptIdxs.includes(idx)}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {normalizedSearch &&
              (!filteredActiveTabData?.head.subDepartments || filteredActiveTabData.head.subDepartments.length === 0) && (
                <div className="text-center text-slate-400 mt-4 px-4">
                  No se encontraron resultados en esta categoría.
                </div>
              )}
          </div>
        </section>

        <footer className="pt-12 text-center text-slate-600 text-[10px] pb-12 tracking-[0.3em] uppercase font-bold border-t border-slate-800/20">
          &copy; 2026 Asamblea Regional Medellin 4 • Felices Para Siempre
        </footer>
      </main>

      <div
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => !isMobile && setShowWhatsAppTip(true)}
        onMouseLeave={() => !isMobile && setShowWhatsAppTip(false)}
      >
        <AnimatePresence>
          {showWhatsAppTip && (
            <motion.div
              initial={{ opacity: 0, scale: 1.3, y: 6 }}
              animate={{ opacity: 1, scale: 1.3, y: 0 }}
              exit={{ opacity: 0, scale: 1.3, y: 6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.9 }}
              style={{ transformOrigin: 'bottom right' }}
              className="absolute bottom-16 right-0 max-w-[260px] rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md"
            >
              <p className="leading-relaxed">
                ¿Tienes alguna pregunta sobre un departamento? Escríbenos por WhatsApp.
              </p>
              <div className="absolute bottom-[-6px] right-5 w-3 h-3 rotate-45 bg-slate-900 border-r border-b border-slate-700" />
            </motion.div>
          )}
        </AnimatePresence>

        <a
          href="https://wa.me/573007830254"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (isMobile) setShowWhatsAppTip(false);
          }}
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:bg-[#128C7E] hover:scale-110 transition-all duration-300"
          aria-label="Contactar por WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.96.55 3.8 1.5 5.37L2 22l4.82-1.52c1.51.87 3.25 1.34 5.17 1.34 5.51 0 9.98-4.47 9.98-9.99S17.52 2.01 12.01 2.01zm5.2 14.18c-.22.61-1.12 1.15-1.56 1.25-.41.09-1.02.24-3.17-.65-2.61-1.08-4.31-3.79-4.44-3.96-.13-.17-1.06-1.41-1.06-2.68 0-1.28.66-1.91.9-2.19.23-.28.53-.35.7-.35.17 0 .34 0 .49.01.16.01.38-.06.6.48.23.57.75 1.83.82 1.97.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.32.37-.45.5-.15.16-.31.33-.13.64.18.31.81 1.33 1.73 2.15 1.18 1.06 2.19 1.39 2.5 1.53.31.14.49.12.67-.08.18-.21.78-.9.99-1.21.21-.31.43-.26.71-.15.28.1 1.8.85 2.1 1.01.3.16.51.24.58.37.07.13.07.76-.15 1.37z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default App;