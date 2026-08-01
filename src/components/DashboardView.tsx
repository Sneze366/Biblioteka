import React, { useState } from 'react';
import { 
  BookOpen, Users, ArrowUpRight, CheckCircle2, Clock, 
  Search, ShieldAlert, Sparkles, TrendingUp, Layers, BookmarkCheck, ArrowRight, RefreshCw, BarChart2
} from 'lucide-react';
import { LibraryStats, Book, Loan, ActivityLog } from '../types';

interface DashboardViewProps {
  stats: LibraryStats;
  books: Book[];
  loans: Loan[];
  logs: ActivityLog[];
  onNavigateTab: (tab: 'dashboard' | 'loans' | 'books' | 'members' | 'settings') => void;
  onOpenIssueModal: () => void;
  onOpenQuickStock: () => void;
  onSelectBookForIssue: (book: Book) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  books,
  loans,
  logs,
  onNavigateTab,
  onOpenIssueModal,
  onOpenQuickStock,
  onSelectBookForIssue,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  // Quick check results
  const quickSearchResults = books
    .filter(b => quickQuery.trim() && (b.title.toLowerCase().includes(quickQuery.toLowerCase()) || b.author.toLowerCase().includes(quickQuery.toLowerCase())))
    .slice(0, 4);

  // Genre counts breakdown
  const genreBreakdown = React.useMemo(() => {
    const counts: Record<string, { total: number; available: number }> = {};
    books.forEach(b => {
      if (!counts[b.genre]) {
        counts[b.genre] = { total: 0, available: 0 };
      }
      counts[b.genre].total += b.totalCopies;
      counts[b.genre].available += b.availableCopies;
    });
    return Object.entries(counts).sort((a, b) => b[1].total - a[1].total);
  }, [books]);

