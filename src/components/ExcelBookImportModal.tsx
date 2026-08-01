import React, { useState, useRef } from 'react';
import { 
  X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, 
  Download, BookOpen, Table, FileCheck, RefreshCw, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Book, GenreType } from '../types';

interface ExcelBookImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooksCount: number;
  onImportBooks: (newBooks: Book[], replaceExisting: boolean) => void;
}

interface BookColumnMapping {
  title: number;
  author: number;
  isbn: number;
  genre: number;
  publisher: number;
  year: number;
  totalCopies: number;
  shelfLocation: number;
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

export const ExcelBookImportModal: React.FC<ExcelBookImportModalProps> = ({
  isOpen,
  onClose,
  existingBooksCount,
  onImportBooks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colMapping, setColMapping] = useState<BookColumnMapping>({
    title: -1,
    author: -1,
    isbn: -1,
    genre: -1,
    publisher: -1,
    year: -1,
    totalCopies: -1,
    shelfLocation: -1,
  });
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [parsedBooks, setParsedBooks] = useState<Partial<Book>[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (uploadedFile: File) => {
    setErrorMsg(null);
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Parse sheet to array of arrays
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

        if (!data || data.length === 0) {
          setErrorMsg("Избраниот фајл е празен или нема податоци.");
          setIsProcessing(false);
          return;
        }

        // Filter out completely empty rows
        const nonEmptyRows = data.filter(row => Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== ''));

        if (nonEmptyRows.length === 0) {
          setErrorMsg("Фајлот не содржи пополнети редови.");
          setIsProcessing(false);
          return;
        }

        const firstRow = nonEmptyRows[0].map(c => String(c ?? '').trim());
        setHeaders(firstRow);
        setRawRows(nonEmptyRows);

        // Smart column mapping detection
        const autoMapping: BookColumnMapping = {
          title: -1,
          author: -1,
          isbn: -1,
          genre: -1,
          publisher: -1,
          year: -1,
          totalCopies: -1,
          shelfLocation: -1,
        };

        firstRow.forEach((h, index) => {
          const lower = h.toLowerCase();
          if (autoMapping.title === -1 && (lower.includes('наслов') || lower.includes('книга') || lower.includes('title') || lower.includes('book') || lower.includes('назив'))) {
            autoMapping.title = index;
          } else if (autoMapping.author === -1 && (lower.includes('автор') || lower.includes('pisatel') || lower.includes('author') || lower.includes('писател'))) {
            autoMapping.author = index;
          } else if (autoMapping.isbn === -1 && (lower.includes('инвентар') || lower.includes('брод') || lower.includes('isbn') || lower.includes('инв') || lower.includes('број') || lower.includes('код'))) {
            autoMapping.isbn = index;
          } else if (autoMapping.genre === -1 && (lower.includes('жанр') || lower.includes('категорија') || lower.includes('лектира') || lower.includes('genre') || lower.includes('category'))) {
            autoMapping.genre = index;
          } else if (autoMapping.publisher === -1 && (lower.includes('издавач') || lower.includes('куќа') || lower.includes('publisher'))) {
            autoMapping.publisher = index;
          } else if (autoMapping.year === -1 && (lower.includes('година') || lower.includes('издадена') || lower.includes('year'))) {
            autoMapping.year = index;
          } else if (autoMapping.totalCopies === -1 && (lower.includes('примерок') || lower.includes('количи') || lower.includes('копи') || lower.includes('бројка') || lower.includes('copies') || lower.includes('парчиња'))) {
            autoMapping.totalCopies = index;
          } else if (autoMapping.shelfLocation === -1 && (lower.includes('рафт') || lower.includes('локација') || lower.includes('место') || lower.includes('shelf') || lower.includes('витрина'))) {
            autoMapping.shelfLocation = index;
          }
        });

        // Fallbacks if not auto detected
        if (autoMapping.title === -1) autoMapping.title = 0;
        if (autoMapping.author === -1 && firstRow.length > 1) autoMapping.author = 1;

        setColMapping(autoMapping);
        parseBooksWithMapping(nonEmptyRows, autoMapping, true);

      } catch (err) {
        console.error("Грешка при читање на Excel фајлот за книги:", err);
        setErrorMsg("Настана грешка при читање на фајлот. Проверете дали фајлот е валиден .xlsx, .xls или .csv.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Неуспешно читање на фајлот од компјутерот.");
      setIsProcessing(false);
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Convert raw rows into Book objects using selected column mapping
  const parseBooksWithMapping = (rows: any[][], mapping: BookColumnMapping, headerRow: boolean) => {
    const dataRows = headerRow ? rows.slice(1) : rows;
    
    const parsedList: Partial<Book>[] = [];

    dataRows.forEach((row, idx) => {
      if (!Array.isArray(row)) return;

      const rawTitle = mapping.title >= 0 ? String(row[mapping.title] ?? '').trim() : '';
      if (!rawTitle) return; // Skip rows without book title

      const rawAuthor = mapping.author >= 0 ? String(row[mapping.author] ?? '').trim() : 'Непознат автор';
      const rawIsbn = mapping.isbn >= 0 ? String(row[mapping.isbn] ?? '').trim() : `ИНВ-${10000 + idx + (replaceExisting ? 0 : existingBooksCount)}`;
      const rawPublisher = mapping.publisher >= 0 ? String(row[mapping.publisher] ?? '').trim() : 'Просветно дело';
      
      let rawYear = 2020;
      if (mapping.year >= 0 && row[mapping.year]) {
        const parsedY = parseInt(String(row[mapping.year]).replace(/\D/g, ''), 10);
        if (!isNaN(parsedY) && parsedY > 1800 && parsedY <= 2030) {
          rawYear = parsedY;
        }
      }

      let rawCopies = 1;
      if (mapping.totalCopies >= 0 && row[mapping.totalCopies]) {
        const parsedC = parseInt(String(row[mapping.totalCopies]).replace(/\D/g, ''), 10);
        if (!isNaN(parsedC) && parsedC > 0) {
          rawCopies = parsedC;
        }
      }

      const rawShelf = mapping.shelfLocation >= 0 ? String(row[mapping.shelfLocation] ?? '').trim() : 'Рафт А-1';
      
      let rawGenre: GenreType = 'Македонска книжевност';
      if (mapping.genre >= 0 && row[mapping.genre]) {
        const gStr = String(row[mapping.genre]).toLowerCase().trim();
        if (gStr.includes('лектира')) {
          if (gStr.includes('i-iii') || gStr.includes('1-3') || gStr.includes('прво') || gStr.includes('второ') || gStr.includes('трето')) {
            rawGenre = 'Лектира I-III одд.';
          } else if (gStr.includes('vii-ix') || gStr.includes('7-9') || gStr.includes('седмо') || gStr.includes('осмо') || gStr.includes('деветто')) {
            rawGenre = 'Лектира VII-IX одд.';
          } else {
            rawGenre = 'Лектира IV-VI одд.';
          }
        } else if (gStr.includes('светска') || gStr.includes('странска')) {
          rawGenre = 'Светска книжевност';
        } else if (gStr.includes('поезија') || gStr.includes('песни')) {
          rawGenre = 'Поезија';
        } else if (gStr.includes('енциклопедија') || gStr.includes('наука')) {
          rawGenre = 'Енциклопедија и Наука';
        } else if (gStr.includes('стрип') || gStr.includes('списание')) {
          rawGenre = 'Стрипови и Списанија';
        } else if (gStr.includes('драма') || gStr.includes('театар')) {
          rawGenre = 'Драма';
        } else if (gStr.includes('басни') || gStr.includes('бајки')) {
          rawGenre = 'Басни и Бајки';
        }
      }

      parsedList.push({
        title: rawTitle,
        author: rawAuthor,
        isbn: rawIsbn,
        publisher: rawPublisher,
        year: rawYear,
        genre: rawGenre,
        totalCopies: rawCopies,
        availableCopies: rawCopies,
        shelfLocation: rawShelf || 'Рафт А-1',
        language: 'Македонски',
        addedDate: new Date().toISOString().split('T')[0]
      });
    });

    setParsedBooks(parsedList);
  };

  const handleMappingChange = (field: keyof BookColumnMapping, colIdx: number) => {
    const newMapping = { ...colMapping, [field]: colIdx };
    setColMapping(newMapping);
    parseBooksWithMapping(rawRows, newMapping, hasHeaderRow);
  };

  const handleHeaderRowToggle = (checked: boolean) => {
    setHasHeaderRow(checked);
    parseBooksWithMapping(rawRows, colMapping, checked);
  };

  // Execute import
  const handleConfirmImport = () => {
    if (parsedBooks.length === 0) {
      setErrorMsg("Нема пронајдено валидни книги за увоз.");
      return;
    }

    const finalBooksList: Book[] = parsedBooks.map((pb, idx) => ({
      id: `book-imp-${Date.now()}-${idx}-${Math.floor(Math.random()*1000)}`,
      title: pb.title || 'Без наслов',
      author: pb.author || 'Непознат автор',
      isbn: pb.isbn || `ИНВ-${20000 + idx}`,
      genre: pb.genre || 'Македонска книжевност',
      publisher: pb.publisher || 'Просветно дело',
      year: pb.year || 2022,
      totalCopies: pb.totalCopies || 1,
      availableCopies: pb.totalCopies || 1,
      shelfLocation: pb.shelfLocation || 'Рафт А-1',
      language: 'Македонски',
      addedDate: new Date().toISOString().split('T')[0]
    }));

    onImportBooks(finalBooksList, replaceExisting);
    onClose();
  };

  // Download sample template for books
  const handleDownloadTemplate = () => {
    const sampleData = [
      ["Инвентарен број", "Наслов на книга", "Автор", "Жанр / Категорија", "Издавач", "Година", "Број на примероци", "Рафт / Локација"],
      ["ИНВ-1001", "Сердарот", "Григор Прличев", "Лектира VII-IX одд.", "Култура", 2018, 15, "Рафт Л-1"],
      ["ИНВ-1002", "Зоки Поки", "Оливера Николова", "Лектира I-III одд.", "Детска радост", 2020, 25, "Рафт Л-2"],
      ["ИНВ-1003", "Бели мутри", "Славко Јаневски", "Македонска книжевност", "Мисла", 2015, 8, "Рафт М-3"],
      ["ИНВ-1004", "Големата вода", "Живко Чинго", "Лектира VII-IX одд.", "Табернакул", 2019, 12, "Рафт Л-1"],
      ["ИНВ-1005", "Деца од нашата улица", "Раде Обреновиќ", "Лектира IV-VI одд.", "Просветно дело", 2021, 10, "Рафт Л-3"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Книжен Фонд");
    XLSX.writeFile(wb, "Пример_Книги_Библиотека.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] max-w-3xl w-full border border-[#E6E8E0] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#4A5D4E] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#3A4B3D] rounded-2xl">
              <BookOpen className="w-6 h-6 text-[#D9E4DD]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-serif">Брз увоз на книги од Excel (XLSX / CSV)</h3>
              <p className="text-xs text-[#D9E4DD]">Внесете го целиот ваш книжен фонд одеднаш од Excel табела</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#D9E4DD] hover:text-white hover:bg-[#3A4B3D] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Upload Area */}
          {!file ? (
            <div className="space-y-4">
              
              <div 
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#A8763E]/40 hover:border-[#A8763E] bg-[#F1F3ED]/60 hover:bg-[#F1F3ED] p-8 rounded-3xl text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group"
              >
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <div className="w-14 h-14 rounded-2xl bg-[#A8763E]/10 text-[#A8763E] group-hover:scale-110 transition flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="font-bold text-[#2C332D] text-base">Притиснете за избор на Excel фајл со книги</h4>
                  <p className="text-xs text-[#8B9285] mt-1">
                    Поддржани формати: <strong>.XLSX</strong>, <strong>.XLS</strong> или <strong>.CSV</strong>
                  </p>
                </div>

                <div className="text-[11px] text-[#A8763E] font-bold bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                  Drag & Drop фајлот тука
                </div>
              </div>

              {/* Download Template Option */}
              <div className="flex items-center justify-between p-4 bg-[#F1F3ED] rounded-2xl border border-[#E6E8E0] text-xs">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#5D8A66]" />
                  <div>
                    <span className="font-bold text-[#2C332D]">Немате подготвен Excel за книги?</span>
                    <p className="text-[#8B9285] text-[11px]">Преземете подготвен пример шаблон во Excel со колони за наслов, автор, инвентарен број, рафт и примероци.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="bg-[#5D8A66] hover:bg-[#4D7454] text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Симни пример Excel</span>
                </button>
              </div>

            </div>
          ) : (
            
            /* File Uploaded & Processing Options */
            <div className="space-y-5">
              
              {/* File details bar */}
              <div className="flex items-center justify-between p-4 bg-[#F1F3ED] rounded-2xl border border-[#E6E8E0]">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-6 h-6 text-[#5D8A66]" />
                  <div>
                    <h5 className="font-bold text-[#2C332D] text-sm">{file.name}</h5>
                    <p className="text-xs text-[#8B9285]">
                      Вкупно пронајдени редови: <strong>{rawRows.length}</strong> • Подготвени за увоз: <strong className="text-[#5D8A66]">{parsedBooks.length} наслови на книги</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setRawRows([]);
                    setParsedBooks([]);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold underline"
                >
                  Избери друг фајл
                </button>
              </div>

              {/* Column Mapping Controls */}
              <div className="bg-white p-4 rounded-2xl border border-[#E6E8E0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#F1F3ED] pb-2">
                  <h5 className="font-bold text-xs text-[#2C332D] uppercase tracking-wider flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#A8763E]" />
                    <span>Подесување на колоните од вашиот Excel за Книги:</span>
                  </h5>

                  <label className="flex items-center gap-2 text-xs text-[#2C332D] cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasHeaderRow} 
                      onChange={e => handleHeaderRowToggle(e.target.checked)}
                      className="rounded accent-[#A8763E]"
                    />
                    <span>Првиот ред е заглавие (наслови)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  
                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Наслов на Книга <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={colMapping.title}
                      onChange={e => handleMappingChange('title', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl font-bold text-[#2C332D]"
                    >
                      <option value={-1}>-- Не е избрано --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Автор
                    </label>
                    <select
                      value={colMapping.author}
                      onChange={e => handleMappingChange('author', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Без автор (Стандардно: Непознат) --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Инвентарен број / ISBN
                    </label>
                    <select
                      value={colMapping.isbn}
                      onChange={e => handleMappingChange('isbn', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Автоматски инвентарен број --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Жанр / Категорија
                    </label>
                    <select
                      value={colMapping.genre}
                      onChange={e => handleMappingChange('genre', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Македонска книжевност --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Број на примероци
                    </label>
                    <select
                      value={colMapping.totalCopies}
                      onChange={e => handleMappingChange('totalCopies', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Стандардно: 1 примерок --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2C332D] mb-1">
                      Рафт / Локација
                    </label>
                    <select
                      value={colMapping.shelfLocation}
                      onChange={e => handleMappingChange('shelfLocation', Number(e.target.value))}
                      className="w-full text-xs p-2 bg-[#F1F3ED] border border-[#E6E8E0] rounded-xl text-[#2C332D]"
                    >
                      <option value={-1}>-- Стандардно: Рафт А-1 --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>Колона {i+1}: {h || `(Колона ${i+1})`}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* Import Mode Toggle */}
              <div className="bg-[#F1F3ED]/80 p-4 rounded-2xl border border-[#E6E8E0] space-y-2">
                <label className="block text-xs font-bold text-[#2C332D]">Начин на внесување на книгите во вашата библиотека:</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 font-bold transition ${!replaceExisting ? 'bg-white border-[#5D8A66] text-[#2C332D] shadow-xs' : 'border-transparent text-[#8B9285]'}`}>
                    <input 
                      type="radio" 
                      name="bookImportMode" 
                      checked={!replaceExisting} 
                      onChange={() => setReplaceExisting(false)} 
                      className="accent-[#5D8A66]"
                    />
                    <Plus className="w-4 h-4 text-[#5D8A66]" />
                    <span>Додај на постоечките книги ({existingBooksCount})</span>
                  </label>

                  <label className={`flex-1 p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-2 font-bold transition ${replaceExisting ? 'bg-white border-rose-500 text-rose-800 shadow-xs' : 'border-transparent text-[#8B9285]'}`}>
                    <input 
                      type="radio" 
                      name="bookImportMode" 
                      checked={replaceExisting} 
                      onChange={() => setReplaceExisting(true)} 
                      className="accent-rose-600"
                    />
                    <RefreshCw className="w-4 h-4 text-rose-600" />
                    <span>Избриши ги демо книгите и стави ги само овие</span>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#2C332D]">
                  <span className="font-bold">Преглед на книги што ќе бидат увезени ({parsedBooks.length}):</span>
                  <span className="text-[#8B9285]">Приказани првите 10 редови</span>
                </div>

                <div className="border border-[#E6E8E0] rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-white text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F1F3ED] text-[#2C332D] font-bold border-b border-[#E6E8E0]">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Наслов</th>
                        <th className="p-2.5">Автор</th>
                        <th className="p-2.5">Жанр</th>
                        <th className="p-2.5">Примероци</th>
                        <th className="p-2.5">Рафт</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3ED] text-[#2C332D]">
                      {parsedBooks.slice(0, 10).map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-[#8B9285]">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-[#4A5D4E]">{b.title}</td>
                          <td className="p-2.5">{b.author}</td>
                          <td className="p-2.5">{b.genre}</td>
                          <td className="p-2.5 font-bold text-[#A8763E]">{b.totalCopies}</td>
                          <td className="p-2.5">{b.shelfLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#F1F3ED] border-t border-[#E6E8E0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-[#2C332D] hover:bg-[#E6E8E0] rounded-xl transition"
          >
            Откажи
          </button>

          {file && (
            <button
              type="button"
              disabled={parsedBooks.length === 0}
              onClick={handleConfirmImport}
              className="bg-[#A8763E] hover:bg-[#966835] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Увези {parsedBooks.length} книги во базата</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
