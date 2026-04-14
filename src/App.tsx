import React from 'react';
import { orgData } from './data';
import { MemberCard } from './components/MemberCard';
import { ExportMenu } from './components/ExportMenu';
import { MapasSection } from './components/MapasSection';
import { ScrollingPlaceholder } from './components/ScrollingPlaceholder';
import { cn } from './lib/cn';
import { 
  Search, Shield, Radio, Bed, Sun, Moon
} from 'lucide-react';
import { getDeptIcon } from './lib/icons';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_HINTS = [
  'Buscar por nombre...',
  'Buscar por departamento...',
  'Buscar por correo...',
  'Buscar por teléfono...',
  'Buscar por congregación...',
];

function App() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved as 'light' | 'dark';
      return 'dark';
    }
    return 'dark';
  });

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
    const timer = window.setTimeout(() => {
      setShowWhatsAppTip(true);
    }, 2000);
    return () => window.clearTimeout(timer);
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
    <div className="min-h-screen flex flex-col bg-(--page-bg) text-(--page-text) overflow-x-hidden font-sans transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full opacity-(--blob-opacity)" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full opacity-(--blob-opacity)" />
      </div>

      <header className="sticky top-0 z-50 bg-(--header-bg) backdrop-blur-xl border-b border-(--header-border) transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden transition-colors">
              <img src="/jwevent.png" alt="JW.ORG Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center gap-0.5 md:gap-1.5">
              <h1 className="text-base sm:text-lg md:text-2xl font-black text-(--page-text) tracking-tight leading-tight transition-colors">Organigrama Asamblea Regional 2026</h1>
              <p className="text-[9px] md:text-[11px] text-(--text-muted) font-bold uppercase tracking-[0.2em] transition-colors">Medellín 4 • Felices Para Siempre</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-400 dark:group-focus-within:text-blue-400 transition-colors z-10" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-(--institutional-blue)/20 focus:border-(--institutional-blue)/50 transition-all text-(--page-text)"
            />

            {!searchTerm && (
              <div className="absolute left-10 right-4 top-1/2 -translate-y-1/2 text-sm text-(--text-muted) pointer-events-none z-10 overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <ScrollingPlaceholder texts={SEARCH_HINTS} />
              </div>
            )}

            {normalizedSearch && (
              <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                {globalSearchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {globalSearchResults.map((item, idx) => (
                      <button
                        key={`${item.memberId}-${idx}`}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                      >
                        <div className="text-slate-900 dark:text-white text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.role} • {item.department}
                        </div>
                        {(item.phone || item.email) && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            {item.phone ? item.phone : item.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                    No se encontraron resultados.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-(--input-bg) border border-slate-300 dark:border-(--border-color) text-(--page-text) hover:bg-(--page-bg) hover:text-(--institutional-blue) focus:outline-none focus:ring-2 focus:ring-(--institutional-blue)/30 transition-all shadow-sm active:scale-95 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="hidden sm:block">
              <ExportMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="grow max-w-[1600px] mx-auto px-4 py-6 md:py-12 relative flex flex-col gap-8 md:gap-24 w-full">
        <div className="md:hidden flex items-center gap-2 w-full">
          <div className="relative group flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-(--institutional-blue)/20 focus:border-(--institutional-blue)/50 transition-all text-(--page-text)"
            />

            {!searchTerm && (
              <div className="absolute left-10 right-4 top-1/2 -translate-y-1/2 text-sm text-(--text-muted) pointer-events-none z-10 overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <ScrollingPlaceholder texts={SEARCH_HINTS} />
              </div>
            )}

            {normalizedSearch && (
              <div className="absolute top-full mt-2 w-full bg-(--card-bg) border border-(--border-color) rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                {globalSearchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {globalSearchResults.map((item, idx) => (
                      <button
                        key={`${item.memberId}-${idx}-mobile`}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full text-left px-4 py-3 hover:bg-(--page-bg) transition-colors border-b border-(--border-color) last:border-b-0"
                      >
                        <div className="text-(--page-text) text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-(--text-muted) mt-1">
                          {item.role} • {item.department}
                        </div>
                        {(item.phone || item.email) && (
                          <div className="text-[11px] text-(--text-muted) mt-1">
                            {item.phone ? item.phone : item.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-sm text-(--text-muted)">
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

        <section className="space-y-8 md:space-y-12">
          <div className="text-center mb-6 md:mb-12 relative">
            <h2 className="text-xl md:text-2xl font-black text-(--page-text) mb-3 md:mb-4 tracking-tight uppercase transition-colors">
              Comité de Asamblea
            </h2>
            <div className="w-16 h-1 bg-(--institutional-blue) mx-auto rounded-full shadow-[0_2px_10px_rgba(74,109,167,0.3)]" />
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
                <div className="text-center text-sm md:text-base font-black text-(--institutional-blue) uppercase tracking-widest mb-8 pt-6 border-t border-(--border-color) transition-colors">
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
              className="pt-12 border-t border-slate-200 dark:border-slate-800/20 max-w-6xl mx-auto w-full transition-colors"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-(--page-text) uppercase tracking-tight transition-colors">Presidencia</h3>
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

        <section className="bg-(--card-bg) rounded-[2.5rem] border border-(--border-color) -mx-4 px-1 py-8 md:mx-0 md:px-8 lg:px-12 lg:py-12 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="text-center mb-10 px-4 md:px-0">
              <h2 className="text-2xl font-black text-(--page-text) mb-2 uppercase tracking-tight transition-colors">Explorador de Departamentos</h2>
              <p className="text-(--text-muted) text-sm max-w-md mx-auto transition-colors">
                Selecciona una categoría para ver los departamentos correspondientes y sus superintendentes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:flex md:flex-wrap justify-center gap-3 p-2 bg-(--card-bg) rounded-2xl border border-(--border-color) mb-16 shadow-lg mx-4 md:mx-0 transition-all duration-300 w-full md:w-auto">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'coordination' | 'program' | 'accommodation')}
                  className={cn(
                    'flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap border-2 w-full md:w-auto',
                    activeTab === tab.id
                      ? 'bg-(--institutional-blue) border-(--institutional-blue) text-white shadow-lg active:scale-95'
                      : 'bg-(--card-bg) border-(--border-color) text-(--page-text) hover:border-(--institutional-blue) hover:text-(--institutional-blue) active:scale-95'
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
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 px-0 md:px-0"
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
                    <div className="flex items-center gap-3 px-4 md:px-0 text-[13px] font-black text-slate-500 uppercase tracking-[.15em] transition-colors group-hover:text-blue-500">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 transition-all">
                        {getDeptIcon(dept.name)}
                      </div>
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

        <MapasSection />
      </main>

      <footer className="w-full mt-auto bg-[#1e2a4a] text-slate-300 py-12 px-4 transition-colors">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-white font-bold tracking-widest uppercase text-sm">Asamblea Regional 2026</h4>
            <div className="w-12 h-0.5 bg-blue-500/50" />
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Medellín 4 • Felices Para Siempre
            </p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-2 md:bottom-6 md:right-6 z-50">
        <div
          onMouseEnter={() => !isMobile && setShowWhatsAppTip(true)}
          onMouseLeave={() => !isMobile && setShowWhatsAppTip(false)}
        >
          <AnimatePresence>
            {showWhatsAppTip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(6px)" }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 26,
                  mass: 1,
                }}
                className={cn(
                  "absolute bottom-18 right-0 w-[260px] rounded-[22px] border border-white/10 px-4 py-3 text-[12px] leading-relaxed text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
                  theme === 'light' ? "bg-slate-900" : "bg-white/10 backdrop-blur-2xl supports-backdrop-filter:bg-white/10"
                )}
              >
                <div className={cn("pointer-events-none absolute inset-0 rounded-[22px] bg-linear-to-b from-white/18 to-white/4", theme === 'light' ? "hidden" : "block")} />
                
                <p className="relative pr-2 text-white/90">
                  ¿Tienes alguna pregunta sobre un departamento? Escríbenos por WhatsApp.
                </p>

                <div className={cn("absolute bottom-[-6px] right-6 h-3 w-3 rotate-45 border-r border-b border-white/10", theme === 'light' ? "bg-slate-900" : "bg-white/10 backdrop-blur-2xl")} />
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
            className={cn(
              "group relative flex h-12 w-12 md:h-14 md:w-14 items-center justify-center overflow-hidden rounded-full border border-black/5 dark:border-white/10 text-white transition-all duration-500 hover:scale-110 active:scale-95",
              theme === 'dark' ? "bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl" : "shadow-[0_12px_40px_rgba(37,211,102,0.3)]"
            )}
            style={{ 
              backgroundColor: theme === 'light' ? '#25D366' : undefined 
            }}
            aria-label="Contactar por WhatsApp"
          >
            {/* Premium background effects */}
            <div className={cn(
              "absolute inset-0 transition-all duration-500",
              theme === 'light' 
                ? "bg-[#25D366] group-hover:bg-[#22bf5c]" 
                : "bg-white/10 backdrop-blur-2xl group-hover:bg-white/20"
            )} />
            
            {/* Glossy overlay - only in dark mode or on hover */}
            <div className={cn(
              "absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent opacity-80",
              theme === 'light' ? "opacity-30" : "opacity-100"
            )} />
            
            <div className={cn("absolute inset-px rounded-full bg-black/5", theme === 'light' ? "hidden" : "block")} />


            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="relative z-10 text-white/90 transition-all duration-300 group-hover:text-[#25D366] group-hover:scale-110"
            >
              <path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.96.55 3.8 1.5 5.37L2 22l4.82-1.52c1.51.87 3.25 1.34 5.17 1.34 5.51 0 9.98-4.47 9.98-9.99S17.52 2.01 12.01 2.01zm5.2 14.18c-.22.61-1.12 1.15-1.56 1.25-.41.09-1.02.24-3.17-.65-2.61-1.08-4.31-3.79-4.44-3.96-.13-.17-1.06-1.41-1.06-2.68 0-1.28.66-1.91.9-2.19.23-.28.53-.35.7-.35.17 0 .34 0 .49.01.16.01.38-.06.6.48.23.57.75 1.83.82 1.97.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.32.37-.45.5-.15.16-.31.33-.13.64.18.31.81 1.33 1.73 2.15 1.18 1.06 2.19 1.39 2.5 1.53.31.14.49.12.67-.08.18-.21.78-.9.99-1.21.21-.31.43-.26.71-.15.28.1 1.8.85 2.1 1.01.3.16.51.24.58.37.07.13.07.76-.15 1.37z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
