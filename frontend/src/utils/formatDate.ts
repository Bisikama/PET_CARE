export function formatDate(
  date: string | Date | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  if (options?.timeStyle || options?.hour || options?.minute || options?.second) {
    return d.toLocaleString('vi-VN', options);
  }
  return d.toLocaleDateString('vi-VN', options ?? {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
