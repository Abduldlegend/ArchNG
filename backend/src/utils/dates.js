const pad = (value) => String(value).padStart(2, "0");

export const relativeTime = (dateInput, nowInput = new Date()) => {
  const date = new Date(dateInput);
  const now = new Date(nowInput);
  const diffMs = now.getTime() - date.getTime();
  const future = diffMs < 0;
  const seconds = Math.abs(Math.round(diffMs / 1000));

  if (seconds < 45) return future ? "in a moment" : "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return future ? `in ${minutes} min` : `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return future ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return future ? `in ${days}d` : `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return future ? `in ${months}mo` : `${months}mo ago`;
  const years = Math.round(months / 12);
  return future ? `in ${years}y` : `${years}y ago`;
};

export const hoursUntil = (dateInput, nowInput = new Date()) =>
  Math.round((new Date(dateInput).getTime() - new Date(nowInput).getTime()) / (60 * 60 * 1000));

export const deadlineLabel = (dateInput, nowInput = new Date()) => {
  const hours = hoursUntil(dateInput, nowInput);
  if (hours <= 0) return "SLA breached";
  if (hours < 24) return `${hours}h left`;
  const days = Math.ceil(hours / 24);
  return `${days}d left`;
};

export const formatDateTime = (dateInput) => {
  const date = new Date(dateInput);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.000Z`;
};

export const formatDate = (dateInput) => {
  const date = new Date(dateInput);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};
