/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CirculationView } from './components/CirculationView';
import { BooksView } from './components/BooksView';
import { MembersView } from './components/MembersView';
import { SettingsView } from './components/SettingsView';

import { QuickStockModal } from './components/QuickStockModal';
import { IssueBookModal } from './components/IssueBookModal';
import { AddBookModal } from './components/AddBookModal';
import { AddMemberModal } from './components/AddMemberModal';
import { MemberHistoryModal } from './components/MemberHistoryModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ExcelBookImportModal } from './components/ExcelBookImportModal';
import { AdminPinModal } from './components/AdminPinModal';

import { 
  getBooks, getMembers, getLoans, getLogs, getLibraryStats, 
  issueBook, returnBook, extendLoan, saveBooks, saveMembers, 
  resetLibraryToFactoryDefault, clearDatabaseToEmpty, LIBRARY_STORAGE_EVENT,
  subscribeToLoans
} from './services/storageService';

import { Book, Member, Loan, ActivityLog, LibraryStats } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loans' | 'books' | 'members' | 'settings'>('dashboard');

  // Application Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    totalTitles: 0,
    totalCopies: 0,
    issuedCopies: 0,
    availableCopies: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0,
    returnedCount: 0
  });

  // Admin PIN Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('ilinden_library_is_admin') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('ilinden_library_is_admin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('ilinden_library_is_admin');
  };

  // Modal Dialog States
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isExcelBookImportModalOpen, setIsExcelBookImportModalOpen] = useState(false);
  
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<Member | null>(null);
  const [initialBookForIssue, setInitialBookForIssue] = useState<Book | null>(null);
  const [initialMemberForIssue, setInitialMemberForIssue] = useState<Member | null>(null);

  // Load state from local storage service
  const reloadData = useCallback(() => {
    const currentBooks = getBooks();
    const currentMembers = getMembers();
    const currentLoans = getLoans();
    const currentLogs = getLogs();
    const currentStats = getLibraryStats();

    setBooks(currentBooks);
    setMembers(currentMembers);
    setLoans(currentLoans);
    setLogs(currentLogs);
    setStats(currentStats);
  }, []);

  useEffect(() => {
    reloadData();

    // Real-time Firestore 'loans' subscription
    const unsubscribeLoans = subscribeToLoans((firestoreLoans) => {
      setLoans(firestoreLoans);
    });

    // Listen to real-time custom local updates
    const handleStorageEvent = () => {
      reloadData();
    };

    window.addEventListener(LIBRARY_STORAGE_EVENT, handleStorageEvent);
    return () => {
      unsubscribeLoans();
      window.removeEventListener(LIBRARY_STORAGE_EVENT, handleStorageEvent);
    };
  }, [reloadData]);

  // Keyboard shortcut ⌘K or Ctrl+K for quick stock search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickStockOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleConfirmIssue = async (bookId: string, memberId: string, dueDays: number, notes?: string) => {
    const result = await issueBook(bookId, memberId, dueDays, notes);
    if (!result.success) {
      alert(result.message);
    } else {
      setInitialBookForIssue(null);
      setInitialMemberForIssue(null);
    }
  };

  const handleReturnBook = async (loanId: string) => {
    await returnBook(loanId);
  };

  const handleExtendLoan = async (loanId: string) => {
    await extendLoan(loanId);
  };

  const handleAddBook = (newBookData: Omit<Book, 'id' | 'addedDate' | 'availableCopies'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `bk-${Date.now()}`,
      addedDate: new Date().toISOString().split('T')[0],
      availableCopies: newBookData.totalCopies,
      coverBg: ["#1e3a8a", "#065f46", "#7c2d12", "#4c1d95"][Math.floor(Math.random() * 4)]
    };
    saveBooks([newBook, ...books]);
  };

  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'memberNumber' | 'registrationDate' | 'active'>) => {
    const newMember: Member = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
      memberNumber: `ИЛ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      registrationDate: new Date().toISOString().split('T')[0],
      active: true
    };
    saveMembers([newMember, ...members]);
  };

  const handleImportMembers = (importedList: Member[], replaceExisting: boolean) => {
    if (replaceExisting) {
      saveMembers(importedList);
    } else {
      saveMembers([...importedList, ...members]);
    }
  };

  const handleImportBooks = (importedList: Book[], replaceExisting: boolean) => {
    if (replaceExisting) {
      saveBooks(importedList);
    } else {
      saveBooks([...importedList, ...books]);
    }
  };

  const handleOpenIssueForBook = (book: Book) => {
    setInitialBookForIssue(book);
    setIsIssueModalOpen(true);
  };

  const handleOpenIssueForMember = (member: Member) => {
    setInitialMemberForIssue(member);
    setIsIssueModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9F4] text-[#2C332D] flex flex-col font-sans selection:bg-[#A8763E] selection:text-white">
      
      {/* App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickStock={() => setIsQuickStockOpen(true)}
        onOpenIssueModal={() => {
          setInitialBookForIssue(null);
          setInitialMemberForIssue(null);
          setIsIssueModalOpen(true);
        }}
        onOpenAddBookModal={() => setIsAddBookModalOpen(true)}
        onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            books={books}
            loans={loans}
            logs={logs}
            onNavigateTab={setActiveTab}
            onOpenIssueModal={() => {
              setInitialBookForIssue(null);
              setInitialMemberForIssue(null);
              setIsIssueModalOpen(true);
            }}
            onOpenQuickStock={() => setIsQuickStockOpen(true)}
            onSelectBookForIssue={handleOpenIssueForBook}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'loans' && (
          <CirculationView
            loans={loans}
            onIssueNewBook={() => {
              setInitialBookForIssue(null);
              setInitialMemberForIssue(null);
              setIsIssueModalOpen(true);
            }}
            onReturnBook={handleReturnBook}
            onExtendLoan={handleExtendLoan}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'books' && (
          <BooksView
            books={books}
            loans={loans}
            onOpenAddBookModal={() => setIsAddBookModalOpen(true)}
            onOpenBookImportModal={() => setIsExcelBookImportModalOpen(true)}
            onSelectBookForIssue={handleOpenIssueForBook}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            members={members}
            loans={loans}
            onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
            onOpenExcelImportModal={() => setIsExcelImportModalOpen(true)}
            onSelectMemberHistory={m => setSelectedMemberForHistory(m)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            stats={stats}
            books={books}
            members={members}
            loans={loans}
            onResetFactoryData={resetLibraryToFactoryDefault}
            onClearDatabase={clearDatabaseToEmpty}
            onOpenExcelImportModal={() => setIsExcelImportModalOpen(true)}
            onOpenExcelBookImportModal={() => setIsExcelBookImportModalOpen(true)}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <AdminPinModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <QuickStockModal
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
        books={books}
        onIssueBook={handleOpenIssueForBook}
        isAdmin={isAdmin}
      />

      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setInitialBookForIssue(null);
          setInitialMemberForIssue(null);
        }}
        books={books}
        members={members}
        onConfirmIssue={handleConfirmIssue}
        initialSelectedBook={initialBookForIssue}
        initialSelectedMember={initialMemberForIssue}
      />

      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onAddBook={handleAddBook}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAddMember={handleAddMember}
      />

      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        existingMembersCount={members.length}
        onImportMembers={handleImportMembers}
      />

      <ExcelBookImportModal
        isOpen={isExcelBookImportModalOpen}
        onClose={() => setIsExcelBookImportModalOpen(false)}
        existingBooksCount={books.length}
        onImportBooks={handleImportBooks}
      />

      <MemberHistoryModal
        member={selectedMemberForHistory}
        loans={loans}
        onClose={() => setSelectedMemberForHistory(null)}
        onReturnBook={handleReturnBook}
        onIssueToMember={handleOpenIssueForMember}
        isAdmin={isAdmin}
      />

      {/* Footer */}
      <footer className="bg-[#4A5D4E] text-[#D9E4DD] border-t border-[#3A4B3D] py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-white font-serif italic">ООУ „Илинден“ - Крива Паланка</span> • Софтверски систем за евиденција во училишната библиотека
          </div>
          <div className="text-[#D9E4DD]/70">
            © 2026 Сите права се задржани • За библиотекарот и училишната заедница
          </div>
        </div>
      </footer>

    </div>
  );
}
