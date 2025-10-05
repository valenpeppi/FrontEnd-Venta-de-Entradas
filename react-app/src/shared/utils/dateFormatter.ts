export const formatLongDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const formatted = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return capitalized.replace(',', '');
};

export const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date) + ' hs';
};
