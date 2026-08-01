import React, { useState, useEffect } from 'react';
import { BookOpen, Search, PlusCircle, UserPlus, ArrowRightLeft, ShieldCheck, Clock, Lock, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'loans' | 'books' | 'members' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'loans' | 'books' | 'members' | 'settings') => void;
  onOpenQuickStock: () => void;
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  onOpenAddMemberModal: () => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickStock,
  onOpenIssueModal,
  onOpenAddBookModal,
  onOpenAddMemberModal,
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#4A5D4E] text-white border-b border-[#3A4B3D] sticky top-0 z-30 shadow-md">
      {/* Top Bar with School Name & Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & School Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-[#A8763E] text-white p-2.5 rounded-2xl font-bold flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-serif italic">ООУ „Илинден“</h1>
                <span className="bg-[#3A4B3D] text-[#D9E4DD] text-xs px-2.5 py-0.5 rounded-full border border-white/10">
                  Крива Паланка
                </span>
              </div>
              <p className="text-xs text-[#D9E4DD]/80">Училишна библиотека • Дигитална евиденција</p>
            </div>
          </div>

          {/* Quick Header Search for Stock Lookup */}
          <div className="flex-1 max-w-lg mx-0 md:mx-4">
            <button
              onClick={onOpenQuickStock}
              className="w-full bg-[#3A4B3D] hover:bg-[#344337] text-white border border-white/10 rounded-2xl px-3.5 py-2 text-sm flex items-center justify-between transition group shadow-inner"
            >
              <div className="flex items-center gap-2 text-[#D9E4DD] group-hover:text-white transition">
                <Search className="w-4 h-4 text-[#A8763E]" />
                <span className="text-xs sm:text-sm">Пребарај книга или провери залиха во реално време...</span>
              </div>
              <kbd className="hidden sm:inline-block bg-[#2C332D] text-[#D9E4DD] text-[10px] px-2 py-0.5 rounded-lg border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* System Status & Time */}
          <div className="flex items-center space-x-3 justify-between md:justify-end">
            <div className="flex items-center gap-2 bg-[#3A4B3D] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-white">Во живо</span>
              <span className="text-[#8B9285]">|</span>
              <span className="font-mono text-[#D9E4DD] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#D9E4DD]" />
                {time}
              </span>
            </div>

            {/* Quick Action Shortcuts or Admin Login */}
            <div className="flex items-center space-x-1.5">
              {isAdmin ? (
                <>
                  <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Админ</span>
                  </div>
                  <button
                    onClick={onOpenIssueModal}
                    title="Позајми книга на член"
                    className="bg-[#A8763E] hover:bg-[#966835] text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Позајми</span>
                  </button>
                  <button
                    onClick={onOpenAddBookModal}
                    title="Внеси нова книга во фондот"
                    className="bg-[#3A4B3D] hover:bg-[#344337] text-white px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition border border-white/10"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#A8763E]" />
                    <span className="hidden md:inline">+ Книга</span>
                  </button>
                  <button
                    onClick={onOpenAddMemberModal}
                    title="Регистрирај нов ученик/член"
                    className="bg-[#3A4B3D] hover:bg-[#344337] text-white px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition border border-white/10"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#A8763E]" />
                    <span className="hidden md:inline">+ Член</span>
                  </button>
                  <button
                    onClick={onLogoutAdmin}
                    title="Одјави се од админ профил"
                    className="bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-500/30 px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Излез</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAdminModal}
                  title="Најави се како администратор за да вршиш промени"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Админ Влез</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-[#3A4B3D] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#F8F9F4] text-[#4A5D4E] font-bold shadow-sm'
                  : 'text-[#D9E4DD] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>📊 Контролна табла</span>
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'loans'
                  ? 'bg-[#F8F9F4] text-[#4A5D4E] font-bold shadow-sm'
                  : 'text-[#D9E4DD] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>📋 Евиденција</span>
            </button>

            <button
              onClick={() => setActiveTab('books')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'books'
                  ? 'bg-[#F8F9F4] text-[#4A5D4E] font-bold shadow-sm'
                  : 'text-[#D9E4DD] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>📚 База на книги (~5000)</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-[#F8F9F4] text-[#4A5D4E] font-bold shadow-sm'
                  : 'text-[#D9E4DD] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>👥 База на корисници (~1000)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#F8F9F4] text-[#4A5D4E] font-bold shadow-sm'
                  : 'text-[#D9E4DD] hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>⚙️ Подесувања & Извештаи</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
