import { sampleAppointments } from '../data/appointments';
import type { Appointment } from '../types/appointment';

const APPOINTMENTS_KEY = 'medical-appointments';
const FAVORITE_DOCTORS_KEY = 'favorite-doctor-ids';

export const getAppointmentsFromStorage = (): Appointment[] => {
  const data = localStorage.getItem(APPOINTMENTS_KEY);

  if (!data) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleAppointments));
    return sampleAppointments;
  }

  try {
    return JSON.parse(data) as Appointment[];
  } catch {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleAppointments));
    return sampleAppointments;
  }
};

export const saveAppointmentsToStorage = (appointments: Appointment[]): void => {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const addAppointmentToStorage = (appointment: Appointment): Appointment[] => {
  const result = [appointment, ...getAppointmentsFromStorage()];
  saveAppointmentsToStorage(result);
  return result;
};

export const updateAppointmentsInStorage = (appointments: Appointment[]): Appointment[] => {
  saveAppointmentsToStorage(appointments);
  return appointments;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const getFavoriteDoctorIdsFromStorage = (): string[] => {
  const data = localStorage.getItem(FAVORITE_DOCTORS_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(data);
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveFavoriteDoctorIdsToStorage = (ids: string[]): void => {
  localStorage.setItem(FAVORITE_DOCTORS_KEY, JSON.stringify(ids));
};
