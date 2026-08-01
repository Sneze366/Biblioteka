import { Book, Member, Loan, ActivityLog, GenreType } from '../types';

// Famous core Macedonian and international literature for Primary School (ООУ)
const CORE_BOOKS: Array<{ title: string; author: string; genre: GenreType; copies: number; shelf: string; year: number; publisher: string; desc: string }> = [
  { title: "Зоки Поки", author: "Оливера Николова", genre: "Лектира I-III одд.", copies: 35, shelf: "А-1 Лектири", year: 1963, publisher: "Детска радост", desc: "Приказни за малиот Зоки Поки, неговите пријатели и авантури во маалото." },
  { title: "Белото циганче", author: "Видое Подгорец", genre: "Лектира IV-VI одд.", copies: 40, shelf: "Б-2 Лектири", year: 1966, publisher: "Просветно дело", desc: "Длабока трогателна приказна за Тарас, белото циганче кое расте во ромско семејство." },
  { title: "Големиот камен", author: "Петре М. Андреевски", genre: "Лектира VII-IX одд.", copies: 25, shelf: "В-1 Лектири", year: 1993, publisher: "Табернакул", desc: "Поетски и прозни класици од еден од најголемите македонски автори." },
  { title: "Пиреј", author: "Петре М. Андреевски", genre: "Македонска книжевност", copies: 30, shelf: "М-1 Македонски роман", year: 1980, publisher: "Мисла", desc: "Историски роман за страдањата на македонскиот народ за време на Првата светска војна." },
  { title: "Сердарот", author: "Григор Прличев", genre: "Лектира VII-IX одд.", copies: 20, shelf: "В-3 Лектири", year: 1860, publisher: "Култура", desc: "Поема за црногорскиот и македонскиот јунак Кузман Капидан." },
  { title: "Бели мугри", author: "Кочо Рацин", genre: "Поезија", copies: 25, shelf: "П-1 Поезија", year: 1939, publisher: "Самобор", desc: "Првата стихозбирка на современиот македонски јазик." },
  { title: "Во волшебното срце", author: "Видое Подгорец", genre: "Лектира IV-VI одд.", copies: 30, shelf: "Б-1 Лектири", year: 1978, publisher: "Детска радост", desc: "Прекрасна лектира за детските соништа и другарството." },
  { title: "Забелешките на Елизабета", author: "Оливера Николова", genre: "Лектира IV-VI одд.", copies: 25, shelf: "Б-3 Лектири", year: 1988, publisher: "Просветно дело", desc: "Приказни за ученичките денови и авантурите на Елизабета." },
  { title: "Улицата", author: "Славко Јаневски", genre: "Македонска книжевност", copies: 18, shelf: "М-2 Македонски роман", year: 1950, publisher: "Култура", desc: "Првата македонска повест за младоста и градот." },
  { title: "Девојките на Марко", author: "Оливера Николова", genre: "Лектира VII-IX одд.", copies: 22, shelf: "В-2 Лектири", year: 1987, publisher: "Детска радост", desc: "Роман за младешките симпатии, средношколски и основношколски предизвици." },
  { title: "Малиот принц", author: "Антоан де Сент Егзипери", genre: "Светска книжевност", copies: 45, shelf: "С-1 Светски класици", year: 1943, publisher: "Три", desc: "Филозофска бајка за пријателството, љубовта и одговорноста." },
  { title: "Том Соер", author: "Марк Твен", genre: "Светска книжевност", copies: 35, shelf: "С-2 Авантури", year: 1876, publisher: "Феникс", desc: "Авантурите на немирниот момче Том Соер крај реката Мисисипи." },
  { title: "Авантурите на Хеклбери Фин", author: "Марк Твен", genre: "Светска книжевност", copies: 28, shelf: "С-2 Авантури", year: 1884, publisher: "Феникс", desc: "Продолжението на авантурите на Хак и одбегнатиот Џим." },
  { title: "Хектор Сервадак", author: "Жил Верн", genre: "Светска книжевност", copies: 20, shelf: "С-3 Научна фантастика", year: 1877, publisher: "Култура", desc: "Патување низ сончевиот систем со комета." },
  { title: "20.000 милји под морето", author: "Жил Верн", genre: "Светска книжевност", copies: 25, shelf: "С-3 Научна фантастика", year: 1870, publisher: "Македонска книга", desc: "Капетан Немо и подморницата Наутилус во длабочините на океанот." },
  { title: "Алиса во земјата на чудата", author: "Луис Керол", genre: "Басни и Бајки", copies: 30, shelf: "А-2 Бајки", year: 1865, publisher: "Детска радост", desc: "Фантастична при приказна за Алиса и белиот зајак." },
  { title: "Робинзон Крусо", author: "Даниел Дефо", genre: "Светска книжевност", copies: 24, shelf: "С-2 Авантури", year: 1719, publisher: "Просветно дело", desc: "Приказна за преживувањето на осамен остров." },
  { title: "Дневникот на Ана Франк", author: "Ана Франк", genre: "Светска книжевност", copies: 30, shelf: "С-4 Историја", year: 1947, publisher: "Табернакул", desc: "Потресни дневнички записи од Втората светска војна." },
  { title: "Хари Потер и Каменот на мудроста", author: "Џ.К. Роулинг", genre: "Светска книжевност", copies: 40, shelf: "Ф-1 Фантастика", year: 1997, publisher: "Перун Арт", desc: "Првата книга за младиот волшебник Хари Потер во Хогвортс." },
  { title: "Пипи Долгата Чорапа", author: "Астрид Линдгрен", genre: "Лектира IV-VI одд.", copies: 32, shelf: "Б-4 Лектири", year: 1945, publisher: "Детска радост", desc: "Најсилното и највеселото девојче во светот." },
  { title: "Македонски народни приказни", author: "Марко Цепенков", genre: "Басни и Бајки", copies: 50, shelf: "Ф-2 Фолклор", year: 1890, publisher: "Македонска книга", desc: "Народно творештво собрано од незаборавниот Марко Цепенков." },
  { title: "Гоце Делчев", author: "Ванчо Николески", genre: "Лектира IV-VI одд.", copies: 20, shelf: "Б-5 Биографии", year: 1960, publisher: "Просветно дело", desc: "Биографска лектира за визионерот и револуционер Гоце Делчев." },
  { title: "Енциклопедија за деца: Вселена и Планети", author: "Оксфорд група", genre: "Енциклопедија и Наука", copies: 15, shelf: "Е-1 Наука", year: 2018, publisher: "Арс Ламина", desc: "Илустрирана енциклопедија за малите истражувачи." },
  { title: "Детска енциклопедија на животинскиот свет", author: "Д-р Роберт Смит", genre: "Енциклопедија и Наука", copies: 18, shelf: "Е-2 Природа", year: 2020, publisher: "Арс Ламина", desc: "Фашинантно патување низ фауната на Земјата." },
  { title: "Стрип колекција: Астерикс и Обеликс", author: "Рене Госини", genre: "Стрипови и Списанија", copies: 25, shelf: "КТ-1 Стрип", year: 2012, publisher: "Стрип квадрат", desc: "Смешните авантури на храбрите Гали против Римјаните." },
  { title: "Стрип колекција: Тинтин во Египет", author: "Ерже", genre: "Стрипови и Списанија", copies: 20, shelf: "КТ-2 Стрип", year: 2015, publisher: "Темплум", desc: "Репортерот Тинтин и кучето Милу во потрага по мистерии." },
  { title: "Чорбаџи Теодос", author: "Васил Иљоски", genre: "Драма", copies: 28, shelf: "Д-1 Драма", year: 1937, publisher: "Култура", desc: "Македонска класична комедија во четири чина." },
  { title: "Печалбари", author: "Антон Панов", genre: "Драма", copies: 30, shelf: "Д-1 Драма", year: 1936, publisher: "Просветно дело", desc: "Потресна драма за социјалниот живот и печалбарството." },
  { title: "Светлости и сенки", author: "Блаже Конески", genre: "Поезија", copies: 20, shelf: "П-2 Поезија", year: 1968, publisher: "Мисла", desc: "Антологиска поезија од кодификаторот на македонскиот јазик." },
  { title: "Итар Пејо", author: "Стале Попов", genre: "Басни и Бајки", copies: 35, shelf: "А-3 Хумор", year: 1955, publisher: "Детска радост", desc: "Итрините и досетките на познатиот македонски лик Итар Пејо." }
];

