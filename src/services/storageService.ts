import { Book, Member, Loan, ActivityLog, LibraryStats, LoanStatus } from '../types';
import { generateInitialBooks, generateInitialMembers, generateInitialLoansAndActivity } from '../data/seedData';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, setDoc, onSnapshot } from 'firebase/firestore';

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

// Real-time Firestore subscription for 'books' collection
export function subscribeToBooks(onBooksUpdate: (books: Book[]) => void) {
  try {
    const booksCollection = collection(db, "books");
    const unsubscribe = onSnapshot(booksCollection, (snapshot) => {
      const firestoreBooks: Book[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          author: data.author || '',
          genre: data.genre || 'Друго',
          publisher: data.publisher || '',
          year: Number(data.year) || new Date().getFullYear(),
          totalCopies: Number(data.totalCopies) || 1,
          availableCopies: data.availableCopies !== undefined ? Number(data.availableCopies) : (Number(data.totalCopies) || 1),
          shelfLocation: data.shelfLocation || '',
          isbn: data.isbn || '',
          language: data.language || 'Македонски',
          addedDate: data.addedDate || new Date().toISOString().split('T')[0],
          coverUrl: data.coverUrl || undefined,
          coverBg: data.coverBg || undefined,
          description: data.description || ''
        };
      });

      // Combine with local books if any local books are not in Firestore
      const localData = localStorage.getItem(BOOKS_KEY);
      const localBooks: Book[] = localData ? JSON.parse(localData) : [];
      const firestoreIds = new Set(firestoreBooks.map(b => b.id));
      const mergedBooks = [
        ...firestoreBooks,
        ...localBooks.filter(b => !firestoreIds.has(b.id))
      ];

      mergedBooks.sort((a, b) => a.title.localeCompare(b.title, 'mk'));

      localStorage.setItem(BOOKS_KEY, JSON.stringify(mergedBooks));
      notifyChange();
      onBooksUpdate(mergedBooks);
    }, (error) => {
      console.error("Грешка при преземање на 'books' во реално време од Firestore:", error);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Грешка при поврзување со Firestore books:", err);
    return () => {};
  }
}

