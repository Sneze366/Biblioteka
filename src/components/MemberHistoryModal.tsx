import React from 'react';
import { X, BookOpen, Clock, CheckCircle2, AlertCircle, History, ArrowRightLeft, Calendar, User, Printer } from 'lucide-react';
import { Member, Loan } from '../types';

interface MemberHistoryModalProps {
  member: Member | null;
  loans: Loan[];
  onClose: () => void;
  onReturnBook: (loanId: string) => void;
  onIssueToMember: (member: Member) => void;
  isAdmin?: boolean;
}

export const MemberHistoryModal: React.FC<MemberHistoryModalProps> = ({
  member,
  loans,
  onClose,
  onReturnBook,
  onIssueToMember,
  isAdmin = false,
}) => {
  if (!member) return null;

  // Filter loans for this specific member
  const memberLoans = loans.filter(l => l.memberId === member.id);
  const activeLoans = memberLoans.filter(l => l.status === 'активна' || l.status === 'задоцнета');
  const returnedLoans = memberLoans.filter(l => l.status === 'вратена');
  const overdueLoans = memberLoans.filter(l => l.status === 'задоцнета');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md">
              {member.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{member.fullName}</h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {member.gradeClass}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                ИД Картичка: {member.memberNumber} • {member.type}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Profile Stats Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Вкупно историја</span>
            <p className="text-lg font-extrabold text-slate-900">{memberLoans.length} книги</p>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Моментално кај него</span>
            <p className="text-lg font-extrabold text-amber-600">{activeLoans.length} книги</p>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Вратени на време</span>
            <p className="text-lg font-extrabold text-emerald-600">{returnedLoans.length}</p>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Задоцнети</span>
            <p className="text-lg font-extrabold text-rose-600">{overdueLoans.length}</p>
          </div>
        </div>

        {/* History List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              Детална историја на позајмени книги
            </h3>
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onIssueToMember(member);
                }}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Позајми му нова книга</span>
              </button>
            )}
          </div>

          {memberLoans.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium text-sm">Овој член нема регистрирано позајмувања досега.</p>
              <p className="text-xs text-slate-400 mt-1">Кликнете „Позајми му нова книга“ за да ја регистрирате првата лектира.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {memberLoans.map(loan => (
                <div
                  key={loan.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    loan.status === 'задоцнета' ? 'bg-rose-50/70 border-rose-200' :
                    loan.status === 'активна' ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{loan.bookTitle}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">({loan.loanNumber})</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Автор: <strong>{loan.bookAuthor}</strong> • Локација: {loan.bookShelf}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>Издадена: <strong>{loan.issueDate}</strong></span>
                      <span>•</span>
                      <span>Рок: <strong className={loan.status === 'задоцнета' ? 'text-rose-600' : 'text-slate-700'}>{loan.dueDate}</strong></span>
                      {loan.returnDate && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">Вратена на: {loan.returnDate}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {loan.status === 'активна' && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
                        Активна
                      </span>
                    )}
                    {loan.status === 'задоцнета' && (
                      <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300">
                        Задоцнета
                      </span>
                    )}
                    {loan.status === 'вратена' && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                        Вратена
                      </span>
                    )}

                    {isAdmin && loan.status !== 'вратена' && (
                      <button
                        onClick={() => onReturnBook(loan.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition"
                      >
                        Раздолжи
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Библиотека ООУ „Илинден“ Крива Паланка</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition"
          >
            Затвори
          </button>
        </div>

      </div>
    </div>
  );
};
