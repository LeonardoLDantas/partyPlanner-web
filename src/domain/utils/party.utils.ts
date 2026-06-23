import type { Party } from '@/domain/entities/party';

export function isUpcomingParty(party: Party) {
  if (party.isFinalized) {
    return false;
  }

  const eventDate = new Date(`${party.date}T${party.time || '00:00'}`);

  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate.getTime() >= today.getTime();
}

export function isEventDateUpcoming(party: Party) {
  const eventDate = new Date(`${party.date}T${party.time || '00:00'}`);
  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  return eventDate.getTime() >= today.getTime();
}

export function getPartyProgress(party: Party) {
  if (party.tasks.length === 0) {
    return 0;
  }

  return Math.round((party.tasks.filter((task) => task.done).length / party.tasks.length) * 100);
}

export function normalizeTaskStatus(status: string, done: boolean) {
  if (done || status === 'Concluída' || status === 'Concluida') {
    return 'Concluída';
  }

  if (status === 'Em andamento') {
    return 'Em andamento';
  }

  return 'Pendente';
}

export function getPartyCoverImage(party?: Pick<Party, 'coverImageUrl' | 'category'> | null) {
  if (party?.coverImageUrl?.trim()) {
    return party.coverImageUrl;
  }

  if (party?.category === 'Casamento') {
    return '/illustrations/wedding-hero.svg';
  }

  if (party?.category === 'Formatura') {
    return '/illustrations/graduation-hero.svg';
  }

  return '/illustrations/birthday-hero.svg';
}

export function getMapsUrl(location: string) {
  return location.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : '';
}

export function getPartyCategoryLabel(value: string) {
  return value === 'Aniversario' ? 'Aniversário' : value;
}

export function getDaysLeftLabel(value: string) {
  const today = new Date();
  const eventDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(eventDate.getTime())) {
    return '--';
  }

  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const days = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);

  if (days < 0) {
    return 'Encerrada';
  }

  if (days === 0) {
    return 'Hoje';
  }

  return `${days} dias`;
}

export function getMobileCountdownDays(value: string) {
  const label = getDaysLeftLabel(value);

  if (label === 'Hoje' || label === 'Encerrada' || label === '--') {
    return '00';
  }

  return label.replace(' dias', '');
}

export function getShortLocation(value: string) {
  return (
    value
      .split('|')[0]
      .split(',')
      .slice(0, 2)
      .join(',')
      .trim() || 'Local a definir'
  );
}
