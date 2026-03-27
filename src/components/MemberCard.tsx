import React from 'react';
import { Mail, Phone, MapPin, User, ChevronDown, ChevronRight, Users } from 'lucide-react';
import type { Member } from '../data';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MemberCardProps {
  member: Member;
  isMain?: boolean;
  initiallyExpanded?: boolean;
  showDepartments?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  isMain, 
  initiallyExpanded,
  showDepartments = true 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(initiallyExpanded ?? isMain);

  const hasChildren = (member.auxiliaries && member.auxiliaries.length > 0) || 
                     (showDepartments && member.subDepartments && member.subDepartments.length > 0) ||
                     (member.groups && member.groups.length > 0);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative p-4 rounded-2xl border transition-all duration-300 w-full group overflow-hidden",
          hasChildren && "cursor-pointer",
          isMain 
            ? "bg-slate-900/80 border-brand/50 shadow-[0_0_20px_rgba(30,144,255,0.2)]" 
            : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}

      >
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            isMain ? "bg-brand/20 text-brand" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
          )}>
            <User size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{member.name}</h3>
            <p className={cn(
              "text-sm font-medium uppercase tracking-wider",
              isMain ? "text-brand/80" : "text-slate-400"
            )}>{member.role}</p>
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
                className="hover:text-brand truncate transition-colors"
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
                className="hover:text-brand truncate transition-colors"
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

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full pl-6 mt-4 relative"
          >
            {/* Connection Line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-800" />

            <div className="space-y-6 pt-4">
              {member.auxiliaries?.map((aux, idx) => (
                <div key={idx} className="relative">
                  {/* Horizontal Connector */}
                  <div className="absolute -left-3 top-1/2 w-3 h-px bg-slate-800" />
                  <MemberCard member={aux} initiallyExpanded={false} />
                </div>
              ))}

              {member.groups?.map((group, idx) => (
                <div key={idx} className="relative mt-12 bg-slate-900/40 rounded-3xl p-6 border border-slate-800/50 shadow-inner">
                  <div className="flex items-center gap-2 mb-6 text-xs font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 w-fit px-3 py-1 rounded-full border border-blue-500/20">
                    <Users size={12} />
                    {group.name}
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {group.members.map((m, midx) => (
                      <MemberCard key={midx} member={m} initiallyExpanded={false} />
                    ))}
                  </div>
                </div>
              ))}

              {showDepartments && member.subDepartments?.map((dept, idx) => (
                <div key={idx} className="relative mt-8">
                  <div className="absolute -left-3 top-8 w-3 h-px bg-slate-800" />
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
                    <Users size={12} />
                    {dept.name}
                  </div>
                  <MemberCard member={dept.head} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
