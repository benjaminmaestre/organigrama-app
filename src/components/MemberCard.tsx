import React from 'react';
import { Mail, Phone, MapPin, User, ChevronDown, ChevronRight, Users } from 'lucide-react';
import type { Member } from '../data';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/cn';

interface MemberCardProps {
  member: Member;
  isMain?: boolean;
  initiallyExpanded?: boolean;
  showDepartments?: boolean;
  isHighlighted?: boolean;
  desktopHorizontalAuxiliaries?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  isMain,
  initiallyExpanded,
  showDepartments = true,
  isHighlighted = false,
  desktopHorizontalAuxiliaries = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(initiallyExpanded ?? isMain);

  const buildMemberId = (member: Member) => {
    const raw = `${member.name ?? ''}-${member.role ?? ''}-${member.phone ?? ''}-${member.email ?? ''}`;
    return `member-${raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}`;
  };

  const memberId = buildMemberId(member);

  const hasChildren =
    (member.auxiliaries && member.auxiliaries.length > 0) ||
    (showDepartments && member.subDepartments && member.subDepartments.length > 0) ||
    (member.groups && member.groups.length > 0);

  return (
    <div
      id={memberId}
      className={cn(
        'flex flex-col w-full transition-all duration-500 scroll-mt-28',
        isExpanded ? 'items-center mx-auto' : 'items-start ml-0 mr-auto'
      )}
    >
      <div className={cn('w-full max-w-sm dept-highlight-wrapper', isHighlighted && 'dept-highlighted')}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 w-full group overflow-hidden',
            hasChildren && 'cursor-pointer',
            isMain
              ? 'bg-slate-900/80 border-brand/50 shadow-[0_0_20px_rgba(30,144,255,0.2)]'
              : isHighlighted
                ? 'bg-slate-900/80 border-transparent'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
          )}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'p-2 sm:p-3 rounded-xl',
                isMain ? 'bg-brand/20 text-brand' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
              )}
            >
              <User size={20} className="sm:hidden" />
              <User size={24} className="hidden sm:block" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white break-words">{member.name}</h3>
              <p
                className={cn(
                  'text-xs sm:text-sm font-medium uppercase tracking-normal sm:tracking-wider break-words',
                  isMain ? 'text-brand/80' : 'text-slate-400'
                )}
              >
                {member.role}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-400">
            {member.congregation && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" />
                <span className="truncate">{member.congregation}</span>
              </div>
            )}

            {member.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-500" />
                <a
                  href={`mailto:${member.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-brand break-all sm:truncate transition-colors"
                >
                  {member.email}
                </a>
              </div>
            )}

            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-500" />
                <a
                  href={`tel:${member.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-brand break-all sm:truncate transition-colors"
                >
                  {member.phone}
                </a>
              </div>
            )}
          </div>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              'w-full mt-4 relative',
              desktopHorizontalAuxiliaries ? 'pl-6 md:pl-0' : 'pl-6'
            )}
          >
            {(!desktopHorizontalAuxiliaries || desktopHorizontalAuxiliaries) && (
              <div className={cn(
                'absolute left-3 top-0 bottom-0 w-px bg-slate-800',
                desktopHorizontalAuxiliaries && 'md:hidden'
              )} />
            )}

            <div className="space-y-6 pt-4">
              {member.auxiliaries && member.auxiliaries.length > 0 && (
                <>
                  {desktopHorizontalAuxiliaries ? (
                    <>
                      {/* MOBILE: vertical normal with connectors */}
                      <div className="md:hidden space-y-6">
                        {member.auxiliaries.map((aux, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-3 top-1/2 w-3 h-px bg-slate-800" />
                            <MemberCard
                              member={aux}
                              initiallyExpanded={initiallyExpanded}
                              isHighlighted={isHighlighted}
                            />
                          </div>
                        ))}
                      </div>

                      {/* TABLET / PC: horizontal only for presidency */}
                      <div className="hidden md:block relative w-full pt-12">
                        <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-slate-800" />
                        <div className="absolute top-8 left-1/4 right-1/4 h-px bg-slate-800" />

                        <div className="grid grid-cols-2 gap-10 lg:gap-12 items-start relative">
                          {member.auxiliaries.map((aux, idx) => (
                            <div key={idx} className="relative flex justify-center pt-6">
                              <div className="absolute top-0 left-1/2 h-6 w-px -translate-x-1/2 bg-slate-800" />
                              <div className="w-full max-w-sm">
                                <MemberCard
                                  member={aux}
                                  initiallyExpanded={initiallyExpanded}
                                  isHighlighted={isHighlighted}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    member.auxiliaries.map((aux, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-3 top-1/2 w-3 h-px bg-slate-800" />
                        <MemberCard
                          member={aux}
                          initiallyExpanded={initiallyExpanded}
                          isHighlighted={isHighlighted}
                        />
                      </div>
                    ))
                  )}
                </>
              )}

              {member.groups && member.groups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8 w-full">
                  {member.groups.map((group, idx) => (
                    <div
                      key={idx}
                      className="relative bg-slate-900/40 rounded-3xl p-6 border border-slate-800/50 shadow-inner h-full"
                    >
                      <div className="flex items-center gap-2 mb-6 text-xs font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 w-fit px-3 py-1 rounded-full border border-blue-500/20">
                        <Users size={12} />
                        {group.name}
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {group.members.map((m, midx) => (
                          <MemberCard key={midx} member={m} initiallyExpanded={initiallyExpanded} isHighlighted={isHighlighted} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDepartments &&
                member.subDepartments?.map((dept, idx) => (
                  <div key={idx} className="relative mt-8">
                    <div className="absolute -left-3 top-8 w-3 h-px bg-slate-800" />
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
                      <Users size={12} />
                      {dept.name}
                    </div>
                    <MemberCard member={dept.head} isHighlighted={isHighlighted} />
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};