import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const message: unknown = isAxiosError<{ message?: unknown }>(error)
    ? error.response?.data?.message
    : error instanceof Error ? error.message : undefined;
  const messages = Array.isArray(message) ? message : [message];
  const text = messages
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry && !/^(null|undefined)$/i.test(entry))
    .join('. ');

  return text || fallback;
}