// Real-time Firestore subscription for 'members' collection
export function subscribeToMembers(onMembersUpdate: (members: Member[]) => void) {
  try {
    const membersCollection = collection(db, "members");
    const unsubscribe = onSnapshot(membersCollection, (snapshot) => {
      const firestoreMembers: Member[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          memberNumber: data.memberNumber || `ИЛ-2026-${docSnap.id.substring(0, 4)}`,
          fullName: data.fullName || '',
          gradeClass: data.gradeClass || '',
          type: data.type || 'ученик',
          phone: data.phone || '',
          email: data.email || '',
          registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
          active: data.active !== undefined ? data.active : true,
          notes: data.notes || ''
        };
      });

      const localData = localStorage.getItem(MEMBERS_KEY);
      const localMembers: Member[] = localData ? JSON.parse(localData) : [];
      const firestoreIds = new Set(firestoreMembers.map(m => m.id));
      const mergedMembers = [
        ...firestoreMembers,
        ...localMembers.filter(m => !firestoreIds.has(m.id))
      ];

      mergedMembers.sort((a, b) => a.fullName.localeCompare(b.fullName, 'mk'));

      localStorage.setItem(MEMBERS_KEY, JSON.stringify(mergedMembers));
      notifyChange();
      onMembersUpdate(mergedMembers);
    }, (error) => {
      console.error("Грешка при преземање на 'members' во реално време од Firestore:", error);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Грешка при поврзување со Firestore members:", err);
    return () => {};
  }
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

  // Update Firestore book availableCopies if doc exists
  try {
    const bookRef = doc(db, "books", book.id);
    await updateDoc(bookRef, { availableCopies: book.availableCopies });
  } catch (err) {
    // Silent catch if book is local only
  }

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
      try {
        const bookRef = doc(db, "books", books[bookIndex].id);
        await updateDoc(bookRef, { availableCopies: books[bookIndex].availableCopies });
      } catch (err) {
        // Silent catch
      }
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

// Delete book (Firestore + local)
export async function deleteBook(bookId: string): Promise<{ success: boolean; message: string }> {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  const bookTitle = book ? book.title : 'книга';

  try {
    const bookRef = doc(db, "books", bookId);
    await deleteDoc(bookRef);
  } catch (err) {
    console.warn("Грешка при бришење од Firestore (books):", err);
  }

  const updated = books.filter(b => b.id !== bookId);
  saveBooks(updated);
  logActivity('delete_book', 'Избришана книга', `Книгата „${bookTitle}“ е отстранета од базата.`);

  return { success: true, message: `Книгата „${bookTitle}“ е успешно избришана.` };
}

// Update book (Firestore + local)
export async function updateBook(updatedBook: Book): Promise<{ success: boolean; message: string }> {
  const books = getBooks();
  const index = books.findIndex(b => b.id === updatedBook.id);

  try {
    const bookRef = doc(db, "books", updatedBook.id);
    await setDoc(bookRef, {
      title: updatedBook.title,
      author: updatedBook.author,
      genre: updatedBook.genre,
      publisher: updatedBook.publisher,
      year: updatedBook.year,
      totalCopies: updatedBook.totalCopies,
      availableCopies: updatedBook.availableCopies,
      shelfLocation: updatedBook.shelfLocation,
      isbn: updatedBook.isbn,
      language: updatedBook.language,
      description: updatedBook.description,
      addedDate: updatedBook.addedDate || new Date().toISOString().split('T')[0]
    }, { merge: true });
  } catch (err) {
    console.warn("Грешка при ажурирање во Firestore (books):", err);
  }

  if (index !== -1) {
    books[index] = updatedBook;
  } else {
    books.push(updatedBook);
  }
  saveBooks(books);
  logActivity('update_book', 'Уредена книга', `Податоците за книгата „${updatedBook.title}“ (рафт: ${updatedBook.shelfLocation}, примероци: ${updatedBook.availableCopies}/${updatedBook.totalCopies}) се успешно изменети.`);

  return { success: true, message: `Книгата „${updatedBook.title}“ е успешно уредена.` };
}

// Delete member (Firestore + local)
export async function deleteMember(memberId: string): Promise<{ success: boolean; message: string }> {
  const members = getMembers();
  const member = members.find(m => m.id === memberId);
  const memberName = member ? member.fullName : 'член';

  try {
    const memberRef = doc(db, "members", memberId);
    await deleteDoc(memberRef);
  } catch (err) {
    console.warn("Грешка при бришење од Firestore (members):", err);
  }

  const updated = members.filter(m => m.id !== memberId);
  saveMembers(updated);
  logActivity('delete_member', 'Избришан член', `Членот „${memberName}“ е отстранет од базата.`);

  return { success: true, message: `Членот „${memberName}“ е успешно избришан.` };
}

// Update member (Firestore + local)
export async function updateMember(updatedMember: Member): Promise<{ success: boolean; message: string }> {
  const members = getMembers();
  const index = members.findIndex(m => m.id === updatedMember.id);

  try {
    const memberRef = doc(db, "members", updatedMember.id);
    await setDoc(memberRef, {
      fullName: updatedMember.fullName,
      gradeClass: updatedMember.gradeClass,
      type: updatedMember.type,
      phone: updatedMember.phone,
      email: updatedMember.email,
      notes: updatedMember.notes,
      active: updatedMember.active,
      memberNumber: updatedMember.memberNumber,
      registrationDate: updatedMember.registrationDate
    }, { merge: true });
  } catch (err) {
    console.warn("Грешка при ажурирање во Firestore (members):", err);
  }

  if (index !== -1) {
    members[index] = updatedMember;
  } else {
    members.push(updatedMember);
  }
  saveMembers(members);
  logActivity('update_member', 'Уреден член', `Податоците за членот „${updatedMember.fullName}“ се изменети.`);

  return { success: true, message: `Членот „${updatedMember.fullName}“ е успешно уреден.` };
}
