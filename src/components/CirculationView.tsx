import React, { useState, useMemo } from 'react';
import { 
  Search, ArrowRightLeft, CheckCircle2, AlertCircle, Clock, 
  RotateCcw, Calendar, Filter, Printer, FileText, Check, Plus
} from 'lucide-react';
import { Loan, LoanStatus } from '../types';

interface CirculationViewProps {
  loans: Loan[];
  onIssueNewBook: () => void;
  onReturnBook: (loanId: string) => void;
  onExtendLoan: (loanId: string) => void;
}

export const CirculationView: React.FC<CirculationViewProps> = ({
  loans,
  onIssueNewBook,
  onReturnBook,
  onExtendLoan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'сите' | LoanStatus>('сите');
  const [selectedLoanForPrint, setSelectedLoanForPrint] = useState<Loan | null>(null);

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesStatus = statusFilter === 'сите' ? true : loan.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.memberName.toLowerCase().includes(q) ||
        loan.memberGrade.toLowerCase().includes(q) ||
        loan.loanNumber.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [loans, searchQuery, statusFilter]);

  const activeCount = loans.filter(l => l.status === 'активна').length;
  const overdueCount = loans.filter(l => l.status === 'задоцнета').length;
  const returnedCount = loans.filter(l => l.status === 'вратена').length;

  const handlePrintSlip = (loan: Loan) => {
    setSelectedLoanForPrint(loan);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[32px] border border-[#E6E8E0] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#2C332D] flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-[#A8763E]" />
            Евиденција на позајмени и вратени книги
          </h2>
          <p className="text-xs text-[#8B9285] mt-0.5">
            Дневник на сите издадени лектири и книги во ООУ „Илинден“ Крива Паланка
          </p>
        </div>

        <button
          onClick={onIssueNewBook}
          className="bg-[#A8763E] hover:bg-[#966835] text-white font-bold px-4 py-2.5 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Издај нова книга</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-[#E6E8E0] shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F3ED] pb-3">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('сите')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'сите'
                  ? 'bg-[#4A5D4E] text-white'
                  : 'bg-[#F1F3ED] text-[#2C332D] hover:bg-[#E6E8E0]'
              }`}
            >
              Сите записи ({loans.length})
            </button>

            <button
              onClick={() => setStatusFilter('активна')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                statusFilter === 'активна'
                  ? 'bg-[#A8763E] text-white font-bold'
                  : 'bg-[#FAF8F5] text-[#A8763E] hover:bg-[#E6E8E0]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Активни ({activeCount})
            </button>

            <button
              onClick={() => setStatusFilter('задоцнета')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                statusFilter === 'задоцнета'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Задоцнети ({overdueCount})
            </button>

            <button
              onClick={() => setStatusFilter('вратена')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                statusFilter === 'вратена'
                  ? 'bg-[#5D8A66] text-white font-bold'
                  : 'bg-[#F1F3ED] text-[#5D8A66] hover:bg-[#D9E4DD]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Вратени ({returnedCount})
            </button>
          </div>

          <span className="text-xs text-[#8B9285] font-medium">
            Прикажани: <strong>{filteredLoans.length}</strong> од {loans.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9285]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Пребарај по име на ученик, одделение (напр. VII-б), наслов на книга или број на потврда..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] transition-all"
          />
        </div>

      </div>

      {/* Circulation Table */}
      <div className="bg-white rounded-[32px] border border-[#E6E8E0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#4A5D4E] text-white text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Бр. Потврда</th>
                <th className="py-3.5 px-4">Книга / Наслов</th>
                <th className="py-3.5 px-4">Член / Ученик</th>
                <th className="py-3.5 px-4">Датум на издавање</th>
                <th className="py-3.5 px-4">Рок за враќање</th>
                <th className="py-3.5 px-4">Статус</th>
                <th className="py-3.5 px-4 text-right">Acции / Раздолжи</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Не се пронајдени записи за зададените филтри.
                  </td>
                </tr>
              ) : (
                filteredLoans.map(loan => {
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50 transition">
                      
                      {/* Loan ID */}
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">
                        {loan.loanNumber}
                      </td>

                      {/* Book Title & Author */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{loan.bookTitle}</div>
                        <div className="text-xs text-slate-500">{loan.bookAuthor} • Рафт: {loan.bookShelf}</div>
                      </td>

                      {/* Member Name & Class */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{loan.memberName}</div>
                        <div className="text-xs text-amber-700 font-medium">Одделение: {loan.memberGrade}</div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {loan.issueDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        <span className={loan.status === 'задоцнета' ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {loan.dueDate}
                        </span>
                        {loan.returnDate && (
                          <div className="text-[11px] text-emerald-600 font-normal">
                            Вратена: {loan.returnDate}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {loan.status === 'активна' && (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Активна
                          </span>
                        )}
                        {loan.status === 'задоцнета' && (
                          <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Задоцнета
                          </span>
                        )}
                        {loan.status === 'вратена' && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Вратена
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {loan.status !== 'вратена' ? (
                          <>
                            <button
                              onClick={() => onReturnBook(loan.id)}
                              title="Врати книга и раздолжи"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Раздолжи</span>
                            </button>

                            <button
                              onClick={() => onExtendLoan(loan.id)}
                              title="Продолжи рок за 14 дена"
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2 py-1.5 rounded-lg transition inline-flex items-center gap-1 border border-slate-300"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span className="hidden sm:inline">+14 д.</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Завршено</span>
                        )}

                        <button
                          onClick={() => handlePrintSlip(loan)}
                          title="Испечати потврда"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition inline-flex items-center border border-slate-300 ml-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal / Hidden Print View */}
      {selectedLoanForPrint && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 font-sans text-slate-900">
          <div className="max-w-md mx-auto border-2 border-slate-900 p-6 rounded-lg space-y-4">
            <div className="text-center border-b border-slate-300 pb-3">
              <h1 className="text-lg font-bold">ООУ „ИЛИДЕН“ - КРИВА ПАЛАНКА</h1>
              <p className="text-xs text-slate-600">УЧИЛИШНА БИБЛИОТЕКА - ПОТВРДА ЗА ПОЗАЈМУВАЊЕ</p>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Број на потврда:</strong> {selectedLoanForPrint.loanNumber}</p>
              <p><strong>Член (Ученик):</strong> {selectedLoanForPrint.memberName} ({selectedLoanForPrint.memberGrade})</p>
              <p><strong>Наслов на книга:</strong> {selectedLoanForPrint.bookTitle}</p>
              <p><strong>Автор:</strong> {selectedLoanForPrint.bookAuthor}</p>
              <p><strong>Локација/Рафт:</strong> {selectedLoanForPrint.bookShelf}</p>
              <p><strong>Датум на издавање:</strong> {selectedLoanForPrint.issueDate}</p>
              <p><strong>Краен рок за враќање:</strong> <span className="underline font-bold">{selectedLoanForPrint.dueDate}</span></p>
              <p><strong>Издадено од:</strong> {selectedLoanForPrint.issuedBy}</p>
            </div>

            <div className="border-t border-slate-300 pt-6 mt-8 flex justify-between text-xs">
              <div className="text-center">
                <p>____________________</p>
                <p>Потпис на ученикот</p>
              </div>
              <div className="text-center">
                <p>____________________</p>
                <p>Библиотекар</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