const SECONDARY_TITLE_TEMPLATES = [
  { prefix: "Македонски народни", suffix: ["Умотворби", "Песни", "Преданија", "Гатанки", "Пословици", "Бајки"] },
  { prefix: "Авантурите на", suffix: ["Малиот Истражувач", "Капетанот Марко", "Младиот Научник", "Софија во Вселената", "Витезот Мартин", "Детето од Крива Паланка"] },
  { prefix: "Лектира за", suffix: ["Прво одделение", "Второ одделение", "Трето одделение", "Четврто одделение", "Петто одделение", "Шесто одделение", "Седмо одделение", "Осмо одделение", "Деветто одделение"] },
  { prefix: "Голема Енциклопедија за", suffix: ["Природата", "Историјата на Македонија", "Космосот", "Диносаурусите", "Изумите и Технологијата", "Човечкото тело", "Географијата", "Океаните"] },
  { prefix: "Приказни од", suffix: ["Осоговските Планини", "Старата Чашија", "Шарениот Свод", "Бабината Шкриња", "Шумската Куќичка", "Кривопаланечкиот Крај"] }
];

const AUTHORS_LIST = [
  "Петре М. Андреевски", "Оливера Николова", "Видое Подгорец", "Блаже Конески", "Славко Јаневски",
  "Григор Прличев", "Кочо Рацин", "Ванчо Николески", "Васил Иљоски", "Антон Панов", "Стале Попов",
  "Марко Цепенков", "Живко Чинго", "Ташко Георгиевски", "Ѓорѓи Абаџиев", "Гане Тодоровски",
  "Матеја Матевски", "Ацо Шопов", "Славко Јаневски", "Божин Павловски", "Велко Неделковски",
  "Марк Твен", "Жил Верн", "Антоан де Сент Егзипери", "Џ.К. Роулинг", "Астрид Линдгрен",
  "Ханс Кристијан Андерсен", "Браќата Грим", "Роберт Луис Стивенсон", "Даниел Дефо", "Луис Керол"
];

