"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  MONTH_NAMES,
  EN_MONTH_NAMES,
  DAY_NAMES,
  EN_DAY_NAMES,
  getInitials,
  calcAge,
  formatDate,
  formatFullDate,
  getDaysUntil,
  filterByDate,
  getUpcoming,
  getUniqueCount,
  getAverageAge,
  getMonthCounts,
  getMonthCount,
  searchPeople,
  deduplicate,
  BIRTHDAY_DATA,
  Person,
} from "@/lib/data";

const t = {
  id: {
    birthdayBoard: "Birthday Board",
    batch: "Batch 2026",
    happyBirthday: "Selamat Ulang Tahun",
    noBirthdayToday: "Tidak ada ulang tahun hari ini",
    upcomingBirthdays: "Ulang tahun terdekat:",
    tabs: { today: "Hari Ini", yesterday: "Kemarin", tomorrow: "Besok", upcoming: "Mendatang" },
    noDataTab: "Tidak ada data untuk ditampilkan",
    totalFriends: "Total Teman",
    thisMonth: "Bulan Ini",
    avgAge: "Rata-rata Umur",
    calendar: "Kalender Ulang Tahun",
    resetFilter: "Reset Filter",
    people: "orang",
    searchPlaceholder: "Cari nama atau jurusan...",
    noSearch: "Tidak ditemukan hasil untuk",
    footerDept: "Information Systems & Technology",
    modal: { dob: "Tanggal Lahir", age: "Umur", major: "Jurusan", bday: "Ulang Tahun", pref: "Preferensi Perayaan", today: "Hari ini", daysLeft: "hari lagi", years: "tahun" },
    card: { yrs: "th" }
  },
  en: {
    birthdayBoard: "Birthday Board",
    batch: "Batch 2026",
    happyBirthday: "Happy Birthday",
    noBirthdayToday: "No birthdays today",
    upcomingBirthdays: "Upcoming birthdays:",
    tabs: { today: "Today", yesterday: "Yesterday", tomorrow: "Tomorrow", upcoming: "Upcoming" },
    noDataTab: "No data to display",
    totalFriends: "Total Friends",
    thisMonth: "This Month",
    avgAge: "Average Age",
    calendar: "Birthday Calendar",
    resetFilter: "Reset Filter",
    people: "people",
    searchPlaceholder: "Search name or major...",
    noSearch: "No results found for",
    footerDept: "Information Systems & Technology",
    modal: { dob: "Date of Birth", age: "Age", major: "Major", bday: "Birthday", pref: "Celebration Preferences", today: "Today", daysLeft: "days left", years: "years" },
    card: { yrs: "yrs" }
  }
};

function PersonCard({ person, onClick, lang }: { person: Person; onClick: (p: Person) => void; lang: "id" | "en" }) {
  const age = calcAge(person.year, person.month, person.day);
  const majorText = person.major || "-";
  const dict = t[lang];

  return (
    <div
      onClick={() => onClick(person)}
      className="group cursor-pointer rounded-xl bg-[var(--card)] p-6 shadow-sm border border-[var(--border)] transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] font-medium tracking-wider">
          {getInitials(person.name)}
        </div>
        <div>
          <div className="font-serif text-lg font-medium leading-tight">
            {person.name}
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {person.nick}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(person.day, person.month, lang)}
        </div>
        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {age} {dict.card.yrs}
        </div>
        <div className="mt-2 w-full">
          <span className="inline-flex items-center rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
            {majorText}
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ person, onClick, lang }: { person: Person; onClick: (p: Person) => void; lang: "id" | "en" }) {
  const age = calcAge(person.year, person.month, person.day);
  const majorText = person.major || "-";
  const dict = t[lang];

  return (
    <div
      onClick={() => onClick(person)}
      className="cursor-pointer group flex flex-col items-center p-6 text-center transition-transform duration-300 hover:scale-105"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--foreground)] text-2xl font-serif text-[var(--background)] ring-4 ring-[var(--background)] ring-offset-2 ring-offset-[var(--muted)]">
        {getInitials(person.name)}
      </div>
      <h3 className="font-serif text-xl font-medium mb-1">{person.name}</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-3">{person.nick}</p>
      <div className="flex items-center justify-center gap-3 text-sm font-medium">
        <span>{age} {dict.modal.years}</span>
        <span className="h-1 w-1 rounded-full bg-[var(--border)]"></span>
        <span className="text-[var(--muted-foreground)]">{majorText}</span>
      </div>
    </div>
  );
}

