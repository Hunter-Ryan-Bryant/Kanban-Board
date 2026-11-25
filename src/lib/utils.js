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

export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DUE_SOON = { type: "due_soon", bg: "#451a03", color: "#fcd34d", border: "#b45309" };

export function getDueDateStatus(dueDateStr, taskStatus) {
  if (!dueDateStr) return null;
  if (taskStatus === "done") {
    return {
      type: "completed",
      label: dueDateStr,
      bg: "#064e3b",
      color: "#6ee7b7",
      border: "#047857",
    };
  }

  const [year, month, day] = dueDateStr.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: "overdue",
      label: `Overdue (${dueDateStr})`,
      bg: "#450a0a",
      color: "#fca5a5",
      border: "#991b1b",
    };
  }
  if (diffDays === 0) return { ...DUE_SOON, label: "Due Today" };
  if (diffDays <= 2) return { ...DUE_SOON, label: `Due in ${diffDays}d` };
  return {
    type: "upcoming",
    label: dueDateStr,
    bg: "#1e293b",
    color: "#94a3b8",
    border: "#334155",
  };
}
