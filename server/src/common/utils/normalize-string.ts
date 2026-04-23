export function normalizeOptionalString(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function normalizeProjectKey(value: string) {
  return value.trim().toUpperCase();
}

