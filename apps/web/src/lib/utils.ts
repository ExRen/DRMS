import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    return format(new Date(date), 'dd MMM yyyy', { locale: localeId });
}

export function formatDateTime(date: string | Date) {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: localeId });
}

export function formatRelative(date: string | Date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: localeId });
}

export function getStatusBadgeClass(status: string): string {
    const lower = status.toLowerCase();
    return `badge-${lower}`;
}

export function truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}
