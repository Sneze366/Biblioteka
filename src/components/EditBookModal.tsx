import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Layers, MapPin, Loader2 } from 'lucide-react';
import { Book, GenreType } from '../types';

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSaveBook: (updatedBook: Book) => void;
}

const GENRES: GenreType[] = [
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

export const EditBookModal: React.FC<EditBookModalProps> = ({
  isOpen,
  book,
  onClose,
  onSaveBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<GenreType>('Лектира IV-VI одд.');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [availableCopies, setAvailableCopies] = useState<number>(1);
  const [shelfLocation, setShelfLocation] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setGenre(book.genre || 'Лектира IV-VI одд.');
      setPublisher(book.publisher || '');
      setYear(book.year || new Date().getFullYear());
      setTotalCopies(book.totalCopies || 1);
      setAvailableCopies(book.availableCopies !== undefined ? book.availableCopies : book.totalCopies || 1);
      setShelfLocation(book.shelfLocation || '');
      setIsbn(book.isbn || '');
      setDescription(book.description || '');
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated: Book = {
        ...book,
        title: title.trim(),
        author: author.trim(),
        genre,
        publisher: publisher.trim() || 'Училишно издание',
        year: Number(year) || new Date().getFullYear(),
        totalCopies: Number(totalCopies) || 1,
        availableCopies: Math.min(Number(totalCopies) || 1, Math.max(0, Number(availableCopies))),
        shelfLocation: shelfLocation.trim() || 'Рафт А-1',
        isbn: isbn.trim() || '978-9989-000-0',
        description: description.trim()
      };

      await onSaveBook(updated);
    } catch (err) {
      console.error("Грешка при зачувување на измените:", err);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Edit3 className="w-5 h-5" /> Измена / Уредување на книга
            </h2>
            <p className="text-xs text-slate-300">
              ООУ „Илинден“ Крива Паланка • Промена на залиха, рафт или податоци
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Наслов на книгата *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="напр. Зоки Поки"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Автор *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="напр. Оливера Николова"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Жанр / Категорија
              </label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value as GenreType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Рафт / Локација
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={e => setShelfLocation(e.target.value)}
                placeholder="напр. Рафт Б-3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                ISBN Број
              </label>
              <input
                type="text"
                value={isbn}
                onChange={e => setIsbn(e.target.value)}
                placeholder="978-9989-..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Вкупно примероци
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={totalCopies}
                onChange={e => setTotalCopies(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Слободни на рафт
              </label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={e => setAvailableCopies(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Издавач
              </label>
              <input
                type="text"
                value={publisher}
                onChange={e => setPublisher(e.target.value)}
                placeholder="напр. Детска Радост"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Година на издавање
              </label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Опис / Забелешка
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Откажи
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Зачувување...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Зачувај измени
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
