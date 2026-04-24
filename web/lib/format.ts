export function formatDateTime(value?: string | null) {
  if (!value) {
    return "未设置";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "未设置";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeUpdate(value?: string | null) {
  if (!value) {
    return "暂无更新";
  }

  const updatedAt = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor((Date.now() - updatedAt) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前更新`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} 小时前更新`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} 天前更新`;
}

export function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
