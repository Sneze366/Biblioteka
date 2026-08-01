import React, { useState, useMemo } from 'react';
import { X, Search, Check, AlertCircle, Calendar, ArrowRightLeft, UserCheck, BookOpen } from 'lucide-react';
import { Book, Member } from '../types';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  members: Member[];
  onConfirmIssue: (bookId: string, memberId: string, dueDays: number, notes?: string) => void;
  initialSelectedBook?: Book | null;
  initialSelectedMember?: Member | null;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  books,
  members,
  onConfirmIssue,
  initialSelectedBook,
  initialSelectedMember,
}) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialSelectedBook || null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(initialSelectedMember || null);
  
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  
  const [dueDays, setDueDays] = useState<number>(14);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset when modal opens with initial values
  React.useEffect(() => {
    if (isOpen) {
      if (initialSelectedBook) setSelectedBook(initialSelectedBook);
      if (initialSelectedMember) setSelectedMember(initialSelectedMember);
    }
  }, [isOpen, initialSelectedBook, initialSelectedMember]);

  // Filter available books only
  const filteredBooks = useMemo(() => {
    return books
      .filter(b => b.availableCopies > 0)
      .filter(b => {
        const q = bookSearch.toLowerCase().trim();
        return !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.shelfLocation.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [books, bookSearch]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members
      .filter(m => {
        const q = memberSearch.toLowerCase().trim();
        return !q || m.fullName.toLowerCase().includes(q) || m.memberNumber.toLowerCase().includes(q) || m.gradeClass.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [members, memberSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) {
      setErrorMsg('Ве молиме изберете книга за позајмување.');
      return;
    }
    if (!selectedMember) {
      setErrorMsg('Ве молиме изберете член (ученик/наставник).');
      return;
    }

    onConfirmIssue(selectedBook.id, selectedMember.id, dueDays, notes);
    onClose();
    // Reset
    setSelectedBook(null);
    setSelectedMember(null);
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Издавање на книга (Позајмување)
            </h2>
            <p className="text-xs text-slate-300">
              ООУ „Илинден“ Крива Паланка • Изберете книга и член
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Member */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>1. Изберете Член / Ученик:</span>
              {selectedMember && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Избран: {selectedMember.fullName} ({selectedMember.gradeClass})
                </span>
              )}
            </label>

            {selectedMember ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedMember.fullName}</h4>
                  <p className="text-xs text-slate-600">Одделение: {selectedMember.gradeClass} • Број: {selectedMember.memberNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Промени
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Пребарај ученик по име или одделение (напр. Марко, VI-а)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {filteredMembers.map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m);
                        setErrorMsg('');
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl cursor-pointer transition text-xs"
                    >
                      <div className="font-bold text-slate-900">{m.fullName}</div>
                      <div className="text-[11px] text-slate-500">Одд: <strong className="text-slate-700">{m.gradeClass}</strong> • {m.memberNumber}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Select Book */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>2. Изберете Книга од залиха:</span>
              {selectedBook && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Избрана: {selectedBook.title}
                </span>
              )}
            </label>

            {selectedBook ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedBook.title}</h4>
                  <p className="text-xs text-slate-600">Автор: {selectedBook.author} • Рафт: <strong className="text-slate-800">{selectedBook.shelfLocation}</strong></p>
                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Достапни: {selectedBook.availableCopies} примероци</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Промени
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  placeholder="Пребарај книга по наслов или автор..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {filteredBooks.map(b => (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBook(b);
                        setErrorMsg('');
                      }}
                      className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl cursor-pointer transition text-xs"
                    >
                      <div className="font-bold text-slate-900">{b.title}</div>
                      <div className="text-[11px] text-slate-500">{b.author} • Рафт: {b.shelfLocation}</div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Залиха: {b.availableCopies}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Return Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Рок за враќање (денови):</label>
              <select
                value={dueDays}
                onChange={e => setDueDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={14}>14 дена (Стандарден рок за лектира)</option>
                <option value={21}>21 ден (3 недели)</option>
                <option value={30}>30 дена (1 месец)</option>
                <option value={7}>7 дена (Кратка лектира)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Забелешка (изборно):</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="напр. Напомена за состојба на страница..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Откажи
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition shadow-md"
            >
              Позајми книга
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
