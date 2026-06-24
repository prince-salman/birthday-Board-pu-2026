import Papa from "papaparse";

export const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const EN_MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const EN_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type Person = {
  name: string;
  nick: string;
  major: string;
  day: number;
  month: number;
  year: number;
  pref: string;
};

export async function fetchLiveBirthdayData(): Promise<Person[]> {
  try {
    const res = await fetch("https://docs.google.com/spreadsheets/d/164chdlhxOvVZZHoXEAmi_pRxIKfm5tYdP-ECc1sMElg/export?format=csv", { cache: "no-store" });
    const csvText = await res.text();
    const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    const liveData: Person[] = result.data.map((row: any) => {
      const rawDateStr = String(row["Tanggal Lahir"]).trim();
      const rawMonthStr = String(row["Bulan lahir"]).trim();
      
      const rawDate = parseInt(rawDateStr) || 1;
      let rawMonth = parseInt(rawMonthStr);
      
      if (isNaN(rawMonth)) {
        let idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === rawMonthStr.toLowerCase());
        if (idx === -1) {
          idx = EN_MONTH_NAMES.findIndex(m => m.toLowerCase() === rawMonthStr.toLowerCase());
        }
        if (idx !== -1 && idx !== 0) {
          rawMonth = idx;
        } else {
          rawMonth = 1; // fallback
        }
      }

      const rawYear = parseInt(row["Tahun Lahir"]) || 2008;

      let pref = row["Preferensi dirayain bagaimana? Contoh\n- Diucapin langsung/chat\n- Diucapin jam 00:00\n- Surprise kecil kecilan\n- Traktir / Ditraktir\n- Bebas sih\n- Ga terlalu suka dirayain"];
      if (!pref) pref = row["Preferensi dirayain bagaimana?"];
      if (!pref) pref = "Bebas";

      return {
        name: row["Nama Lengkap"]?.trim() || "",
        nick: row["Nickname(s)?"]?.trim() || "",
        major: row["Major"]?.trim() || "",
        day: rawDate,
        month: rawMonth,
        year: rawYear,
        pref: pref.trim(),
      };
    }).filter(p => p.name !== "");
    
    return deduplicate(liveData);
  } catch (err) {
    console.error("Failed to fetch live data", err);
    return [];
  }
}

export function getInitials(name: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function calcAge(year: number, month: number, day: number) {
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

export function formatDate(day: number, month: number, lang: "id" | "en" = "id") {
  const months = lang === "id" ? MONTH_NAMES : EN_MONTH_NAMES;
  return `${day} ${months[month]}`;
}

export function formatFullDate(day: number, month: number, year: number, lang: "id" | "en" = "id") {
  const months = lang === "id" ? MONTH_NAMES : EN_MONTH_NAMES;
  return `${day} ${months[month]} ${year}`;
}

export function getDaysUntil(day: number, month: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const refYear = today.getFullYear();
  let birthday = new Date(refYear, month - 1, day);
  if (birthday < today) birthday = new Date(refYear + 1, month - 1, day);
  return Math.round((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function deduplicate(data: Person[]) {
  const map = new Map<string, Person>();
  for (const p of data) {
    const key = p.name.toLowerCase().replace(/\s+/g, "");
    map.set(key, p);
  }
  return Array.from(map.values());
}

export function filterByDate(data: Person[], day: number, month: number) {
  return deduplicate(data.filter((p) => p.day === day && p.month === month));
}

export function getUpcoming(data: Person[], limit: number, refDate?: Date) {
  const ref = refDate || new Date();
  const results: Person[] = [];
  const seen = new Set();

  for (let offset = 1; offset <= 365 && results.length < limit; offset++) {
    const d = new Date(ref);
    d.setDate(d.getDate() + offset);
    const matches = filterByDate(data, d.getDate(), d.getMonth() + 1);
    for (const m of matches) {
      const key = m.name.toLowerCase().replace(/\s+/g, "");
      if (!seen.has(key)) {
        seen.add(key);
        results.push(m);
      }
    }
  }
  return results.slice(0, limit);
}

export function getUniqueCount(data: Person[]) {
  return deduplicate(data).length;
}

export function getMonthCount(data: Person[], month: number) {
  return deduplicate(data.filter((p) => p.month === month)).length;
}

export function getAverageAge(data: Person[]) {
  const unique = deduplicate(data).filter((p) => p.year > 1990);
  if (unique.length === 0) return 0;
  const total = unique.reduce((sum, p) => sum + calcAge(p.year, p.month, p.day), 0);
  return Math.round(total / unique.length);
}

export function getMonthCounts(data: Person[]) {
  const counts: Record<number, number> = {};
  for (let m = 1; m <= 12; m++) counts[m] = getMonthCount(data, m);
  return counts;
}

export function searchPeople(data: Person[], query: string) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return deduplicate(
    data.filter((p) => {
      const searchable = `${p.name} ${p.nick} ${p.major}`.toLowerCase();
      return searchable.includes(q);
    })
  );
}
