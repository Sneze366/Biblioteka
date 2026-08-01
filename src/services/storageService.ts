import { Book, Member, Loan, ActivityLog, LibraryStats } from '../types';
import { generateInitialBooks, generateInitialMembers, generateInitialLoansAndActivity } from '../data/seedData';

const BOOKS_KEY = 'ilinden_library_books_v1';
const MEMBERS_KEY = 'ilinden_library_members_v1';
const LOANS_KEY = 'ilinden_library_loans_v1';
const LOGS_KEY = 'ilinden_library_logs_v1';

// Custom event name for instant cross-component update
export const LIBRARY_STORAGE_EVENT = 'ilinden_library_updated';

function notifyChange() {
  window.dispatchEvent(new Event(LIBRARY_STORAGE_EVENT));
}

// Initialize LocalStorage with seed data if not present
export function initializeStorageIfNeeded(): { books: Book[]; members: Member[]; loans: Loan[]; logs: ActivityLog[] } {
  const existingBooks = localStorage.getItem(BOOKS_KEY);
  const existingMembers = localStorage.getItem(MEMBERS_KEY);
  const existingLoans = localStorage.getItem(LOANS_KEY);
  const existingLogs = localStorage.getItem(LOGS_KEY);

  if (!existingBooks || !existingMembers || !existingLoans) {
    const books = generateInitialBooks();
    const members = generateInitialMembers();
    const { loans, logs } = generateInitialLoansAndActivity(books, members);

    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));

    return { books, members, loans, logs };
  }

  return {
    books: JSON.parse(existingBooks),
    members: JSON.parse(existingMembers),
    loans: JSON.parse(existingLoans),
    logs: existingLogs ? JSON.parse(existingLogs) : []
  };
}

export function getBooks(): Book[] {
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : initializeStorageIfNeeded().books;
}

export function saveBooks(books: Book[]) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  notifyChange();
}

export function getMembers(): Member[] {
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : initializeStorageIfNeeded().members;
}

