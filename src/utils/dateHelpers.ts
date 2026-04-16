export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const today = (): string => toDateKey(new Date());

export const parseDate = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key: string, n: number): string => {
  const d = parseDate(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
};

export const getMonday = (key: string): string => {
  const d = parseDate(key);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
};

export const getWeekDays = (anyDayInWeek: string): string[] => {
  const monday = getMonday(anyDayInWeek);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const getMonthGrid = (year: number, month: number): string[][] => {
  const firstDay = new Date(year, month, 1);
  const firstMonday = getMonday(toDateKey(firstDay));

  const weeks: string[][] = [];
  let current = firstMonday;

  for (let w = 0; w < 6; w++) {
    const week = getWeekDays(current);
    weeks.push(week);

    const lastDayOfWeek = parseDate(week[6]);
    if (lastDayOfWeek.getMonth() > month && lastDayOfWeek.getFullYear() >= year) {
      if (w >= 3) break;
    }

    current = addDays(week[6], 1);
  }

  return weeks;
};

export const isSameMonth = (key: string, year: number, month: number): boolean => {
  const d = parseDate(key);
  return d.getFullYear() === year && d.getMonth() === month;
};