const FIRST_NAMES_MALE = [
  "Марко", "Стефан", "Александар", "Давид", "Филип", "Никола", "Лука", "Петар", "Матеј", "Михаил",
  "Јован", "Виктор", "Дамјан", "Андреј", "Кристијан", "Илија", "Огнен", "Бојан", "Милош", "Ѓорѓи",
  "Тодор", "Васил", "Драган", "Зоран", "Горан", "Владимир", "Иван", "Сашо", "Мартин", "Дарко"
];

const FIRST_NAMES_FEMALE = [
  "Елена", "Ана", "Марија", "Сара", "Мила", "Јана", "Теодора", "Ева", "Анастасија", "Катерина",
  "Ивана", "Христина", "Софија", "Милена", "Тамара", "Снежана", "Викторија", "Ангела", "Биљана", "Даница",
  "Наталија", "Ирена", "Магдалена", "Ивана", "Кристина", "Моника", "Александра", "Николина", "Весна", "Јулија"
];

const LAST_NAMES = [
  "Стојановски", "Петровски", "Јовановски", "Николовски", "Ангеловски", "Илиевски", "Трајковски",
  "Костовски", "Цветковски", "Георгиевски", "Марковски", "Димитровски", "Стефановски", "Митевски",
  "Атанасовски", "Павловски", "Спасовски", "Милановски", "Златановски", "Пешевски", "Бошковски"
];

const GRADES = [
  "I-1", "I-2", "II-1", "II-2", "III-1", "III-2", "IV-1", "IV-2",
  "V-а", "V-б", "VI-а", "VI-б", "VII-а", "VII-б", "VIII-а", "VIII-б", "IX-а", "IX-б"
];

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

/**
 * Generate 800+ unique titles with average 6 copies each => ~5,000 physical total book copies!
 */
