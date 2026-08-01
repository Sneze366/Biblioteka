import React, { useState, useMemo } from 'react';
import { Search, X, CheckCircle2, AlertCircle, Bookmark, ArrowRight, MapPin } from 'lucide-react';
import { Book } from '../types';

interface QuickStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onIssueBook: (book: Book) => void;
  isAdmin?: boolean;
}

export const QuickStockModal: React.FC<QuickStockModalProps> = ({
  isOpen,
  onClose,
  books,
  onIssueBook,
  isAdmin = false,
}) => {
  const [query, setQuery] = useState('');

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return books.slice(0, 8); // show popular initial sample
    const q = query.toLowerCase().trim();
    return books.filter(
      b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [books, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Search className="w-5 h-5" /> Брза проверка на залиха
            </h2>
            <p className="text-xs text-slate-300">
              Внесете го името на книгата или автор за инстантен увид на залихата
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Внесете наслов на книга (напр. Зоки Поки, Пиреј, Белото циганче)..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
              >
                Исчисти
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium text-sm">Не се пронајдени книги со наслов „{query}“</p>
              <p className="text-xs text-slate-400 mt-1">Проверете го кириличниот внес или пребарајте по автор.</p>
            </div>
          ) : (
            filteredBooks.map(book => {
              const inStock = book.availableCopies > 0;
              return (
                <div
                  key={book.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-13 rounded-md flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm p-1 text-center leading-tight overflow-hidden"
                      style={{ backgroundColor: book.coverBg || '#1e3a8a' }}
                    >
                      <span className="line-clamp-2">{book.title.slice(0, 10)}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {book.title}
                        <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {book.genre}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Автор: <span className="text-slate-800 font-semibold">{book.author}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          {book.shelfLocation}
                        </span>
                        <span>•</span>
                        <span>Година: {book.year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Pill & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {inStock ? (
                        <span className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Во залиха: <strong className="text-emerald-800 text-sm">{book.availableCopies}</strong> / {book.totalCopies}
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Сите се издадени (0/{book.totalCopies})
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        disabled={!inStock}
                        onClick={() => {
                          onClose();
                          onIssueBook(book);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                          inStock
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Позајми</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>База: <strong>{books.length} наслови</strong> • Барајте по кириличен наслов</span>
          <button
            onClick={onClose}
            className="text-slate-600 font-medium hover:underline"
          >
            Затвори
          </button>
        </div>

      </div>
    </div>
  );
};
