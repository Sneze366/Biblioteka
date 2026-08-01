export type GenreType = 
  | 'Лектира I-III одд.'
  | 'Лектира IV-VI одд.'
  | 'Лектира VII-IX одд.'
  | 'Македонска книжевност'
  | 'Светска книжевност'
  | 'Поезија'
  | 'Енциклопедија и Наука'
  | 'Стрипови и Списанија'
  | 'Драма'
  | 'Басни и Бајки'
  | 'Друго';

export type MemberType = 'ученик' | 'наставник' | 'персонал';

export type LoanStatus = 'активна' | 'вратена' | 'задоцнета';

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: GenreType;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string; // e.g. "А-1", "Рафт 3 (Лектири)", "Б-2"
  language: string;
  description?: string;
  addedDate: string;
  coverBg?: string; // hex color or gradient string for fallback cover badge
}

export interface Member {
  id: string;
  memberNumber: string; // e.g. "ИЛ-2026-0042"
  fullName: string;
  type: MemberType;
  gradeClass: string; // e.g. "VI-а", "VII-б", "I-1", "Наставник"
  phone: string;
  email: string;
  registrationDate: string;
  active: boolean;
  notes?: string;
}

export interface Loan {
  id: string;
  loanNumber: string; // e.g. "ПЗ-2026-1089"
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookShelf: string;
  memberId: string;
  memberName: string;
  memberGrade: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  status: LoanStatus;
  issuedBy: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO or readable
  type: 'issue' | 'return' | 'extend' | 'add_book' | 'add_member' | 'delete_book' | 'update_book' | 'delete_member' | 'update_member' | 'system';
  title: string;
  details: string;
  user?: string;
}

export interface LibraryStats {
  totalTitles: number;
  totalCopies: number;
  issuedCopies: number;
  availableCopies: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  returnedCount: number;
}