export function generateInitialBooks(): Book[] {
  const books: Book[] = [];

  // Add Core Books first
  CORE_BOOKS.forEach((item, index) => {
    books.push({
      id: `bk-${1000 + index}`,
      isbn: `978-9989-${100 + index}-${(index * 7) % 10}`,
      title: item.title,
      author: item.author,
      genre: item.genre,
      publisher: item.publisher,
      year: item.year,
      totalCopies: item.copies,
      availableCopies: item.copies, // will adjust when generating loans
      shelfLocation: item.shelf,
      language: "Македонски",
      description: item.desc,
      addedDate: "2025-09-01",
      coverBg: ["#1e3a8a", "#065f46", "#7c2d12", "#4c1d95", "#831843", "#134e4a"][index % 6]
    });
  });

  // Generate procedural catalog up to ~800 titles to reach ~5,000 physical copies
  let titleCount = books.length;
  let counter = 0;

  while (titleCount < 820) {
    const template = SECONDARY_TITLE_TEMPLATES[counter % SECONDARY_TITLE_TEMPLATES.length];
    const subIdx = Math.floor(counter / SECONDARY_TITLE_TEMPLATES.length) % template.suffix.length;
    const volNum = Math.floor(counter / (SECONDARY_TITLE_TEMPLATES.length * template.suffix.length)) + 1;
    
    const title = `${template.prefix} ${template.suffix[subIdx]} ${volNum > 1 ? `(Том ${volNum})` : ''}`.trim();
    const author = AUTHORS_LIST[counter % AUTHORS_LIST.length];
    const genre = GENRES[counter % GENRES.length];
    const copies = 4 + (counter % 9); // 4 to 12 copies
    const shelfSector = ["Рафт А", "Рафт Б", "Рафт В", "Сектор Лектири", "Сектор Наука", "Рефер. Збирка"][counter % 6];
    const shelfNum = (counter % 10) + 1;

    books.push({
      id: `bk-${2000 + counter}`,
      isbn: `978-9989-${200 + (counter % 700)}-${counter % 10}`,
      title: title,
      author: author,
      genre: genre,
      publisher: ["Просветно дело", "Детска радост", "Арс Ламина", "Три", "Култура", "Табернакул"][counter % 6],
      year: 2000 + (counter % 25),
      totalCopies: copies,
      availableCopies: copies,
      shelfLocation: `${shelfSector}-${shelfNum}`,
      language: "Македонски",
      description: `Училишно издание од фондот на Библиотеката на ООУ „Илинден“ Крива Паланка. Наменето за ученици од сите одделенија.`,
      addedDate: "2025-09-15",
      coverBg: ["#1e293b", "#334155", "#0f766e", "#15803d", "#b45309", "#6b21a8"][counter % 6]
    });

    titleCount++;
    counter++;
  }

  return books;
}

/**
 * Generate ~1,000 registered school members (Students from I-1 to IX-б and Staff)
 */
export function generateInitialMembers(): Member[] {
  const members: Member[] = [];

  // Add staff members first
  const STAFF = [
    { name: "Снежана Златковска", grade: "Библиотекар / Наставник", type: 'персонал' as const },
    { name: "Милан Стојановски", grade: "Директор", type: 'персонал' as const },
    { name: "Марија Спасовска", grade: "Наставник по Македонски јазик", type: 'наставник' as const },
    { name: "Зоран Цветковски", grade: "Наставник по Историја", type: 'наставник' as const },
    { name: "Катерина Јовановска", grade: "Наставник по Математика", type: 'наставник' as const },
    { name: "Горан Николовски", grade: "Наставник по Географија", type: 'наставник' as const },
    { name: "Елена Трајковска", grade: "Одделенски наставник I-1", type: 'наставник' as const },
    { name: "Игор Бошковски", grade: "Одделенски наставник III-2", type: 'наставник' as const },
  ];

  STAFF.forEach((s, idx) => {
    members.push({
      id: `mem-${100 + idx}`,
      memberNumber: `ИЛ-2026-${String(idx + 1).padStart(4, '0')}`,
      fullName: s.name,
      type: s.type,
      gradeClass: s.grade,
      phone: `078 ${300 + idx}-${100 + idx}`,
      email: `${s.name.split(' ')[0].toLowerCase()}@oouilinden-kp.edu.mk`,
      registrationDate: "2024-09-01",
      active: true,
      notes: "Наставен кадар"
    });
  });

  // Generate ~1000 student members across grades I-1 to IX-b
  let studentCount = members.length;
  let idx = 1;

  while (studentCount < 1005) {
    const isMale = idx % 2 === 0;
    const firstName = isMale ? FIRST_NAMES_MALE[idx % FIRST_NAMES_MALE.length] : FIRST_NAMES_FEMALE[idx % FIRST_NAMES_FEMALE.length];
    const lastNameBase = LAST_NAMES[idx % LAST_NAMES.length];
    const lastName = isMale ? lastNameBase : (lastNameBase.endsWith("ски") ? lastNameBase.slice(0, -2) + "ска" : lastNameBase);
    const fullName = `${firstName} ${lastName}`;
    const grade = GRADES[idx % GRADES.length];
    const memberNum = `ИЛ-2026-${String(studentCount + 1).padStart(4, '0')}`;

    members.push({
      id: `mem-${1000 + idx}`,
      memberNumber: memberNum,
      fullName: fullName,
      type: 'ученик',
      gradeClass: grade,
      phone: `07${(idx % 3) + 0} ${200 + (idx % 700)}-${100 + (idx % 800)}`,
      email: `učenik.${idx}@oouilinden-kp.edu.mk`,
      registrationDate: `2025-09-${String((idx % 25) + 1).padStart(2, '0')}`,
      active: true,
      notes: `Ученик во ООУ „Илинден“ Крива Паланка (${grade})`
    });

    studentCount++;
    idx++;
  }

  return members;
}

