export const isFutureAppointment = (date: string, time: string): boolean => {
  const value = new Date(`${date}T${time}:00`);
  return value.getTime() >= Date.now();
};

export const formatAppointmentDate = (date: string, time: string): string => {
  const value = new Date(`${date}T${time}:00`);
  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTodayInputValue = (): string => new Date().toISOString().slice(0, 10);