  // Active overdue loans preview
  const overduePreview = loans.filter(l => l.status === 'задоцнета').slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner / Welcome */}
      <div className="bg-[#4A5D4E] rounded-[32px] p-6 text-white shadow-md relative overflow-hidden border border-[#3A4B3D]">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <BookOpen className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 text-[#D9E4DD] text-xs px-3 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#A8763E]" />
            <span>Контролна табла во реално време • ООУ „Илинден“ Крива Паланка</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif italic">
            Училишна библиотека со <span className="text-[#A8763E] not-italic">5,000+ книги</span>
          </h2>

          <p className="text-[#D9E4DD] text-sm leading-relaxed">
            Комплетен увид и евиденција на книжниот фонд, активни позајмувања, вратени книги и ~1000 регистрирани ученици и наставници.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenIssueModal}
              className="bg-[#A8763E] hover:bg-[#966835] text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 shadow-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Позајми книга</span>
            </button>

            <button
              onClick={onOpenQuickStock}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#D9E4DD]" />
              <span>Провери залиха на книга</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Real-time Instant Availability Widget */}
      <div className="bg-white rounded-[32px] p-5 border border-[#E6E8E0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#D9E4DD] text-[#4A5D4E] font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#2C332D] text-base">Инстант проверка на залиха на книга</h3>
              <p className="text-xs text-[#8B9285]">Внесете наслов за веднаш да проверите достапност на рафт</p>
            </div>
          </div>
          <span className="text-xs bg-[#F1F3ED] text-[#5D8A66] font-semibold px-2.5 py-1 rounded-full border border-[#E6E8E0] self-start sm:self-auto">
            • Базата е синхронизирана
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={quickQuery}
            onChange={e => setQuickQuery(e.target.value)}
            placeholder="Внесете име на книга или автор (напр. Белото циганче, Рацин, Хари Потер, Пиреј)..."
            className="w-full pl-10 pr-4 py-3 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] transition-all"
          />
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9285]" />
        </div>

        {/* Live Search Quick Preview */}
        {quickQuery.trim() && (
          <div className="mt-3 divide-y divide-[#E6E8E0] border border-[#E6E8E0] rounded-2xl overflow-hidden bg-white">
            {quickSearchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8B9285]">
                Не е пронајдена книга. Обидете се со поинаков кириличен збор.
              </div>
            ) : (
              quickSearchResults.map(b => (
                <div key={b.id} className="p-3 flex items-center justify-between hover:bg-[#F8F9F4] transition">
                  <div>
                    <h4 className="text-sm font-bold text-[#2C332D]">{b.title}</h4>
                    <p className="text-xs text-[#8B9285]">{b.author} • Рафт: <strong className="text-[#4A5D4E]">{b.shelfLocation}</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.availableCopies > 0 ? (
                      <span className="text-xs font-semibold text-[#5D8A66] bg-[#F1F3ED] px-2.5 py-1 rounded-full border border-[#E6E8E0]">
                        Има на залиха: {b.availableCopies} од {b.totalCopies}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        Нема на залиха (0/{b.totalCopies})
                      </span>
                    )}
                    {b.availableCopies > 0 && (
                      <button
                        onClick={() => onSelectBookForIssue(b)}
                        className="text-xs font-bold bg-[#A8763E] hover:bg-[#966835] text-white px-3 py-1 rounded-xl transition"
                      >
                        Позајми
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Physical Books */}
        <div className="bg-white rounded-[28px] p-4 border border-[#E6E8E0] shadow-sm hover:border-[#4A5D4E] transition">
          <div className="flex items-center justify-between text-[#8B9285] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Вкупно книги</span>
            <div className="p-2 bg-[#D9E4DD] text-[#4A5D4E] rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-light text-[#4A5D4E]">{stats.totalCopies.toLocaleString('mk-MK')}</p>
          <p className="text-[11px] text-[#8B9285] mt-1">книги во библиотека</p>
        </div>

        {/* Total Titles / Editions */}
        <div className="bg-white rounded-[28px] p-4 border border-[#E6E8E0] shadow-sm hover:border-[#4A5D4E] transition">
          <div className="flex items-center justify-between text-[#8B9285] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Наслови</span>
            <div className="p-2 bg-[#F1F3ED] text-[#4A5D4E] rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-light text-[#4A5D4E]">{stats.totalTitles.toLocaleString('mk-MK')}</p>
          <p className="text-[11px] text-[#8B9285] mt-1">различни изданија</p>
        </div>

        {/* Currently Issued */}
        <div className="bg-white rounded-[28px] p-4 border border-[#E6E8E0] shadow-sm hover:border-[#A8763E] transition">
          <div className="flex items-center justify-between text-[#8B9285] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Издадени</span>
            <div className="p-2 bg-[#FAF8F5] text-[#A8763E] rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-light text-[#A8763E]">{stats.issuedCopies.toLocaleString('mk-MK')}</p>
          <p className="text-[11px] text-[#A8763E] font-bold mt-1">активно позајмени</p>
        </div>

        {/* Remaining in Stock - Highlighted Forest Green */}
        <div className="bg-[#4A5D4E] rounded-[28px] p-4 shadow-md text-white">
          <div className="flex items-center justify-between text-white/70 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Достапни</span>
            <div className="p-2 bg-white/10 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-light text-white">{stats.availableCopies.toLocaleString('mk-MK')}</p>
          <p className="text-[11px] text-white/70 mt-1">слободни на рафт</p>
        </div>

        {/* Total Members */}
        <div className="bg-white rounded-[28px] p-4 border border-[#E6E8E0] shadow-sm hover:border-[#5D8A66] transition">
          <div className="flex items-center justify-between text-[#8B9285] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Членови</span>
            <div className="p-2 bg-[#D9E4DD] text-[#5D8A66] rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-light text-[#5D8A66]">{stats.totalMembers.toLocaleString('mk-MK')}</p>
          <p className="text-[11px] text-[#8B9285] mt-1">ученици & наставници</p>
        </div>

        {/* Overdue Count */}
        <div className="bg-white rounded-[28px] p-4 border border-[#E6E8E0] shadow-sm hover:border-rose-400 transition">
          <div className="flex items-center justify-between text-[#8B9285] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Задоцнети</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-light text-rose-600">{stats.overdueLoans}</p>
          <p className="text-[11px] text-rose-600 font-bold mt-1">потребна опомена</p>
        </div>

      </div>

      {/* Main Content Grid: Genre Distribution + Overdue Alerts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Stock Progress by Genre & Popular Books */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Genre Distribution Card */}
          <div className="bg-white rounded-[32px] p-5 border border-[#E6E8E0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#2C332D] text-base flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#A8763E]" />
                  Залиха и застапеност по жанрови
                </h3>
                <p className="text-xs text-[#8B9285]">Сооднос на достапни и позајмени книги по категорија</p>
              </div>
              <button
                onClick={() => onNavigateTab('books')}
                className="text-xs text-[#4A5D4E] font-semibold hover:underline flex items-center gap-1"
              >
                Види сите книги <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {genreBreakdown.map(([genre, data]) => {
                const percentAvailable = Math.round((data.available / data.total) * 100) || 0;
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[#2C332D]">
                      <span className="font-semibold">{genre}</span>
                      <span className="text-[#8B9285]">
                        {data.available} слободни од {data.total} вкупно ({percentAvailable}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F1F3ED] rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${percentAvailable}%` }}
                        className="bg-[#5D8A66] h-full rounded-full transition-all duration-500"
                        title={`${data.available} слободни`}
                      />
                      <div
                        style={{ width: `${100 - percentAvailable}%` }}
                        className="bg-[#A8763E] h-full rounded-full transition-all duration-500"
                        title={`${data.total - data.available} позајмени`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts / School Info Card */}
          <div className="bg-[#4A5D4E] text-white rounded-[32px] p-5 border border-[#3A4B3D] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-base font-serif italic">ООУ „Илинден“ - Крива Паланка</h4>
              <p className="text-xs text-[#D9E4DD]">
                За потребите на библиотекарот и училишниот одбор. Базата овозможува сигурна евиденција на сите ученици од I до IX одделение.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onNavigateTab('loans')}
                className="bg-[#A8763E] hover:bg-[#966835] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm"
              >
                Отвори евиденција
              </button>
              <button
                onClick={() => onNavigateTab('members')}
                className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition border border-white/10"
              >
                Сите членови
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Overdue Warnings & Live Activity Feed */}
        <div className="space-y-6">
          
          {/* Overdue Warnings Widget */}
          <div className="bg-white rounded-[32px] p-5 border border-[#E6E8E0] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Задоцнети позајмувања ({overduePreview.length})
              </h3>
              <button
                onClick={() => onNavigateTab('loans')}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Види сите
              </button>
            </div>

            {overduePreview.length === 0 ? (
              <p className="text-xs text-[#8B9285] py-3 text-center">Нема задоцнети рокови во моментов. Сите се уредни!</p>
            ) : (
              <div className="space-y-2.5">
                {overduePreview.map(l => (
                  <div key={l.id} className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#2C332D]">
                      <span className="truncate max-w-[180px]">{l.bookTitle}</span>
                      <span className="text-rose-700">{l.dueDate}</span>
                    </div>
                    <div className="text-[#8B9285] flex justify-between">
                      <span>Член: <strong className="text-[#2C332D]">{l.memberName}</strong> ({l.memberGrade})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Activity Ticker */}
          <div className="bg-white rounded-[32px] p-5 border border-[#E6E8E0] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8763E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A8763E]"></span>
                </span>
                <h3 className="font-bold text-[#2C332D] text-sm">Активности во живо</h3>
              </div>
              <span className="text-[10px] text-[#8B9285]">Автоматски дневник</span>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 6).map(log => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs border-b border-[#F1F3ED] pb-2.5 last:border-0 last:pb-0">
                  <div className={`p-1.5 rounded-xl text-white flex-shrink-0 mt-0.5 ${
                    log.type === 'issue' ? 'bg-[#A8763E]' :
                    log.type === 'return' ? 'bg-[#5D8A66]' :
                    log.type === 'add_member' ? 'bg-[#4A5D4E]' : 'bg-[#8B9285]'
                  }`}>
                    {log.type === 'issue' ? <ArrowUpRight className="w-3 h-3" /> :
                     log.type === 'return' ? <CheckCircle2 className="w-3 h-3" /> :
                     <Clock className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="font-semibold text-[#2C332D] flex items-center justify-between gap-2">
                      <span>{log.title}</span>
                      <span className="text-[10px] font-normal text-[#8B9285]">{log.timestamp.split(' ')[1]}</span>
                    </div>
                    <p className="text-[#8B9285] text-[11px] leading-snug mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