/**
 * Generate initial active and completed loan records + activity history
 */
export function generateInitialLoansAndActivity(books: Book[], members: Member[]): { loans: Loan[]; logs: ActivityLog[] } {
  const loans: Loan[] = [];
  const logs: ActivityLog[] = [];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper date utility
  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  // Create ~150 historical loan entries (mixture of active, returned, overdue)
  for (let i = 0; i < 160; i++) {
    const member = members[i % members.length];
    const book = books[i % books.length];

    // Determine loan dates
    const daysAgo = (i * 3) % 45 + 1;
    const issueDate = addDays(today, -daysAgo);
    const dueDate = addDays(new Date(issueDate), 14);

    let status: 'активна' | 'вратена' | 'задоцнета' = 'активна';
    let returnDate: string | undefined = undefined;

    if (i % 3 === 0) {
      // Returned
      status = 'вратена';
      returnDate = addDays(new Date(issueDate), (i % 10) + 2);
    } else if (new Date(dueDate) < today) {
      // Overdue
      status = 'задоцнета';
      // Decrement available copies if still active loan
      if (book.availableCopies > 0) {
        book.availableCopies--;
      }
    } else {
      // Active
      status = 'активна';
      if (book.availableCopies > 0) {
        book.availableCopies--;
      }
    }

    const loanId = `pz-${1000 + i}`;
    const loanNum = `ПЗ-2026-${String(i + 101).padStart(4, '0')}`;

    loans.push({
      id: loanId,
      loanNumber: loanNum,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookShelf: book.shelfLocation,
      memberId: member.id,
      memberName: member.fullName,
      memberGrade: member.gradeClass,
      issueDate: issueDate,
      dueDate: dueDate,
      returnDate: returnDate,
      status: status,
      issuedBy: "Библиотекар Снежана Златковска",
      notes: status === 'задоцнета' ? 'Испратена опомена за враќање' : undefined
    });
  }

  // Create Initial Activity Logs
  logs.push(
    {
      id: "act-101",
      timestamp: `${todayStr} 08:30`,
      type: "system",
      title: "Системот е стартуван",
      details: "Систем за библиотека во ООУ „Илинден“ Крива Паланка е успешно вчитан со целосна база.",
      user: "Библиотекар"
    },
    {
      id: "act-102",
      timestamp: `${todayStr} 09:15`,
      type: "issue",
      title: "Издадена книга",
      details: `„Белото циганче“ е позајмена на ученикот Марко Стојановски (VII-б).`,
      user: "Библиотекар"
    },
    {
      id: "act-103",
      timestamp: `${todayStr} 10:40`,
      type: "return",
      title: "Вратена книга",
      details: `„Зоки Поки“ е успешно вратена од Елена Петровска (III-а) во одлична состојба.`,
      user: "Библиотекар"
    },
    {
      id: "act-104",
      timestamp: `${todayStr} 11:20`,
      type: "add_member",
      title: "Регистриран нов член",
      details: "Нов ученик Давид Трајковски е упишан во библиотеката со ID ИЛ-2026-1002.",
      user: "Библиотекар"
    }
  );

  return { loans, logs };
}