function Modal({ person, onClose, lang }: { person: Person; onClose: () => void; lang: "id" | "en" }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dict = t[lang];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!person) return null;

  const age = calcAge(person.year, person.month, person.day);
  const majorText = person.major || "-";
  const daysUntil = getDaysUntil(person.day, person.month);
  const daysText = daysUntil === 0 ? dict.modal.today : `${daysUntil} ${dict.modal.daysLeft}`;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--card)] text-left shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--foreground)] text-2xl font-serif text-[var(--background)]">
              {getInitials(person.name)}
            </div>
            <h2 className="font-serif text-2xl font-medium">{person.name}</h2>
            <p className="text-[var(--muted-foreground)]">{person.nick}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--muted-foreground)] text-sm">{dict.modal.dob}</span>
              <span className="font-medium text-right">{formatFullDate(person.day, person.month, person.year, lang)}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--muted-foreground)] text-sm">{dict.modal.age}</span>
              <span className="font-medium text-right">{age} {dict.modal.years}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--muted-foreground)] text-sm">{dict.modal.major}</span>
              <span className="font-medium text-right">{majorText}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--muted-foreground)] text-sm">{dict.modal.bday}</span>
              <span className="font-medium text-right">{daysText}</span>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-[var(--muted)] p-5">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {dict.modal.pref}
            </h4>
            <p className="text-sm italic leading-relaxed text-[var(--foreground)]">
              "{person.pref}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("today");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [now] = useState(() => new Date());

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  const dict = t[lang];
  const monthsArr = lang === "id" ? MONTH_NAMES : EN_MONTH_NAMES;
  const daysArr = lang === "id" ? DAY_NAMES : EN_DAY_NAMES;

  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();

  const todayPeople = filterByDate(todayDay, todayMonth);
  const monthCounts = getMonthCounts();

  const getTabPeople = useCallback(() => {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    switch (activeTab) {
      case "today":
        return filterByDate(todayDay, todayMonth);
      case "yesterday":
        return filterByDate(yesterday.getDate(), yesterday.getMonth() + 1);
      case "tomorrow":
        return filterByDate(
          tomorrowDate.getDate(),
          tomorrowDate.getMonth() + 1
        );
      case "upcoming":
        return getUpcoming(20, now);
      default:
        return [];
    }
  }, [activeTab, todayDay, todayMonth, now]);

  const [tabPeople, setTabPeople] = useState<Person[]>([]);
  const [monthFilterActive, setMonthFilterActive] = useState<number | null>(null);

  useEffect(() => {
    if (monthFilterActive !== null) return;
    setTabPeople(getTabPeople());
  }, [activeTab, getTabPeople, monthFilterActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchResults(searchPeople(searchQuery));
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleMonthClick(month: number) {
    setMonthFilterActive(month);
    setActiveTab("");
    const people = deduplicate(
      BIRTHDAY_DATA.filter((p) => p.month === month)
    ).sort((a, b) => a.day - b.day);
    setTabPeople(people);

    document.getElementById("cardGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleTabClick(tab: string) {
    setMonthFilterActive(null);
    setActiveTab(tab);
  }

  const upcomingPreview = todayPeople.length === 0 ? getUpcoming(3) : [];
  const headerDateStr = `${daysArr[now.getDay()]}, ${formatDate(todayDay, todayMonth, lang)} ${todayYear}`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--accent)] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://president.bilinedev.com/uploads/1254eb96654d9be3d4b2622decc78518.svg" 
              alt="President University" 
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="font-serif font-medium leading-none tracking-tight">{dict.birthdayBoard}</h1>
              <p className="text-xs text-white/80 mt-1">{dict.batch}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden text-sm font-medium tracking-wide text-white/90 md:block">
              {headerDateStr}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setLang(lang === "id" ? "en" : "id")}
                className="flex h-8 items-center rounded-full bg-white/20 p-1 text-xs font-medium uppercase tracking-wider shadow-inner"
              >
                <span className={`flex h-full items-center justify-center rounded-full px-3 transition-colors ${lang === "id" ? "bg-white text-[var(--accent)] shadow-sm" : "text-white/70 hover:text-white"}`}>
                  ID
                </span>
                <span className={`flex h-full items-center justify-center rounded-full px-3 transition-colors ${lang === "en" ? "bg-white text-[var(--accent)] shadow-sm" : "text-white/70 hover:text-white"}`}>
                  EN
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-8">
        {activeTab === "today" && monthFilterActive === null && (
          <section className="mb-16 overflow-hidden rounded-3xl bg-[var(--muted)] px-6 py-16 text-center sm:px-12">
            {todayPeople.length > 0 ? (
              <>
                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  {formatDate(todayDay, todayMonth, lang)} {todayYear}
                </p>
                <h2 className="mb-12 font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[var(--accent)]">
                  {dict.happyBirthday}
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                  {todayPeople.map((p, i) => (
                    <HeroCard key={i} person={p} onClick={setSelectedPerson} lang={lang} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                  {headerDateStr}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[var(--accent)]">
                  {dict.noBirthdayToday}
                </h2>
                {upcomingPreview.length > 0 && (
                  <div className="mt-12 border-t border-[var(--border)] pt-10">
                    <p className="mb-8 text-sm font-medium text-[var(--foreground)]">{dict.upcomingBirthdays}</p>
                    <div className="flex flex-wrap justify-center gap-8">
                      {upcomingPreview.map((p, i) => (
                        <HeroCard key={i} person={p} onClick={setSelectedPerson} lang={lang} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <div className="mb-8 border-b border-[var(--border)]">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {[
              { key: "today", label: dict.tabs.today },
              { key: "yesterday", label: dict.tabs.yesterday },
              { key: "tomorrow", label: dict.tabs.tomorrow },
              { key: "upcoming", label: dict.tabs.upcoming },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-[var(--foreground)] text-[var(--foreground)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <section id="cardGrid" className="mb-16 scroll-mt-24">
          {tabPeople.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-24 text-center">
              <svg className="mx-auto h-12 w-12 text-[var(--border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">{dict.noDataTab}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tabPeople.map((p, i) => (
                <PersonCard key={i} person={p} onClick={setSelectedPerson} lang={lang} />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <div className="font-serif text-5xl font-medium tracking-tight mb-2">{getUniqueCount()}</div>
            <div className="text-sm font-medium uppercase tracking-widest text-[var(--muted-foreground)]">{dict.totalFriends}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <div className="font-serif text-5xl font-medium tracking-tight mb-2">{getMonthCount(todayMonth)}</div>
            <div className="text-sm font-medium uppercase tracking-widest text-[var(--muted-foreground)]">{dict.thisMonth}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <div className="font-serif text-5xl font-medium tracking-tight mb-2">{getAverageAge()}</div>
            <div className="text-sm font-medium uppercase tracking-widest text-[var(--muted-foreground)]">{dict.avgAge}</div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-serif text-2xl font-medium text-[var(--accent)]">{dict.calendar}</h3>
            {monthFilterActive !== null && (
              <button 
                onClick={() => handleTabClick("today")}
                className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {dict.resetFilter}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <div
                key={m}
                onClick={() => handleMonthClick(m)}
                className={`cursor-pointer rounded-xl border p-5 text-center transition-all duration-200 ${
                  monthFilterActive === m
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : m === todayMonth
                    ? "border-[var(--foreground)] bg-[var(--card)]"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                <div className="font-medium mb-2">{monthsArr[m]}</div>
                <div className={`text-2xl font-serif ${monthFilterActive === m ? "text-[var(--background)]" : ""}`}>
                  {monthCounts[m]}
                </div>
                <div className={`text-xs mt-1 ${monthFilterActive === m ? "text-[var(--background)]/80" : "text-[var(--muted-foreground)]"}`}>
                  {dict.people}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-2xl text-center">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder={dict.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-4 pl-14 text-sm outline-none transition-shadow focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)]"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
              {searchResults.map((p, i) => (
                <PersonCard key={i} person={p} onClick={setSelectedPerson} lang={lang} />
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-[var(--muted-foreground)]">{dict.noSearch} "{searchQuery}"</p>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-12 text-center text-sm text-[var(--muted-foreground)]">
        <p className="mb-2">President University Batch 2026</p>
        <p>{dict.footerDept}</p>
      </footer>

      {selectedPerson && (
        <Modal person={selectedPerson} onClose={() => setSelectedPerson(null)} lang={lang} />
      )}
    </>
  );
}
