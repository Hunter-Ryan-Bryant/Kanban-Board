// Insert or replace a row by id. Realtime echoes our own writes back to us,
// so every handler has to tolerate rows it already has.
export function upsertById(list, row, { prepend = false } = {}) {
  const index = list.findIndex((item) => item.id === row.id);
  if (index === -1) return prepend ? [row, ...list] : [...list, row];
  const next = list.slice();
  next[index] = { ...list[index], ...row };
  return next;
}

export function removeById(list, id) {
  return list.some((item) => item.id === id)
    ? list.filter((item) => item.id !== id)
    : list;
}

export function indexById(list) {
  const map = {};
  list.forEach((item) => {
    map[item.id] = item;
  });
  return map;
}

export function errorMessage(error) {
  return error?.message ?? "no data returned";
}

export function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Parses a "YYYY-MM-DD" date column as a local date (not UTC midnight,
// which can land on the previous day west of Greenwich).
function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// A comment or activity time, as short as it can be without being ambiguous:
// "3:40 PM" today, "Yesterday, 3:40 PM", "Mon, 3:40 PM" within the past
// week, "Nov 3, 3:40 PM" this year, else "Nov 3, 2025".
// `locale` defaults to the user's; tests pass one for stable output.
export function formatTimestamp(timestamp, { locale, now = new Date() } = {}) {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (daysAgo <= 0) return time;
  if (daysAgo === 1) return `Yesterday, ${time}`;
  if (daysAgo < 7) {
    return `${date.toLocaleDateString(locale, { weekday: "short" })}, ${time}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    const day = date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
    return `${day}, ${time}`;
  }
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Full date and time, for a tooltip next to formatTimestamp's short form.
export function formatFullTimestamp(timestamp, { locale } = {}) {
  return new Date(timestamp).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// A "YYYY-MM-DD" due date as "Nov 28", adding the year when it isn't the
// current one ("Jan 4, 2027").
export function formatDueDate(dateStr, { locale, now = new Date() } = {}) {
  const date = parseDateOnly(dateStr);
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

// Joins class names, skipping falsy values: cx("a", cond && "b").
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Returns { type, label } for a task's due date, or null without one.
// `type` is "completed", "overdue", "due_soon" or "upcoming"; TaskCard
// colors the badge from it. `locale` is passed through to formatDueDate.
export function getDueDateStatus(dueDateStr, taskStatus, { locale } = {}) {
  if (!dueDateStr) return null;
  const now = new Date();
  const date = formatDueDate(dueDateStr, { locale, now });
  if (taskStatus === "done") return { type: "completed", label: date };

  const diffDays = Math.round(
    (parseDateOnly(dueDateStr) - startOfDay(now)) / DAY_MS,
  );

  if (diffDays < 0) return { type: "overdue", label: `Overdue · ${date}` };
  if (diffDays === 0) return { type: "due_soon", label: "Due today" };
  if (diffDays === 1) return { type: "due_soon", label: "Due tomorrow" };
  if (diffDays <= 2) return { type: "due_soon", label: `Due in ${diffDays} days` };
  return { type: "upcoming", label: date };
}
