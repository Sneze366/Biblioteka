import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, Filter, Plus, LayoutGrid, List, 
  MapPin, CheckCircle2, AlertCircle, ArrowRightLeft, BookMarked, ChevronLeft, ChevronRight, Info, FileSpreadsheet
} from 'lucide-react';
import { Book, GenreType, Loan } from '../types';

interface BooksViewProps {
  books: Book[];
  loans: Loan[];
  onOpenAddBookModal: () => void;
  onOpenBookImportModal?: () => void;
  onSelectBookForIssue: (book: Book) => void;
  isAdmin?: boolean;
}

const GENRES_LIST: GenreType[] = [
  'Лектира I-III одд.',
  'Лектира IV-VI одд.',
  'Лектира VII-IX одд.',
  'Македонска книжевност',
  'Светска книжевност',
  'Поезија',
  'Енциклопедија и Наука',
  'Стрипови и Списанија',
  'Драма',
  'Басни и Бајки',
  'Друго'
];

export const BooksView: React.FC<BooksViewProps> = ({
  books,
  loans,
  onOpenAddBookModal,
  onOpenBookImportModal,
  onSelectBookForIssue,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('сите');
  const [availabilityFilter, setAvailabilityFilter] = useState<'сите' | 'во_залиха' | 'издадени'>('сите');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);

  // Selected Book Details Modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Filtered dataset
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q);
      const matchesGenre = selectedGenre === 'сите' ? true : b.genre === selectedGenre;
      const matchesStock = 
        availabilityFilter === 'сите' ? true :
        availabilityFilter === 'во_залиха' ? b.availableCopies > 0 :
        b.availableCopies === 0;

      return matchesQuery && matchesGenre && matchesStock;
    });
  }, [books, searchQuery, selectedGenre, availabilityFilter]);

  // Total total physical copies in current filter
  const totalCopiesInView = useMemo(() => {
    return filteredBooks.reduce((sum, b) => sum + b.totalCopies, 0);
  }, [filteredBooks]);

  // Paginated chunk
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Active borrowers for selected book
  const currentBorrowers = useMemo(() => {
    if (!selectedBook) return [];
    return loans.filter(l => l.bookId === selectedBook.id && l.status !== 'вратена');
  }, [selectedBook, loans]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[32px] border border-[#E6E8E0] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#2C332D]">База на книги и книжен фонд</h2>
            <span className="bg-[#D9E4DD] text-[#4A5D4E] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E6E8E0]">
              {books.length} наслови
            </span>
          </div>
          <p className="text-xs text-[#8B9285] mt-0.5">
            Пребарување по автор, жанр, лектири и локација на рафт во ООУ „Илинден“
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            {onOpenBookImportModal && (
              <button
                onClick={onOpenBookImportModal}
                className="bg-[#5D8A66] hover:bg-[#4D7454] text-white font-bold px-4 py-2.5 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Импорт од Excel</span>
              </button>
            )}

            <button
              onClick={onOpenAddBookModal}
              className="bg-[#A8763E] hover:bg-[#966835] text-white font-bold px-4 py-2.5 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Внеси нова книга</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-[#E6E8E0] shadow-sm space-y-3">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B9285]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Пребарај по наслов на книга, автор или ISBN..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] transition-all"
            />
          </div>

          {/* Genre Filter Dropdown */}
          <div>
            <select
              value={selectedGenre}
              onChange={e => {
                setSelectedGenre(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
            >
              <option value="сите">Сите жанрови & лектири</option>
              {GENRES_LIST.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={e => {
                setAvailabilityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-[#F1F3ED] border-none rounded-2xl text-[#2C332D] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
            >
              <option value="сите">Сите статус на залиха</option>
              <option value="во_залиха">Само слободни во залиха</option>
              <option value="издадени">Сите издадени (0 во залиха)</option>
            </select>
          </div>

        </div>

        {/* View Mode & Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#F1F3ED] pt-3 text-xs text-[#8B9285]">
          <div>
            Прикажани <strong>{filteredBooks.length}</strong> наслови (вкупно <strong>{totalCopiesInView}</strong> физички книги во залиха)
          </div>

          <div className="flex items-center gap-3">
            {/* Items Per Page */}
            <div className="flex items-center gap-1.5">
              <span>Прикажи:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#F1F3ED] border-none rounded-xl px-2 py-1 text-[#2C332D] font-semibold"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Grid / Table toggle */}
            <div className="flex items-center bg-[#F1F3ED] rounded-xl p-0.5 border border-[#E6E8E0]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-[#4A5D4E] shadow-sm' : 'text-[#8B9285]'}`}
                title="Мрежен приказ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white text-[#4A5D4E] shadow-sm' : 'text-[#8B9285]'}`}
                title="Табеларен приказ"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Catalog Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedBooks.map(book => {
            const inStock = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-4 space-y-3">
                  
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-12 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold p-1 text-center shadow-md leading-tight overflow-hidden"
                      style={{ backgroundColor: book.coverBg || '#1e3a8a' }}
                    >
                      <span className="line-clamp-3">{book.title.slice(0, 12)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 inline-block mb-1 truncate max-w-full">
                        {book.genre}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-600 transition">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                        {book.author}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Рафт / Секција:</span>
                      <strong className="text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" /> {book.shelfLocation}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Издавач / Година:</span>
                      <span className="text-slate-700">{book.publisher}, {book.year}</span>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {inStock ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Залиха: {book.availableCopies}/{book.totalCopies}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        Сите се издадени
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedBook(book)}
                      title="Детали за книгата"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        disabled={!inStock}
                        onClick={() => onSelectBookForIssue(book)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                          inStock
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Позајми
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Наслов</th>
                  <th className="py-3 px-4">Автор</th>
                  <th className="py-3 px-4">Жанр</th>
                  <th className="py-3 px-4">Локација</th>
                  <th className="py-3 px-4">Залиха</th>
                  <th className="py-3 px-4 text-right">Акција</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedBooks.map(book => (
                  <tr key={book.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{book.title}</div>
                      <div className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{book.author}</td>
                    <td className="py-3 px-4 text-xs font-medium text-amber-800">{book.genre}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">{book.shelfLocation}</td>
                    <td className="py-3 px-4 text-xs">
                      {book.availableCopies > 0 ? (
                        <span className="font-bold text-emerald-700">{book.availableCopies} од {book.totalCopies} во залиха</span>
                      ) : (
                        <span className="font-bold text-rose-600">0 од {book.totalCopies} (Сите позајмени)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBook(book)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                      >
                        Детали
                      </button>
                      {isAdmin && (
                        <button
                          disabled={book.availableCopies === 0}
                          onClick={() => onSelectBookForIssue(book)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                            book.availableCopies > 0
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Позајми
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600">
          <div>
            Страница <strong>{currentPage}</strong> од <strong>{totalPages}</strong> (Прикажани {(currentPage-1)*pageSize + 1} - {Math.min(currentPage*pageSize, filteredBooks.length)} од {filteredBooks.length})
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

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {selectedBook.genre}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedBook.title}</h3>
                <p className="text-sm text-slate-600 font-medium">Автор: {selectedBook.author}</p>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Локација на рафт:</strong> {selectedBook.shelfLocation}</div>
                <div><strong>Издавач:</strong> {selectedBook.publisher} ({selectedBook.year})</div>
                <div><strong>Вкупно примероци:</strong> {selectedBook.totalCopies}</div>
                <div><strong>Слободни за позајмување:</strong> <span className="text-emerald-700 font-bold">{selectedBook.availableCopies}</span></div>
              </div>
              <p className="pt-2 border-t border-slate-200 text-slate-600 italic leading-relaxed">
                {selectedBook.description || "Опис за училишната библиотека во ООУ „Илинден“ Крива Паланка."}
              </p>
            </div>

            {/* Current Borrowers List (Admin) or Privacy Status (Visitor) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isAdmin ? `Моментално е кај учениците/членовите (${currentBorrowers.length}):` : 'Статус на задоцнетост / рафт:'}
              </h4>
              {isAdmin ? (
                currentBorrowers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Сите примероци се моментално во библиотеката.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {currentBorrowers.map(l => (
                      <div key={l.id} className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900">{l.memberName}</strong> ({l.memberGrade})
                        </div>
                        <span className="text-slate-500 text-[11px]">Рок: {l.dueDate}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-3 rounded-2xl border text-xs">
                  {selectedBook.availableCopies === selectedBook.totalCopies ? (
                    <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                      <div>
                        <strong className="font-bold text-emerald-900">Достапна на рафт</strong>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Сите {selectedBook.totalCopies} примероци се слободни за читање.</p>
                      </div>
                    </div>
                  ) : selectedBook.availableCopies > 0 ? (
                    <div className="flex items-center gap-2.5 bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                      <div>
                        <strong className="font-bold text-amber-950">Делумно слободна</strong>
                        <p className="text-[11px] text-amber-800 mt-0.5">Има {selectedBook.availableCopies} слободни примероци на рафт (од вкупно {selectedBook.totalCopies}).</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 bg-rose-50 text-rose-900 p-3 rounded-xl border border-rose-200">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                      <div>
                        <strong className="font-bold text-rose-950">Позајмена</strong>
                        <p className="text-[11px] text-rose-700 mt-0.5">Сите примероци од оваа книга се моментално позајмени.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-200 transition"
              >
                Затвори
              </button>
              {isAdmin && selectedBook.availableCopies > 0 && (
                <button
                  onClick={() => {
                    const b = selectedBook;
                    setSelectedBook(null);
                    onSelectBookForIssue(b);
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  Позајми книга
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
