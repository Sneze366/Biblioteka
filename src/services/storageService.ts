import { Book, Member, Loan, ActivityLog, LibraryStats, LoanStatus } from '../types';
import { generateInitialBooks, generateInitialMembers, generateInitialLoansAndActivity } from '../data/seedData';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';

const BOOKS_KEY = 'ilinden_library_books_v1';
const MEMBERS_KEY = 'ilinden_library_members_v1';
const LOANS_KEY = 'ilinden_library_loans_v1';
const LOGS_KEY = 'ilinden_library_logs_v1';
const INITIALIZED_KEY = 'ilinden_library_initialized_v2';

// Custom event name for instant cross-component update
export const LIBRARY_STORAGE_EVENT = 'ilinden_library_updated';

function notifyChange() {
  window.dispatchEvent(new Event(LIBRARY_STORAGE_EVENT));
}

// Real-time Firestore subscription for 'loans' collection
export function subscribeToLoans(onLoansUpdate: (loans: Loan[]) => void) {
  try {
    const loansCollection = collection(db, "loans");
    const unsubscribe = onSnapshot(loansCollection, (snapshot) => {
      const firestoreLoans: Loan[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let status = data.status || 'активна';
        const todayStr = new Date().toISOString().split('T')[0];
        if (status === 'активна' && data.dueDate && data.dueDate < todayStr) {
          status = 'задоцнета';
        }
        return {
          id: docSnap.id,
          loanNumber: data.loanNumber || `ПЗ-2026-${docSnap.id.substring(0, 4)}`,
          bookId: data.bookId || '',
          bookTitle: data.bookTitle || '',
          bookAuthor: data.bookAuthor || '',
          bookShelf: data.bookShelf || '',
          memberId: data.memberId || '',
          memberName: data.memberName || '',
          memberGrade: data.memberGrade || '',
          issueDate: data.issueDate || todayStr,
          dueDate: data.dueDate || todayStr,
          returnDate: data.returnDate || undefined,
          status: status as LoanStatus,
          issuedBy: data.issuedBy || 'Библиотекар Снежана Златковска',
          notes: data.notes || ''
        };
      });

      // Sort newest issue date first
      firestoreLoans.sort((a, b) => (b.issueDate > a.issueDate ? 1 : -1));

      // Sync local storage cache
      localStorage.setItem(LOANS_KEY, JSON.stringify(firestoreLoans));
      notifyChange();
      onLoansUpdate(firestoreLoans);
    }, (error) => {
      console.error("Грешка при преземање на 'loans' во реално време од Firestore:", error);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Грешка при поврзување со Firestore loans:", err);
    return () => {};
  }
}

// Initialize LocalStorage with empty database by default so user can enter real books
export function initializeStorageIfNeeded(): { books: Book[]; members: Member[]; loans: Loan[]; logs: ActivityLog[] } {
  const isInitialized = localStorage.getItem(INITIALIZED_KEY);

  if (!isInitialized) {
    const books: Book[] = [];
    const members: Member[] = [];
    const loans: Loan[] = [];
    const logs: ActivityLog[] = [];

    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    localStorage.setItem(INITIALIZED_KEY, 'true');

    return { books, members, loans, logs };
  }

  const existingBooks = localStorage.getItem(BOOKS_KEY);
  const existingMembers = localStorage.getItem(MEMBERS_KEY);
  const existingLoans = localStorage.getItem(LOANS_KEY);
  const existingLogs = localStorage.getItem(LOGS_KEY);

  return {
    books: existingBooks ? JSON.parse(existingBooks) : [],
    members: existingMembers ? JSON.parse(existingMembers) : [],
    loans: existingLoans ? JSON.parse(existingLoans) : [],
    logs: existingLogs ? JSON.parse(existingLogs) : []
  };
}

export function getBooks(): Book[] {
  initializeStorageIfNeeded();
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBooks(books: Book[]) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  localStorage.setItem(INITIALIZED_KEY, 'true');
  notifyChange();
}

export function getMembers(): Member[] {
  initializeStorageIfNeeded();
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMembers(members: Member[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  localStorage.setItem(INITIALIZED_KEY, 'true');
  notifyChange();
}

export function getLoans(): Loan[] {
  initializeStorageIfNeeded();
  const data = localStorage.getItem(LOANS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLoans(loans: Loan[]) {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
  localStorage.setItem(INITIALIZED_KEY, 'true');
  notifyChange();
}

export function getLogs(): ActivityLog[] {
  initializeStorageIfNeeded();
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

// Issue a book to a member (Saves to Firestore 'loans' collection)
export async function issueBook(bookId: string, memberId: string, dueDays: number = 14, notes?: string): Promise<{ success: boolean; message: string }> {
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
  const loanNumber = `ПЗ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const loanData = {
    loanNumber,
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookShelf: book.shelfLocation,
    memberId: member.id,
    memberName: member.fullName,
    memberGrade: member.gradeClass,
    issueDate: issueDateStr,
    dueDate: dueDateStr,
    status: 'активна' as LoanStatus,
    issuedBy: "Библиотекар Снежана Златковска",
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  let firestoreDocId = `pz-${Date.now()}`;
  try {
    const docRef = await addDoc(collection(db, "loans"), loanData);
    firestoreDocId = docRef.id;
  } catch (err) {
    console.error("Грешка при запишување на позајмувањето во Firestore:", err);
  }

  const newLoan: Loan = {
    id: firestoreDocId,
    ...loanData
  };

  saveBooks(books);
  saveLoans([newLoan, ...loans.filter(l => l.id !== firestoreDocId)]);
  logActivity('issue', 'Издадена книга', `„${book.title}“ од ${book.author} му е издадена на ${member.fullName} (${member.gradeClass}). Рок за враќање: ${dueDateStr}.`);

  return { success: true, message: `Успешно издадена книга „${book.title}“ на ${member.fullName}.` };
}

// Return a borrowed book
export async function returnBook(loanId: string, notes?: string): Promise<{ success: boolean; message: string }> {
  const loans = getLoans();
  const books = getBooks();
  const nowStr = new Date().toISOString().split('T')[0];

  // Update Firestore loan doc
  try {
    const loanRef = doc(db, "loans", loanId);
    await updateDoc(loanRef, {
      status: 'вратена',
      returnDate: nowStr,
      ...(notes ? { notes } : {})
    });
  } catch (err) {
    console.warn("Грешка при ажурирање на позајмувањето во Firestore:", err);
  }

  const loanIndex = loans.findIndex(l => l.id === loanId);
  if (loanIndex !== -1) {
    const loan = loans[loanIndex];
    loan.status = 'вратена';
    loan.returnDate = nowStr;
    if (notes) loan.notes = (loan.notes ? loan.notes + " | " : "") + notes;

    const bookIndex = books.findIndex(b => b.id === loan.bookId);
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies = Math.min(books[bookIndex].totalCopies, books[bookIndex].availableCopies + 1);
      saveBooks(books);
    }

    loans[loanIndex] = loan;
    saveLoans(loans);
    logActivity('return', 'Вратена книга', `„${loan.bookTitle}“ е успешно вратена од ${loan.memberName} (${loan.memberGrade}).`);
  }

  return { success: true, message: `Книгата е успешно раздолжена.` };
}

// Extend loan deadline (+14 days)
export async function extendLoan(loanId: string): Promise<{ success: boolean; message: string }> {
  const loans = getLoans();
  const loanIndex = loans.findIndex(l => l.id === loanId);
  
  let newDueDateStr = '';
  if (loanIndex !== -1) {
    const loan = loans[loanIndex];
    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);
    newDueDateStr = currentDue.toISOString().split('T')[0];
  } else {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    newDueDateStr = d.toISOString().split('T')[0];
  }

  try {
    const loanRef = doc(db, "loans", loanId);
    await updateDoc(loanRef, {
      dueDate: newDueDateStr,
      status: 'активна'
    });
  } catch (err) {
    console.warn("Грешка при продолжување на рокот во Firestore:", err);
  }

  if (loanIndex !== -1) {
    const loan = loans[loanIndex];
    loan.dueDate = newDueDateStr;
    loan.status = 'активна';
    loans[loanIndex] = loan;
    saveLoans(loans);
    logActivity('extend', 'Продолжен рок', `Рокот за „${loan.bookTitle}“ (член: ${loan.memberName}) е продолжен до ${newDueDateStr}.`);
  }

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
  localStorage.removeItem(INITIALIZED_KEY);
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
  localStorage.setItem(INITIALIZED_KEY, 'true');
  notifyChange();
}
