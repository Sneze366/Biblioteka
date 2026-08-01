import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, UserPlus, BookOpen, Clock, 
  ChevronRight, GraduationCap, History, Phone, Mail, BadgeCheck, AlertCircle, ChevronLeft, FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { Member, Loan } from '../types';

interface MembersViewProps {
  members: Member[];
  loans: Loan[];
  onOpenAddMemberModal: () => void;
  onOpenExcelImportModal?: () => void;
  onSelectMemberHistory: (member: Member) => void;
  onDeleteMember?: (memberId: string) => void;
  isAdmin?: boolean;
}

const GRADES_LIST = [
  "Сите одделенија",
  "I-1", "I-2", "II-1", "II-2", "III-1", "III-2", "IV-1", "IV-2",
  "V-а", "V-б", "VI-а", "VI-б", "VII-а", "VII-б", "VIII-а", "VIII-б", "IX-а", "IX-б",
  "Наставници & Персонал"
];

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  loans,
  onOpenAddMemberModal,
  onOpenExcelImportModal,
  onSelectMemberHistory,
  onDeleteMember,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('Сите одделенија');
  const [typeFilter, setTypeFilter] = useState<'сите' | 'ученик' | 'наставник'>('сите');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;

  // Filtered members dataset
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || m.fullName.toLowerCase().includes(q) || m.memberNumber.toLowerCase().includes(q) || m.gradeClass.toLowerCase().includes(q);
      
      const matchesGrade = 
        selectedGrade === 'Сите одделенија' ? true :
        selectedGrade === 'Наставници & Персонал' ? (m.type === 'наставник' || m.type === 'персонал') :
        m.gradeClass === selectedGrade;

      const matchesType = typeFilter === 'сите' ? true : m.type === typeFilter;

      return matchesQuery && matchesGrade && matchesType;
    });
  }, [members, searchQuery, selectedGrade, typeFilter]);

  // Paginated chunk
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Member loans mapping helper
  const memberLoansMap = useMemo(() => {
    const map: Record<string, { active: number; totalHistory: number; overdue: number }> = {};
    loans.forEach(l => {
      if (!map[l.memberId]) {
        map[l.memberId] = { active: 0, totalHistory: 0, overdue: 0 };
      }
      map[l.memberId].totalHistory++;
      if (l.status === 'активна') map[l.memberId].active++;
      if (l.status === 'задоцнета') {
        map[l.memberId].active++;
        map[l.memberId].overdue++;
      }
    });
    return map;
  }, [loans]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[32px] border border-[#E6E8E0] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#2C332D]">База на корисници и членови</h2>
            <span className="bg-[#D9E4DD] text-[#4A5D4E] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E6E8E0]">
              {members.length} членови
            </span>
          </div>
          <p className="text-xs text-[#8B9285] mt-0.5">
            Евиденција на сите уписани ученици од I до IX одделение и наставен кадар во ООУ „Илинден“
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            {onOpenExcelImportModal && (
              <button
                onClick={onOpenExcelImportModal}
                className="bg-[#5D8A66] hover:bg-[#4D7454] text-white font-bold px-4 py-2.5 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Импорт од Excel</span>
              </button>
            )}

            <button
              onClick={onOpenAddMemberModal}
              className="bg-[#A8763E] hover:bg-[#966835] text-white font-bold px-4 py-2.5 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Регистрирај нов член</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Grade Filters */}
      <div className="bg-white p-4 rounded-[32px] border border-[#E6E8E0] shadow-sm space-y-3">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Member Name */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9285]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Пребарај корисник по име и презиме (напр. Марко, Елена, Трајковски)..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] transition-all"
            />
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={e => {
                setSelectedGrade(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
            >
              {GRADES_LIST.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Member Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
            >
              <option value="сите">Сите типови членови</option>
              <option value="ученик">Само ученици</option>
              <option value="наставник">Наставници / Персонал</option>
            </select>
          </div>

        </div>

        <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 flex justify-between items-center">
          <span>
            Пронајдени <strong>{filteredMembers.length}</strong> членови • Кликнете на името за да ја видите <strong>историјата на прочитани книги</strong>
          </span>
        </div>

      </div>

      {/* Members Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedMembers.map(member => {
          const stats = memberLoansMap[member.id] || { active: 0, totalHistory: 0, overdue: 0 };
          
          return (
            <div
              key={member.id}
              onClick={() => onSelectMemberHistory(member)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition cursor-pointer p-4 space-y-3 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                    {member.fullName.charAt(0)}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {member.memberNumber}
                    </span>
                    <div className="text-[11px] font-semibold text-amber-800 mt-1">
                      {member.gradeClass}
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition flex items-center justify-between">
                  <span>{member.fullName}</span>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Дали сте сигурни дека сакате да го избришете членот „${member.fullName}“?`)) {
                            onDeleteMember?.(member.id);
                          }
                        }}
                        title="Избриши член"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </h3>

                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {member.type} • Тел: {member.phone}
                </p>
              </div>

              {/* Loans History Badges */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Активно:</span>
                  <div className={`font-bold ${stats.overdue > 0 ? 'text-rose-600' : 'text-amber-700'}`}>
                    {stats.active} книги
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Вкупно прочитани:</span>
                  <div className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                    <History className="w-3 h-3 text-amber-600" />
                    {stats.totalHistory}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600">
          <div>
            Страница <strong>{currentPage}</strong> од <strong>{totalPages}</strong> (Прикажани {(currentPage-1)*pageSize + 1} - {Math.min(currentPage*pageSize, filteredMembers.length)} од {filteredMembers.length})
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Претходна
            </button>

            <span className="px-3 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition font-medium flex items-center gap-1"
            >
              Следна <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
