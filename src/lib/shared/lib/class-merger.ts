import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export type WithElementRef<T, ElementType extends HTMLElement = HTMLElement> = T & {
  ref?: ElementType | null
}

export type WithoutChild<T> = Omit<T, 'child'>
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>
