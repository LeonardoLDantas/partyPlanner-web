export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

import type { GuestStatus, GuestType } from '@/domain/entities/party';
import { expenseCategories, guestTypes, maximumCurrencyAmount, maximumExpectedGuests } from '@/domain/constants/party.constants';

export function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value || 'Data a definir';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatShortDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value || '--/--/----';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  const amount = digits ? Number(digits) / 100 : 0;
  return Math.min(amount, maximumCurrencyAmount);
}

export function formatCurrencyInput(value: string) {
  return currencyFormatter.format(parseCurrencyInput(value));
}

export function formatExpectedGuestsInput(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return Number(digits) > maximumExpectedGuests ? String(maximumExpectedGuests) : digits;
}

export function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatOptionalBudget(value: number | null) {
  return value === null ? 'Não definido' : currencyFormatter.format(value);
}

export function formatBrazilPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^55/, '').slice(0, 11);
  const area = digits.slice(0, 2);
  const first = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const second = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);

  let formatted = '+55';
  if (area) {
    formatted += ` (${area}`;
  }
  if (area.length === 2) {
    formatted += ')';
  }
  if (first) {
    formatted += ` ${first}`;
  }
  if (second) {
    formatted += `-${second}`;
  }

  return formatted.length > 3 ? formatted : '+55 ';
}

export function getExpenseCategoryLabel(value: string) {
  return expenseCategories.find((category) => category.value === value)?.label ?? value;
}

export function getGuestTypeLabel(value: GuestType) {
  return guestTypes.find((type) => type.value === value)?.label ?? value;
}

export function getGuestStatusBadgeClass(status: GuestStatus) {
  if (status === 'Confirmado') {
    return 'border-emerald-300/25 bg-emerald-400/15 text-emerald-200';
  }

  if (status === 'Recusou') {
    return 'border-rose-300/25 bg-rose-400/15 text-rose-200';
  }

  return 'border-orange-300/25 bg-orange-400/15 text-orange-200';
}
