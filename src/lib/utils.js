import { clsx } from 'clsx';
/**
 * Minimal `cn` helper used by shadcn/Magic UI registry components.
 * Joins conditional class names; safe with or without tailwind-merge.
 */
export function cn(...inputs) {
    return clsx(inputs);
}
