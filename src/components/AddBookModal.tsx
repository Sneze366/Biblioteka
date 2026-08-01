import React, { useState } from 'react';
import { X, Plus, BookOpen, MapPin, Layers, Loader2 } from 'lucide-react';
import { Book, GenreType } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (newBook: Omit<Book, 'id' | 'addedDate' | 'availableCopies'>) => void;
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

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<GenreType>('Лектира IV-VI одд.');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [shelfLocation, setShelfLocation] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || isSubmitting) return;

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      genre,
      publisher: publisher.trim() || 'Училишно издание',
      year,
      totalCopies,
      shelfLocation: shelfLocation.trim() || 'Рафт А-1',
      isbn: isbn.trim() || '978-9989-000-0',
      language: 'Македонски',
      description: description.trim() || 'Внесена нова книга во фондот на ООУ „Илинден“ Крива Паланка.'
    };

    setIsSubmitting(true);
    try {
      // Save directly to Firestore using collection(db, "books") and addDoc
      await addDoc(collection(db, "books"), {
        ...bookData,
        availableCopies: totalCopies,
        addedDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Грешка при зачувување во Firestore:", err);
    } finally {
      onAddBook(bookData);
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
              <Plus className="w-5 h-5" /> Внес на нова книга во библиотеката
            </h2>
            <p className="text-xs text-slate-300">
              ООУ „Илинден“ Крива Паланка • Заведете нови примероци
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">Наслов на книга *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="напр. Белото циганче, Пиреј, Зоки Поки..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Автор *</label>
              <input
                type="text"
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="напр. Видое Подгорец, Петре М. Андреевски..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Жанр / Лектира</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value as GenreType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Рафт / Локација во библиотека</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={e => setShelfLocation(e.target.value)}
                placeholder="напр. Секција Лектири - Рафт Б-2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Број на физички примероци</label>
              <input
                type="number"
                min={1}
                max={500}
                value={totalCopies}
                onChange={e => setTotalCopies(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Издавач</label>
              <input
                type="text"
                value={publisher}
                onChange={e => setPublisher(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Година на издавање</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Краток опис или содржина</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Белешки за содржината на книгата..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

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
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition shadow-md flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Се зачувува во Firestore...' : 'Зачувај книга во фондот'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
