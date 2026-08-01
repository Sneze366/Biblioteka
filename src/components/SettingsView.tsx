import React, { useState } from 'react';
import { 
  Database, RefreshCw, Download, Upload, Printer, 
  Check, AlertTriangle, ShieldCheck, FileSpreadsheet, Building, Trash2, Plus, BookOpen
} from 'lucide-react';
import { Book, Member, Loan, LibraryStats } from '../types';

interface SettingsViewProps {
  stats: LibraryStats;
  books: Book[];
  members: Member[];
  loans: Loan[];
  onResetFactoryData: () => void;
  onClearDatabase?: () => void;
  onOpenExcelImportModal?: () => void;
  onOpenExcelBookImportModal?: () => void;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stats,
  books,
  members,
  loans,
  onResetFactoryData,
  onClearDatabase,
  onOpenExcelImportModal,
  onOpenExcelBookImportModal,
  isAdmin = false,
  onOpenAdminModal,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const executeClear = () => {
    if (onClearDatabase) {
      onClearDatabase();
    }
    setShowClearModal(false);
    setStatusMessage("Базата е успешно исчистена! Сите демо книги и членови се избришани. Сега може да започнете со внесување на вашите реални книги.");
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const executeReset = () => {
    onResetFactoryData();
    setShowResetModal(false);
    setStatusMessage("Базата е успешно ресетирана со фабричките ~5,000 книги и ~1,000 членови!");
    setTimeout(() => setStatusMessage(null), 6000);
  };

  // Export database as JSON
  const handleExportJSON = () => {
    const data = {
      institution: "ООУ „Илинден“ Крива Паланка",
      exportDate: new Date().toISOString(),
      stats,
      books,
      members,
      loans,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilinden-biblioteka-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Export books list as CSV for Excel
  const handleExportBooksCSV = () => {
    const headers = ["ID", "ISBN", "Наслов", "Автор", "Жанр", "Рафт/Локација", "Вкупно примероци", "Слободни"];
    const rows = books.map(b => [
      b.id,
      b.isbn,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.genre}"`,
      `"${b.shelfLocation}"`,
      b.totalCopies,
      b.availableCopies
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knizen-fond-ilinden-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrintFullReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="bg-white p-5 rounded-[32px] border border-[#E6E8E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C332D] flex items-center gap-2">
            <Database className="w-6 h-6 text-[#A8763E]" />
            Управување со базата и Генератор на податоци
          </h2>
          <p className="text-xs text-[#8B9285] mt-0.5">
            Конфигурација за ООУ „Илинден“ Крива Паланка • Сигурност, бекап и извештаи
          </p>
        </div>

        <button
          onClick={handlePrintFullReport}
          className="bg-[#4A5D4E] hover:bg-[#3A4B3D] text-white font-bold px-4 py-2 rounded-2xl text-xs transition flex items-center gap-2 shadow-sm self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-[#A8763E]" />
          <span>Испечати годишен извештај</span>
        </button>
      </div>

      {/* Grid Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Data Backup & Export */}
        <div className="bg-white rounded-[32px] p-5 border border-[#E6E8E0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F1F3ED] pb-3">
            <Download className="w-5 h-5 text-[#A8763E]" />
            <h3 className="font-bold text-[#2C332D] text-base">Извоз на податоци (Backup & Excel)</h3>
          </div>

          <p className="text-xs text-[#8B9285] leading-relaxed">
            Преземете ги сите податоци за книжниот фонд од 5,000 книги, членовите и активните позајмувања во JSON или CSV формат погоден за Microsoft Excel.
          </p>

          <div className="space-y-2 pt-2">
            {isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {onOpenExcelImportModal && (
                  <button
                    onClick={onOpenExcelImportModal}
                    className="w-full bg-[#5D8A66] hover:bg-[#4D7454] text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition flex items-center justify-between shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-white shrink-0" />
                      Увези ученици од Excel
                    </span>
                    <Upload className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
                  </button>
                )}

                {onOpenExcelBookImportModal && (
                  <button
                    onClick={onOpenExcelBookImportModal}
                    className="w-full bg-[#4A5D4E] hover:bg-[#3A4B3D] text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition flex items-center justify-between shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#D9E4DD] shrink-0" />
                      Увези книги од Excel
                    </span>
                    <Upload className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
                  </button>
                )}
              </div>
            ) : null}

            <button
              onClick={handleExportBooksCSV}
              className="w-full bg-[#F1F3ED] hover:bg-[#E6E8E0] text-[#2C332D] font-bold py-2.5 px-4 rounded-2xl text-xs transition flex items-center justify-between border-none"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#5D8A66]" />
                Извези книжен фонд за Excel (CSV)
              </span>
              <Download className="w-4 h-4 text-[#8B9285]" />
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full bg-[#F1F3ED] hover:bg-[#E6E8E0] text-[#2C332D] font-bold py-2.5 px-4 rounded-2xl text-xs transition flex items-center justify-between border-none"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#A8763E]" />
                Комплетна бекап копија (JSON)
              </span>
              <Download className="w-4 h-4 text-[#8B9285]" />
            </button>
          </div>
        </div>

        {/* Card 2: Reset & Seed Database */}
        <div className="bg-white rounded-[32px] p-5 border border-[#E6E8E0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F1F3ED] pb-3">
            <RefreshCw className="w-5 h-5 text-[#A8763E]" />
            <h3 className="font-bold text-[#2C332D] text-base">База на податоци & Внес на реални книги</h3>
          </div>

          <p className="text-xs text-[#8B9285] leading-relaxed">
            Може да внесувате ваши сопствени книги и корисници преку копчињата <strong>+ Внеси нова книга</strong> и <strong>+ Регистрирај член</strong>. Ако сакате да ги избришете сите демо книги и да започнете со празна база за вашите книги, искористете ја опцијата подолу.
          </p>

          {statusMessage && (
            <div className="p-3 bg-[#F1F3ED] border border-[#5D8A66]/30 rounded-2xl text-[#2C332D] text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-[#5D8A66]" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="pt-2 space-y-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowClearModal(true)}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold py-2.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Започни со празна база (Избриши ги сите демо книги и членови)</span>
                </button>

                <button
                  onClick={() => setShowResetModal(true)}
                  className="w-full bg-[#A8763E] hover:bg-[#966835] text-white font-bold py-2.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Ресетирај на фабричка демо база (~5000 книги и ~1000 членови)</span>
                </button>
              </>
            ) : (
              <div className="bg-[#FAF8F5] border border-[#A8763E]/30 rounded-2xl p-4 text-center space-y-2">
                <p className="text-xs text-[#2C332D]">
                  За да ресетирате или бришете податоци во базата, потребен е <strong>Администраторски PIN код (2026)</strong>.
                </p>
                {onOpenAdminModal && (
                  <button
                    onClick={onOpenAdminModal}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>Најави се како Администратор</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Clearing Database */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-100 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Бришење на демо податоците?</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Дали сте сигурни дека сакате да ги избришете сите демо книги, членови и позајмувања и да започнете со <strong>целосно празна база</strong> за внесување на вашите вистински книги?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Откажи
              </button>
              <button
                onClick={executeClear}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
              >
                Да, празни ја базата
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Database */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-100 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Ресетирање на демо база?</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Оваа опција ќе ги врати првичните ~5,000 демо книги и ~1,000 членови. Дали сакате да продолжите?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Откажи
              </button>
              <button
                onClick={executeReset}
                className="px-4 py-2 text-xs font-bold text-white bg-[#A8763E] hover:bg-[#966835] rounded-xl transition shadow-sm"
              >
                Да, ресетирај
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Info Card for Print */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Основно општинско училиште „Илинден“</h3>
            <p className="text-xs text-slate-400">Училишна библиотека • Општина Крива Паланка</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-800">
          <div>
            <span className="text-slate-400">Вкупно книги:</span>
            <p className="font-bold text-white text-sm">{stats.totalCopies.toLocaleString('mk-MK')} примероци</p>
          </div>
          <div>
            <span className="text-slate-400">Вкупно наслови:</span>
            <p className="font-bold text-white text-sm">{stats.totalTitles.toLocaleString('mk-MK')} изданија</p>
          </div>
          <div>
            <span className="text-slate-400">Заведени членови:</span>
            <p className="font-bold text-white text-sm">{stats.totalMembers.toLocaleString('mk-MK')} корисници</p>
          </div>
          <div>
            <span className="text-slate-400">Статус на систем:</span>
            <p className="font-bold text-emerald-400 text-sm">Активен • Реално време</p>
          </div>
        </div>
      </div>

      {/* Hidden Print Report Structure */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 font-sans text-slate-900">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-xl font-bold">ОСНОВНО ОПШТИНСКО УЧИЛИШТЕ „ИЛИНДЕН“ - КРИВА ПАЛАНКА</h1>
            <p className="text-sm font-semibold">ГОДИШЕН ИЗВЕШТАЈ ЗА УЧИЛИШНАТА БИБЛИОТЕКА</p>
            <p className="text-xs text-slate-500">Датум: {new Date().toLocaleDateString('mk-MK')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border p-4 rounded">
            <div><strong>Вкупно книги во фонд:</strong> {stats.totalCopies}</div>
            <div><strong>Вкупно изданија/наслови:</strong> {stats.totalTitles}</div>
            <div><strong>Моментално позајмени:</strong> {stats.issuedCopies}</div>
            <div><strong>Слободни на залиха:</strong> {stats.availableCopies}</div>
            <div><strong>Регистрирани ученици и членови:</strong> {stats.totalMembers}</div>
            <div><strong>Задоцнети позајмувања:</strong> {stats.overdueLoans}</div>
          </div>

          <p className="text-xs text-slate-700">
            Забелешка: Извештајот е генериран автоматски преку софтверскиот систем за евиденција во библиотеката на ООУ „Илинден“ Крива Паланка.
          </p>

          <div className="pt-12 flex justify-between text-xs">
            <div>
              <p>__________________________</p>
              <p>Библиотекар: Снежана Златковска</p>
            </div>
            <div>
              <p>__________________________</p>
              <p>Директор на училиштето</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