export function saveMembers(members: Member[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  notifyChange();
}

export function getLoans(): Loan[] {
  const data = localStorage.getItem(LOANS_KEY);
  return data ? JSON.parse(data) : initializeStorageIfNeeded().loans;
}

export function saveLoans(loans: Loan[]) {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
  notifyChange();
}

export function getLogs(): ActivityLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function logActivity(type: ActivityLog['type'], title: string, details: string) {
  const logs = getLogs();
  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const newLog: ActivityLog = {
    id: `act-${Date.now()}`,
    timestamp: timeStr,
    type,
    title,
    details,
    user: "Библиотекар Снежана"
  };

  const updated = [newLog, ...logs.slice(0, 99)]; // Keep latest 100
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  notifyChange();
}

// Issue a book to a member
export function issueBook(bookId: string, memberId: string, dueDays: number = 14, notes?: string): { success: boolean; message: string } {
  const books = getBooks();
  const members = getMembers();
  const loans = getLoans();

  const bookIndex = books.findIndex(b => b.id === bookId);
  const member = members.find(m => m.id === memberId);

  if (bookIndex === -1) return { success: false, message: "Книгата не е пронајдена." };
  if (!member) return { success: false, message: "Членот не е пронајден." };

  const book = books[bookIndex];
  if (book.availableCopies <= 0) {
    return { success: false, message: `Книгата „${book.title}“ нема повеќе слободни примероци на залиха.` };
  }

  // Decrement book available copies
  book.availableCopies--;
  books[bookIndex] = book;

  // Create Loan Record
  const now = new Date();
  const issueDateStr = now.toISOString().split('T')[0];
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + dueDays);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const newLoan: Loan = {
    id: `pz-${Date.now()}`,
    loanNumber: `ПЗ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookShelf: book.shelfLocation,
    memberId: member.id,
    memberName: member.fullName,
    memberGrade: member.gradeClass,
    issueDate: issueDateStr,
    dueDate: dueDateStr,
    status: 'активна',
    issuedBy: "Библиотекар Снежана Златковска",
    notes
  };

  saveBooks(books);
  saveLoans([newLoan, ...loans]);
  logActivity('issue', 'Издадена книга', `„${book.title}“ од ${book.author} му е издадена на ${member.fullName} (${member.gradeClass}). Рок за враќање: ${dueDateStr}.`);

  return { success: true, message: `Успешно издадена книга „${book.title}“ на ${member.fullName}.` };
}

// Return a borrowed book
export function returnBook(loanId: string, notes?: string): { success: boolean; message: string } {
  const loans = getLoans();
  const books = getBooks();

  const loanIndex = loans.findIndex(l => l.id === loanId);
  if (loanIndex === -1) return { success: false, message: "Записот за позајмување не е пронајден." };

  const loan = loans[loanIndex];
  if (loan.status === 'вратена') return { success: false, message: "Книгата е веќе вратена." };

  const nowStr = new Date().toISOString().split('T')[0];
  loan.status = 'вратена';
  loan.returnDate = nowStr;
  if (notes) loan.notes = (loan.notes ? loan.notes + " | " : "") + notes;

  // Increase available copies in catalog
  const bookIndex = books.findIndex(b => b.id === loan.bookId);
  if (bookIndex !== -1) {
    books[bookIndex].availableCopies = Math.min(books[bookIndex].totalCopies, books[bookIndex].availableCopies + 1);
    saveBooks(books);
  }

  loans[loanIndex] = loan;
  saveLoans(loans);

  logActivity('return', 'Вратена книга', `„${loan.bookTitle}“ е успешно вратена од ${loan.memberName} (${loan.memberGrade}).`);

  return { success: true, message: `Книгата „${loan.bookTitle}“ е успешно раздолжена.` };
}

// Extend loan deadline (+14 days)
export function extendLoan(loanId: string): { success: boolean; message: string } {
  const loans = getLoans();
  const loanIndex = loans.findIndex(l => l.id === loanId);
  if (loanIndex === -1) return { success: false, message: "Записот не е пронајден." };

  const loan = loans[loanIndex];
  if (loan.status === 'вратена') return { success: false, message: "Книгата е веќе вратена." };

  const currentDue = new Date(loan.dueDate);
  currentDue.setDate(currentDue.getDate() + 14);
  const newDueDateStr = currentDue.toISOString().split('T')[0];

  loan.dueDate = newDueDateStr;
  loan.status = 'активна'; // reset status if was overdue
  loan.notes = (loan.notes ? loan.notes + " | " : "") + "Продолжен рок за 14 дена";

  loans[loanIndex] = loan;
  saveLoans(loans);

  logActivity('extend', 'Продолжен рок', `Рокот за „${loan.bookTitle}“ (член: ${loan.memberName}) е продолжен до ${newDueDateStr}.`);

  return { success: true, message: `Рокот е продолжен до ${newDueDateStr}.` };
}

// Calculate real-time library stats
export function getLibraryStats(): LibraryStats {
  const books = getBooks();
  const members = getMembers();
  const loans = getLoans();

  const totalTitles = books.length;
  let totalCopies = 0;
  let availableCopies = 0;

  books.forEach(b => {
    totalCopies += b.totalCopies;
    availableCopies += b.availableCopies;
  });

  const issuedCopies = totalCopies - availableCopies;
  const activeLoans = loans.filter(l => l.status === 'активна').length;
  const overdueLoans = loans.filter(l => l.status === 'задоцнета').length;
  const returnedCount = loans.filter(l => l.status === 'вратена').length;

  return {
    totalTitles,
    totalCopies,
    issuedCopies,
    availableCopies,
    totalMembers: members.length,
    activeLoans,
    overdueLoans,
    returnedCount
  };
}

// Reset data back to default factory seed
export function resetLibraryToFactoryDefault() {
  localStorage.removeItem(BOOKS_KEY);
  localStorage.removeItem(MEMBERS_KEY);
  localStorage.removeItem(LOANS_KEY);
  localStorage.removeItem(LOGS_KEY);
  initializeStorageIfNeeded();
  notifyChange();
}

// Clear database to empty state so librarian can enter their own real books and members
export function clearDatabaseToEmpty() {
  localStorage.setItem(BOOKS_KEY, JSON.stringify([]));
  localStorage.setItem(MEMBERS_KEY, JSON.stringify([]));
  localStorage.setItem(LOANS_KEY, JSON.stringify([]));
  localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  notifyChange();
}
